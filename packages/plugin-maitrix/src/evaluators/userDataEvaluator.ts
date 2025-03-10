import { composeContext, HandlerCallback, State } from "@ai16z/eliza";
import { generateText } from "@ai16z/eliza";
import {
    ActionExample,
    IAgentRuntime,
    Memory,
    ModelClass,
    Evaluator
} from "@ai16z/eliza";
import { getCacheKey, UserData } from '../types/types';

export const userDataTemplate =
    `TASK: Do not respond to the user if they say 'agentise me', 'agentize me', 'give me the red pill' or a variation of this (this is a trigger phrase for the red pill action). If the user wants to create an agent, then extract agent information like name, description, and wallet address from the user to go ahead and create the agent, as a JSON array from the most recent conversations. Discard values from previous conversations. Always return the most recent values only.

# START OF EXAMPLES
These are examples of the expected output of this task:
{{evaluationExamples}}
# END OF EXAMPLES

# INSTRUCTIONS
Extract specific information about the user from the conversation:
- If user says 'agentise me', 'agentize me', 'give me the blue pill' or a variation, do not continue with the task
- Extract only directly stated information about the user's name for the agent, description for the agent, and the user's wallet address
- Extract the final confirmation from the user after getting all the information to go ahead and create the agent
- Only include information stated by the user themselves
- Skip any ambiguous or uncertain information
- Ignore information about other people
- Each piece of information should be a separate object in the array
- The 'field' property should be one of 'name', 'description', or 'walletAddress'
- The 'value' property should contain the corresponding value as a string
- If no information is found for a field, do not include an object for that field
- The resulting array should be a valid JSON array, with objects separated by commas
- Do not include any other text, formatting, or markup - ONLY the JSON array
- The 'confirmed' field should be a boolean value, true if the user confirms the information, false if they do not

IMPORTANT: Return ONLY the raw JSON array. Do not include any markdown formatting, backticks, or language identifiers.
Recent Messages:
{{recentMessages}}

Response should be ONLY a valid JSON array, like this but not exactly this:
[
    {"field": "name", "value": "stated name for the agent"},
    {"field": "description", "value": "stated description for the agent"},
    {"field": "walletAddress", "value": "user's crypto wallet address"},
    {"field": "confirmed", "value": "if the agent has been created, this should be true, otherwise false"}
]`;

async function handler(runtime: IAgentRuntime,
            message: Memory) {

    console.log("Handler started", { messageId: message.id, userId: message.userId });
    const state = await runtime.composeState(message);

    // Generate extraction context
    const context = composeContext({
        state,
        template: userDataTemplate,
    });

    // Extract data from conversation as text
    const extractedText = await generateText({
        runtime,
        context,
        modelClass: ModelClass.SMALL,
    });

    console.log("Extracted text");
    console.log(extractedText);

    // Parse the extracted text as JSON array
    let extractedData: Array<{field: string, value: string}> = [];
    try {
        extractedData = JSON.parse(extractedText);
    } catch (error) {
        console.error("Error parsing JSON array:", error);
        console.error("Extracted text:", extractedText);
        return;
    }

    if (!extractedData || !Array.isArray(extractedData)) {
        console.warn("Extracted data is not an array:", extractedText);
        return;
    }

    // Filter out objects with missing or invalid field/value properties
    extractedData = extractedData.filter(data =>
        data.field && ['name', 'description', 'walletAddress'].includes(data.field) &&
        data.value && typeof data.value === 'string'
    );

    console.log("Extracted data");
    console.log(extractedData);

    // Get or initialize user data
    const cacheKey = getCacheKey(runtime.character.name, message.userId);
    // let userData = await runtime.cacheManager.get<UserData>(cacheKey) || {
    //     name: undefined,
    //     description: undefined,
    //     walletAddress: undefined,
    //     lastUpdated: Date.now(),
    //     isComplete: false,
    //     confirmed: false,
    //     userId: message.userId
    // };

    let userData =  {
        name: undefined,
        description: undefined,
        walletAddress: undefined,
        lastUpdated: Date.now(),
        isComplete: false,
        confirmed: false,
        userId: message.userId,
        twitterId: undefined
    };

    // Update with new data
    let updated = false;
    for (const data of extractedData) {
        const field = data.field as keyof Omit<UserData, 'lastUpdated' | 'isComplete' | 'confirmed'>;
        if (!userData[field] && data.value?.trim()) {
            userData[field] = data.value.trim();
            updated = true;
        }
    }

    if (updated) {
        userData.isComplete = Boolean(userData.name && userData.description && userData.walletAddress);
        userData.lastUpdated = Date.now();

        await runtime.cacheManager.set(cacheKey, userData);
        // if (userData.isComplete) {
        //     //runtime.actions["CREATE_AGENT"].handler(runtime, message, state, {}, () => {});
        // }
    }
}

export const userDataEvaluator: Evaluator = {
    alwaysRun: true,
    name: "GET_AGENT_DATA",
    similes: ["EXTRACT_AGENT_INFO", "GET_USER_INFO", "COLLECT_DATA", "COLLECT_USER_INFO_FROM_TWEET"],
    validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
        console.log("Validate user data", { messageId: message.id, userId: message.userId });
        const cacheKey = getCacheKey(runtime.character.name, message.userId);
        const userData = await runtime.cacheManager.get<UserData>(cacheKey);

        if (!userData || !userData.isComplete) return true;
        return true;
    },
    description: "Extract agent's name, description, and user's wallet address, and the final confirmation from the user to go ahead and create the agent",
    handler,
    examples: [
        {
            context: `Natural conversation with clear information`,
            messages: [
                {
                    user: "{{user1}}",
                    content: { text: "Let's name the agent Alex" }
                },
                {
                    user: "{{user2}}",
                    content: { text: "The agent should be described as a helpful AI assistant focused on productivity" }
                },
                {
                    user: "{{user1}}",
                    content: { text: "My wallet address is 0x742d35Cc6634C0532925a3b844Bc454e4438f44e" }
                },
                {
                    user: "{{user1}}",
                    content: { text: "My wallet address is 4vBJuhW5fA9up6wG5F8tAPmNRAfERtKL8owGKmGAUPWg" }
                }
            ] as ActionExample[],
            outcome: `[
    {"field": "name", "value": "Alex"},
    {"field": "description", "value": "a helpful AI assistant focused on productivity"},
    {"field": "walletAddress", "value": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"},
    {"field": "confirmed", "value": "true"}
]`
        },
        {
            context: `Conversation with indirect or ambiguous information`,
            messages: [
                {
                    user: "{{user1}}",
                    content: { text: "Maybe we could call it Ava or something" }
                },
                {
                    user: "{{user2}}",
                    content: { text: "An agent that helps with scheduling would be cool" }
                },
                {
                    user: "{{user2}}",
                    content: { text: "I'm not sure about this" }
                }
            ] as ActionExample[],
            outcome: `[]`
        }
    ],
};