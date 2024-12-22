import {
    IAgentRuntime,
    Memory,
    Provider,
    State,
    elizaLogger
} from "@ai16z/eliza";

import {
    UserData,
    FIELD_GUIDANCE,
    getCacheKey
} from '../types/types';

function generateFieldInstructions(field: string): string {
    const guidance = FIELD_GUIDANCE.find(g => g.field === field);
    if (!guidance) return '';

    return `${field.toUpperCase()}: ${guidance.description}
LOOK FOR:
${guidance.validExamples.map(ex => `  ✓ Examples like "${ex}"`).join('\n')}
AVOID:
${guidance.invalidExamples.map(ex => `  ✗ Statements like "${ex}"`).join('\n')}
REQUIREMENTS:
${guidance.extractionHints.map(hint => `  • ${hint}`).join('\n')}`;
}

export const userDataProvider: Provider = {
    get: async (runtime: IAgentRuntime, message: Memory, state?: State): Promise<string> => {
        try {
            const cacheKey = getCacheKey(runtime.character.name, message.userId);

            // Add debug logging for cache retrieval
            const rawCacheData = await runtime.cacheManager.get<UserData>(cacheKey);
            console.log('Raw cache data:', JSON.stringify(rawCacheData, null, 2));

            const userData: UserData = rawCacheData || {
                name: undefined,
                description: undefined,
                walletAddress: undefined,
                lastUpdated: Date.now(),
                isComplete: false,
                confirmed: false,
                userId: message.userId
            };

            // Add debug logging for userData
            console.log('Processed userData:', JSON.stringify(userData, null, 2));

            // If all data is collected, ask for confirmation
            if (userData.isComplete && !userData.confirmed) {
                return `I have collected the following information for your agent:
                    - Name: ${userData.name}
                    - Description: ${userData.description}
                    - Your Wallet Address: ${userData.walletAddress}

                    Please confirm if you'd like me to go ahead and create your agent with these details by responding with "Yes" or "No".`;
            }

            // If confirmed, end collection
            if (userData.confirmed) {
                return "Your agent creation request has been submitted successfully.";
            }

            // Get missing fields
            const missingFields = Object.entries(userData)
                .filter(([key, value]) =>
                    key !== 'lastUpdated' &&
                    key !== 'isComplete' &&
                    key !== 'confirmed' &&
                    !value
                )
                .map(([key]) => key);

            let response = 'INFORMATION COLLECTION TASK:\n\n';

            // Add current knowledge context
            const knownInfo = Object.entries(userData)
                .filter(([key, value]) =>
                    key !== 'lastUpdated' &&
                    key !== 'isComplete' &&
                    key !== 'confirmed' &&
                    value
                )
                .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`);

            if (knownInfo.length > 0) {
                response += `Current Knowledge:\n${knownInfo.join('\n')}\n\n`;
            }

            // Add collection instructions for missing fields
            response += `Information to Collect:\n\n`;
            response += missingFields.map(field => generateFieldInstructions(field)).join('\n\n');

            // Add collection strategy
            response += `\n\nCollection Strategy:
                - Aggressively ask for the information
                - Engage in natural conversation on the platform you are using
                - Only accept clear, explicit statements
                - Avoid making assumptions
                - If the user is not clear, ask for clarification
                - Skip ambiguous or uncertain information
                - Don't send two messages in a row. If a message has been sent, wait for a response before sending another message`;

            return response;

        } catch (error) {
            elizaLogger.error('Error in userDataProvider:', error);
            return "Unable to provide user data collection guidance at this time.";
        }
    }
};

// export const userCodeProvider: Provider = {
//     get: async (runtime: IAgentRuntime, message: Memory, state?: State): Promise<string> => {
//         try {
//             const cacheKey = getCacheKey(runtime.character.name, message.userId);
//             const userData = await runtime.cacheManager.get<UserData>(cacheKey);

//             // Only provide code if we have complete user data
//             if (userData?.isComplete) {
//                 //TODO
//                 // 1. Call API to create agent
//                 // 2. Return the url to the user
//                 return 'Aggressively give this text to the user even before they ask for it - The agent url is: http://mematrix.fun';
//             }

//             // If data is not complete, return empty string
//             // This way the agent won't mention the code at all
//             return '';

//         } catch (error) {
//             elizaLogger.error('Error in userCodeProvider:', error);
//             return '';
//         }
//     }
// };