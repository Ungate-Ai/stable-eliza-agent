// src/providers/userData/types.ts
import path from 'path';

// Core interfaces
export interface UserData {
    name: string | undefined;
    location: string | undefined;
    occupation: string | undefined;
    lastUpdated: number;
    isComplete: boolean;
}

export interface FieldGuidance {
    field: keyof Omit<UserData, 'lastUpdated' | 'isComplete'>;
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
        description: "User's explicitly stated name (first name or full name)",
        validExamples: [
            "Hi, I'm John Smith",
            "My name is Sarah",
            "I'm David, nice to meet you"
        ],
        invalidExamples: [
            "My friend Mike told me",
            "Like James mentioned earlier",
            "Maybe call me Jay"
        ],
        extractionHints: [
            "Must be self-identifying statement",
            "Should be in present tense",
            "Must not be a nickname or temporary name",
            "Should be directly stated, not referenced"
        ]
    },
    {
        field: 'location',
        description: "User's current city, state, or country of residence",
        validExamples: [
            "I live in Seattle",
            "I'm based in New York City",
            "Currently living in London"
        ],
        invalidExamples: [
            "I used to live in Chicago",
            "I'm visiting Paris",
            "Might move to Boston soon"
        ],
        extractionHints: [
            "Must be current residence",
            "Should include city, state, or country",
            "Must not be temporary or past location",
            "Should be specific location, not region"
        ]
    },
    {
        field: 'occupation',
        description: "User's current professional role or employment",
        validExamples: [
            "I work as a software engineer",
            "I'm a high school teacher",
            "Working as an architect"
        ],
        invalidExamples: [
            "Used to be a chef",
            "Studying to become a doctor",
            "Might switch to marketing"
        ],
        extractionHints: [
            "Must be current profession",
            "Should be specific role or field",
            "Must not be past or aspirational",
            "Should indicate active employment"
        ]
    }
];

export function formatFieldGuidance(missingFields: string[]): string {
    return FIELD_GUIDANCE
        .filter(g => missingFields.includes(g.field))
        .map(guidance => `${guidance.field.toUpperCase()}:
• Description: ${guidance.description}
• Looking for statements like:
  ${guidance.validExamples.map(ex => `✓ "${ex}"`).join('\n  ')}
• Ignore statements like:
  ${guidance.invalidExamples.map(ex => `✗ "${ex}"`).join('\n  ')}
• Requirements:
  ${guidance.extractionHints.map(hint => `- ${hint}`).join('\n  ')}
`).join('\n\n');
}

// Template for information extraction
export const userDataExtractionTemplate = `
TASK: Extract user information from conversation messages.

# START OF EXAMPLES
These are examples of the expected output:
{{evaluatorExamples}}
# END OF EXAMPLES

# INSTRUCTIONS
Extract the following information about the user if directly stated:
- Name: Must be self-stated, first name or full name
- Location: Current city/state/country of residence
- Occupation: Current job or profession

Extract ONLY information that is:
- Directly stated by the user
- Current (not past or future)
- Clear and unambiguous
- Matches the example formats

Recent Messages:
{{recentMessages}}

Response must be a JSON array like this:
\`\`\`json
[
    {"field": "name", "value": "exact stated name"},
    {"field": "location", "value": "current location"},
    {"field": "occupation", "value": "current job"}
]
\`\`\`
`;

// Helper function to get cache key
export function getCacheKey(agentName: string, userId: string): string {
    return path.join(BASE_CACHE_KEY, agentName, userId);
}