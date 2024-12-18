import { composeContext } from "@ai16z/eliza";
import { generateObjectArray } from "@ai16z/eliza";
import { MemoryManager } from "@ai16z/eliza";
import {
    ActionExample,
    IAgentRuntime,
    Memory,
    ModelClass,
    Evaluator,
} from "@ai16z/eliza";
import { getCacheKey, UserData } from '../types/types';
import { sendUserDataToApi } from '../types/apiTypes';

export const userDataTemplate =
    `TASK: Extract user information from the conversation as a JSON array.

# START OF EXAMPLES
These are examples of the expected output of this task:
{{evaluationExamples}}
# END OF EXAMPLES

# INSTRUCTIONS
Extract specific information about the user from the conversation:
- Extract only directly stated information about the user's name, location, and occupation
- Only include information stated by the user themselves
- Skip any ambiguous or uncertain information
- Ignore information about other people
- Only extract current information (not past or future)

Recent Messages:
{{recentMessages}}

Response should be a JSON array in the following format:
\`\`\`json
[
    {"field": "name", "value": "stated name of user"},
    {"field": "location", "value": "current city/country"},
    {"field": "occupation", "value": "current job"}
]
\`\`\``;

async function handler(runtime: IAgentRuntime, message: Memory) {
    console.log("Handler started", { messageId: message.id, userId: message.userId });
    const state = await runtime.composeState(message);

    console.log("Inside the handler");

    // Generate extraction context
    const context = composeContext({
        state,
        template: userDataTemplate,
    });

    // Extract data from conversation
    const extractedData = await generateObjectArray({
        runtime,
        context,
        modelClass: ModelClass.LARGE,
    }) as Array<{field: string, value: string}>;

    if (!extractedData) {
        return;
    }

    // Get or initialize user data
    const cacheKey = getCacheKey(runtime.character.name, message.userId);
    let userData = await runtime.cacheManager.get<UserData>(cacheKey) || {
        name: undefined,
        location: undefined,
        occupation: undefined,
        lastUpdated: Date.now(),
        isComplete: false
    };

    // Update with new data
    let updated = false;
    for (const data of extractedData) {
        const field = data.field as keyof Omit<UserData, 'lastUpdated' | 'isComplete'>;
        if (!userData[field] && data.value?.trim()) {
            userData[field] = data.value.trim();
            updated = true;
        }
    }

    if (updated) {
        const wasComplete = userData.isComplete;
        userData.isComplete = Boolean(userData.name && userData.location && userData.occupation);
        userData.lastUpdated = Date.now();

        await runtime.cacheManager.set(cacheKey, userData);

        if (userData.isComplete && !wasComplete) {
            await sendUserDataToApi(runtime, message, userData);
        }
    }
}

export const userDataEvaluator: Evaluator = {
    name: "GET_USER_DATA",
    similes: ["EXTRACT_USER_INFO", "GET_USER_INFO", "COLLECT_USER_DATA"],
    validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
        const cacheKey = getCacheKey(runtime.character.name, message.userId);
        const userData = await runtime.cacheManager.get<UserData>(cacheKey);

        console.log("Inside the validate");
        console.log(userData);
        console.log(!userData || !userData.isComplete);

        if (!userData || !userData.isComplete) return true;
        return false;
    },
    description: "Extract user's name, current location, and occupation from natural conversation",
    handler,
    examples: [
        {
            context: `Natural conversation with clear information`,
            messages: [
                {
                    user: "{{user1}}",
                    content: { text: "Hi everyone! I'm Alex Thompson" }
                },
                {
                    user: "{{user2}}",
                    content: { text: "Welcome! Where are you located?" }
                },
                {
                    user: "{{user1}}",
                    content: { text: "I live in Seattle, working as a software engineer" }
                }
            ] as ActionExample[],
            outcome: `\`\`\`json
[
    {"field": "name", "value": "Alex Thompson"},
    {"field": "location", "value": "Seattle"},
    {"field": "occupation", "value": "software engineer"}
]
\`\`\``
        },
        {
            context: `Conversation with indirect or ambiguous information`,
            messages: [
                {
                    user: "{{user1}}",
                    content: { text: "My friend Mike lives in Boston" }
                },
                {
                    user: "{{user2}}",
                    content: { text: "Do you still teach?" }
                },
                {
                    user: "{{user1}}",
                    content: { text: "No, thinking about changing careers" }
                }
            ] as ActionExample[],
            outcome: `\`\`\`json
[]
\`\`\``
        },
        {
            context: `Mixed information with partial valid data`,
            messages: [
                {
                    user: "{{user1}}",
                    content: { text: "I used to live in NYC but moved to Austin last year" }
                },
                {
                    user: "{{user2}}",
                    content: { text: "What do you do there?" }
                },
                {
                    user: "{{user1}}",
                    content: { text: "I'm a graphic designer at a tech startup" }
                }
            ] as ActionExample[],
            outcome: `\`\`\`json
[
    {"field": "location", "value": "Austin"},
    {"field": "occupation", "value": "graphic designer"}
]
\`\`\``
        }
    ],
};