import path from 'path';

// Core interfaces
export interface UserData {
    name: string | undefined;
    description: string | undefined;
    walletAddress: string | undefined;
    lastUpdated: number;
    isComplete: boolean;
    confirmed: boolean;
    userId: string;
    twitterId: undefined
}

export interface FieldGuidance {
    field: keyof Omit<UserData, 'lastUpdated' | 'isComplete' | 'confirmed'>;
    description: string;
    validExamples: string[];
    invalidExamples: string[];
    extractionHints: string[];
}

// Constants
export const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
export const BASE_CACHE_KEY = 'userdata';

// Field-specific guidance
export const FIELD_GUIDANCE: FieldGuidance[] = [
    {
        field: 'name',
        description: "The desired name for the agent",
        validExamples: [
            "Let's call the agent Alex",
            "Name the agent Ava",
            "The agent's name should be John"
        ],
        invalidExamples: [
            "My friend Mike suggested the name",
            "I had an agent named Jay before",
            "Agents often have names like Alexa or Siri"
        ],
        extractionHints: [
            "Must be a direct statement about the agent's name",
            "Should be in present or future tense",
            "Must not be a reference to other agents or people",
            "Should be a definite, decided name"
        ]
    },
    {
        field: 'description',
        description: "A brief description of the agent's purpose or capabilities",
        validExamples: [
            "The agent should help with scheduling and productivity",
            "It's an AI assistant for managing my tasks",
            "The agent will be focused on providing helpful information and answers"
        ],
        invalidExamples: [
            "I had an agent before that was good at math",
            "Most AI assistants can answer questions",
            "It would be cool if it could also play games"
        ],
        extractionHints: [
            "Must be a direct statement about this agent's description",
            "Should describe intended purpose or capabilities",
            "Must not be a reference to other agents or hypotheticals",
            "Should be specific to this agent"
        ]
    },
    {
        field: 'walletAddress',
        description: "The user's cryptocurrency wallet address",
        validExamples: [
            "My wallet address is 0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
            "0x1234567890123456789012345678901234567890 is my wallet",
            "You can use this address for my wallet: 0x0987654321098765432109876543210987654321"
        ],
        invalidExamples: [
            "I had a different wallet address before",
            "Most wallets have around 40 characters in the address",
            "Let me check what my wallet address is"
        ],
        extractionHints: [
            "Must be a direct statement of the user's wallet address",
            "Should be in the correct format for a wallet address",
            "Must not be a reference to past or other wallets",
            "Should be provided definitively by the user"
        ]
    }
];

export function formatFieldGuidance(missingFields: string[]): string {
    return FIELD_GUIDANCE
        .filter(g => missingFields.includes(g.field))
        .map(guidance => `${guidance.field.toUpperCase()}:
- Description: ${guidance.description}
- Looking for statements like:
  ${guidance.validExamples.map(ex => `✓ "${ex}"`).join('\n  ')}
- Ignore statements like:
  ${guidance.invalidExamples.map(ex => `✗ "${ex}"`).join('\n  ')}
- Requirements:
  ${guidance.extractionHints.map(hint => `- ${hint}`).join('\n  ')}
`).join('\n\n');
}

// Template for information extraction
export const userDataExtractionTemplate = `
TASK: Extract user information from conversation messages.

# START OF EXAMPLES
These are examples of the expected output of this task:
{{evaluatorExamples}}
# END OF EXAMPLES

# INSTRUCTIONS
Extract the following information about the user if directly stated:
- Name: The desired name for the agent
- Description: A brief description of the agent's purpose or capabilities
- Wallet Address: The user's cryptocurrency wallet address

Extract ONLY information that is:
- Directly stated by the user
- Clear and unambiguous
- Matches the example formats

Recent Messages:
{{recentMessages}}

Response must be a JSON array like this:
\`\`\`json
[
    {"field": "name", "value": "exact stated agent name"},
    {"field": "description", "value": "stated agent description"},
    {"field": "walletAddress", "value": "user's provided wallet address"}
]
\`\`\``;

// Helper function to get cache key
export function getCacheKey(agentName: string, userId: string): string {
    return path.join(BASE_CACHE_KEY, agentName, userId);
}