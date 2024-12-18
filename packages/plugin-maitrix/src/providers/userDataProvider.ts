// src/providers/userData/provider.ts
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

            const userData: UserData = await runtime.cacheManager.get<UserData>(cacheKey) || {
                name: undefined,
                location: undefined,
                occupation: undefined,
                lastUpdated: Date.now(),
                isComplete: false
            };

            // If all data is collected, provide confirmation
            if (userData.isComplete) {
                return `I have collected all necessary information about the user:
- Name: ${userData.name}
- Location: ${userData.location}
- Occupation: ${userData.occupation}

Continue with natural conversation.`;
            }

            // Get missing fields
            const missingFields = Object.entries(userData)
                .filter(([key, value]) =>
                    key !== 'lastUpdated' &&
                    key !== 'isComplete' &&
                    !value
                )
                .map(([key]) => key);

            // Build contextual guidance based on what we know and what we need
            let response = 'INFORMATION COLLECTION TASK:\n\n';

            // Add current knowledge context
            const knownInfo = Object.entries(userData)
                .filter(([key, value]) =>
                    key !== 'lastUpdated' &&
                    key !== 'isComplete' &&
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
• Engage in natural conversation
• Look for opportunities to learn this information
• Only accept clear, explicit statements
• Avoid making assumptions
• Skip ambiguous or uncertain information`;

            return response;

        } catch (error) {
            elizaLogger.error('Error in userDataProvider:', error);
            return "Unable to provide user data collection guidance at this time.";
        }
    }
};