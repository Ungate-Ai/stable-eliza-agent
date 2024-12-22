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

export const shouldCreateAgentTemplate =
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

export const createAgentAction: Action = {
    name: "CREATE_AGENT",
    similes: ["CONFIRM_AGENT_DETAILS"],
    description: "Confirm agent details with the user and create the agent",
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        console.log("Create Agent Action validate called");
        const cacheKey = getCacheKey(runtime.character.name, message.userId);
        const userData = await runtime.cacheManager.get<UserData>(cacheKey);

        if (userData && userData.isComplete && !userData.confirmed) {
            return true;
        }

        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        options: any,
        callback: HandlerCallback
    ) => {

        console.log("Create Agent Action Handler called");
        const cacheKey = getCacheKey(runtime.character.name, message.userId);
        let userData = await runtime.cacheManager.get<UserData>(cacheKey);

        if (userData.isComplete && !userData.confirmed) {
            //if (message.content.text.toLowerCase().includes('yes')) {
                userData.confirmed = true;
                await runtime.cacheManager.set(cacheKey, userData);

                // const shouldCreateAgentContext = composeContext({
                //     state,
                //     template: shouldCreateAgentTemplate, // Define this template separately
                // });

                const response = await sendUserDataToApi(runtime, message, userData);
                console.log("Sending user data to API");
                console.log(response);

                // const response = await sendUserDataToApi(runtime, message, userData);
                userData = {
                    name: undefined,
                    description: undefined,
                    walletAddress: undefined,
                    lastUpdated: Date.now(),
                    isComplete: false,
                    confirmed: false,
                    userId: message.userId
                };
                await runtime.cacheManager.set(cacheKey, userData);


                if (response.success) {
                    callback({
                        text: `Your agent has been created successfully. You can view and manage your agent at this link: ${response.agentUrl}\n. Please log in with the wallet address you provided to make changes to your agent.`
                    });
                } else {
                    elizaLogger.error('Failed to create agent:', response.error);
                    callback({
                        text: "Sorry, there was an error creating your agent. Please try again later."
                    });
                }
            // } else {
            //     callback({
            //         text: "No worries, let me know if you'd like to create your agent in the future."
            //     });
            // }

            return true;
        }

        return false;
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