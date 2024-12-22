import { booleanFooter, elizaLogger } from "@ai16z/eliza";
import {
    Action,
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
} from "@ai16z/eliza";

import {
    UserData,
    getCacheKey
} from '../types/types';
import { constructApiRequest, sendUserDataToApi } from '../types/apiTypes';

export const shouldClearAgentDataTemplate =
    `Based on the conversation so far:

{{recentMessages}}

Should {{agentName}} proceed with the creation of the agent?

Respond with YES if:
- The user is you have collected all the required information using GET_USER_DATA

Otherwise, respond with NO.
`+booleanFooter;

declare const composeContext: ({ state, template, templatingEngine, }: {
    state: State;
    template: string;
    templatingEngine?: "handlebars";
}) => string;

export const clearAgentDataAction: Action = {
    name: "CLEAR_AGENT_DATA",
    similes: ["CLEAR_AGENT_DATA"],
    description: "If the user wants to create an agent, clear the old agent data",
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        options: any,
        callback: HandlerCallback
    ) => {

        console.log("Clear Agent Data Action Handler called");
        const cacheKey = getCacheKey(runtime.character.name, message.userId);
        const userData: UserData = {
            name: undefined,
            description: undefined,
            walletAddress: undefined,
            lastUpdated: Date.now(),
            isComplete: false,
            confirmed: false,
            userId: message.userId
        };
        await runtime.cacheManager.set(cacheKey, userData);

        return true;
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Yes, the details look good, please create my agent"
                },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "Your agent has been created successfully. You can view and manage your agent at this link: https://mematrix.fun/agent/123456\n. Please log in with the wallet address you provided to make changes to your agent.",
                    action: "CREATE_AGENT"
                },
            }
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "No, I changed my mind, don't create the agent yet"
                },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "No worries, let me know if you'd like to create your agent in the future.",
                    action: "CREATE_AGENT"
                }
            }
        ]
    ] as ActionExample[][],
} as Action;