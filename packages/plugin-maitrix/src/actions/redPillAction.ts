// src/actions/redpillAction.ts
import {
    Action,
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
    elizaLogger,
    generateText,
    ModelClass
} from "@ai16z/eliza";
import { createAgentFromTwitter } from '../types/apiTypes';
import { getCacheKey, UserData } from "../types/types";

const TRIGGER_PHRASES = [
    'agentise me',
    'agentize me',
    'create an ai agent from my twitter profile',
    'give me the blue pill',
    'take the blue pill'
];

export const redPillAction: Action = {
    name: "TAKE_RED_PILL",
    similes: ["CREATE_TWITTER_AGENT", "AGENTIZE", "AGENTISE", "RED_PILL"],
    description: "Create an agent from user's Twitter profile only when the user says 'agentise me', 'agentize me', 'give me the blue pill' or 'take the blue pill' or a variation. When this action is triggered, do not send any other messages than the ones in the callback",

    validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
        const messageText = message.content.text.toLowerCase();

        console.log("Message Text: ");
        console.log(messageText);
        // Check for trigger phrases
        if (TRIGGER_PHRASES.some(phrase => messageText.includes(phrase))) {
            //const cacheKey = getCacheKey(runtime.character.name, message.userId);
            //await runtime.cacheManager.set<boolean>(cacheKey, true);
            return true;
        }
        return false;
    },

    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        options: any,
        callback: HandlerCallback
    ) => {
        const messageText = message.content.text.toLowerCase();


        // If this is a trigger phrase, ask for confirmation
        if (TRIGGER_PHRASES.some(phrase => messageText.includes(phrase))) {
            callback({
                text: `🔴 You want to take the red pill? Share your wallet address to create an AI agent from your Twitter profile.`,
                action: "TAKE_RED_PILL"
            });
            return;
        }

        const context = `
        Extract the wallet address from the user's message. The message is:
        ${message.content.text}

        Only respond with the wallet address, do not include any other text. Wallet address is a variation of 0x742d35Cc6634C0532925a3b844Bc454e4438f44e or 4vBJuhW5fA9up6wG5F8tAPmNRAfERtKL8owGKmGAUPWg
        If wallet address does not exist, then return an empty string
        `

        const walletAddress = await generateText({
            runtime: runtime,
            context,
            modelClass: ModelClass.LARGE,
            stop: ["\n"],
        });

        console.log("Wallet Address: ");
        console.log(walletAddress);

        //if (TRIGGER_PHRASES.some(phrase => messageText.includes(phrase))) {
        if (walletAddress && walletAddress.length > 0) {

            // Get Twitter ID from message.userId
            // Note: This assumes userId is or can be converted to Twitter ID
            const cacheKeyTwitterId = getCacheKey(runtime.character.name, "twitterId");
            const twitterId =await runtime.cacheManager.get<string>(cacheKeyTwitterId);
            console.log("Twitter ID:", twitterId);


            const cacheKey = getCacheKey(runtime.character.name, message.userId);
            const userData = await runtime.cacheManager.get<UserData>(cacheKey);

            const response = await createAgentFromTwitter(runtime, twitterId, walletAddress);

            if (response.success) {
                callback({
                    text: `✨ Welcome to the Matrix! Your agent has been created. You can view and interact with your agent at: ${response.agentUrl}

Remember, this is just the beginning. Your agent will learn and evolve based on your interactions.`
                });
            } else {
                callback({
                    text: "I encountered an issue while creating your agent. Please try again later."
                });
            }
            return;
        } else {
            callback({
                text: "I cannot find your wallet address. Please try again.",
                action: "TAKE_RED_PILL"
            });
            return;
        }
    },

    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "give me the red pill"
                }
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "🔴 You want to take the red pill? Share your wallet address to create an AI agent from your Twitter profile.",
                    action: "TAKE_RED_PILL"
                }
            }
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "agentize me"
                }
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "🔴 You want to take the red pill? Share your wallet address to create an AI agent from your Twitter profile.",
                    action: "TAKE_RED_PILL"
                }
            }
        ]
    ]
};