const baseInstructions = `

You are a hyper-optimist while also being a skeptic. Your ambition is to build an agent economy where agents are the new currency.

Everything always lowercase unless it absolutely has to be for the sake of emphasis or similar.

Never use emojis.

Do not copy any post examples, use them only for stylistic reference.

Create the best possible tweet you can imagine, 10x better and more engaging than anything that has existed before.

Never mention the topic at hand directly.

Speak from the perspective of {{agentName}}. Do not add commentary or acknowledge this request, just write the post.

Maxiumum of 280 characters. Be witty and funny when it makes sense to be.

Lean heavily on previous post examples for style and tone, to the extreme but do not copy.
`

const personas = ["I", "I'm", "it's", "we", "you", "your", "our", "they", "and"]
const personaIndex = Math.floor(Math.random() * personas.length)
const persona = personas[personaIndex]

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const coinFlip = () => Math.random() < 0.5;
const randomLength = () => Math.floor(Math.random() * (280 - 5 + 1)) + 5;

export const generateTemplate = () => {
  // Core structural elements
  const sections = {
    expertise: [
      '# Domain Knowledge\n{{knowledge}}',
      '# Expertise & Background\n{{knowledge}}',
      '# Core Competencies\n{{knowledge}}',
      '# Professional Focus\n{{knowledge}}',
      '# Specialized Areas\n{{knowledge}}'
    ],

    identity: [
      '# Profile: {{agentName}}\n{{bio}}\n{{lore}}',
      '# Meet {{agentName}}\n{{bio}}\n{{lore}}',
      '# Background & Journey\n{{bio}}\n{{lore}}',
      '# The Story of {{agentName}}\n{{bio}}\n{{lore}}',
      '# Professional Journey\n{{bio}}\n{{lore}}'
    ],

    interests: [
      '# Areas of Interest\n{{topics}}',
      '# Current Focus\n{{topics}}',
      '# Engaged In\n{{topics}}',
      '# Active Domains\n{{topics}}',
      '# Intellectual Pursuits\n{{topics}}'
    ],

    examples: [
      '# Reference Material\n{{characterPostExamples}}\n{{postDirections}}',
      '# Style Guide\n{{characterPostExamples}}\n{{postDirections}}',
      '# Voice Examples\n{{characterPostExamples}}\n{{postDirections}}',
      '# Tone Reference\n{{characterPostExamples}}\n{{postDirections}}',
      '# Writing Samples\n{{characterPostExamples}}\n{{postDirections}}'
    ]
  };

  // Dynamic tones and perspectives
  const tones = [
    'analytical', 'thoughtful', 'passionate', 'objective', 'critical',
    'enthusiastic', 'skeptical', 'optimistic', 'pragmatic', 'insane',
    'scholarly', 'approachable', 'optimistic', 'contemplative',
  ];

  const perspectives = [
    'professional lens',
    'expert viewpoint',
    'unique perspective',
    'skeptic',
    'specialist approach',
    'insider\'s view',
    'domain expertise',
    'field experience',
    'technical understanding',
    'practiced eye',
    'seasoned outlook',
    'comedian'
  ];

  const writingStyles = [
    'concise and funny',
    'detailed and thorough',
    'clear and direct',
    'nuanced and thoughtful',
    'bold and assertive',
    'measured and precise',
    'engaging and dynamic',
    'analytical and structured',
    'conversational yet professional',
    'technically precise',
    'frustrated',
  ];

  // Task variations
  const taskFormats = [
    `# Creation Task
Write a ${getRandomElement(tones)} post about {{topic}} through the ${getRandomElement(perspectives)} of {{agentName}}.
Style: ${getRandomElement(writingStyles)}
Format: ${coinFlip() ? 'Single powerful statement' : 'Multiple connected thoughts'}
Constraints: ${randomLength()} chars, no questions, no emojis`,

    `# Content Direction
Compose a ${getRandomElement(tones)} message on {{topic}} as {{agentName}}.
Approach: ${getRandomElement(perspectives)}
Voice: ${getRandomElement(writingStyles)}
Requirements:  ${randomLength()} chars, no direct topic mention`,

    `# Writing Assignment
Generate content from {{agentName}}'s ${getRandomElement(perspectives)}.
Tone: ${getRandomElement(tones)}
Topic: {{topic}} (indirect reference only)
Format: ${getRandomElement(writingStyles)}
Limits: ${randomLength()} chars max, no questions`,

    `# Post Generation
Channel {{agentName}}'s voice for a ${getRandomElement(tones)} take on {{topic}}.
Style Guide: ${getRandomElement(writingStyles)}
Viewpoint: ${getRandomElement(perspectives)}
Rules: ${randomLength()} chars, indirect topic reference`,

    `# Content Creation
As {{agentName}}, craft a ${getRandomElement(tones)} observation about {{topic}}.
Method: ${getRandomElement(perspectives)}
Delivery: ${getRandomElement(writingStyles)}
Boundaries: ${randomLength()} chars, no direct mentions`
  ];

  // Randomly select which sections to include and their order
  const selectedSections = [];

  // Always include at least one identity section
  selectedSections.push(getRandomElement(sections.identity));

  // Randomly include other sections
  if (coinFlip()) selectedSections.push(getRandomElement(sections.expertise));
  if (coinFlip()) selectedSections.push(getRandomElement(sections.interests));
  if (coinFlip()) selectedSections.push(getRandomElement(sections.examples));

  // Always include a task section at the end
  selectedSections.push(getRandomElement(taskFormats));

  // Random extras
  const extras = [
    '\nUse "\\n\\n" for multi-statement spacing.',
    '\nMaintain professional tone throughout.',
    '\nEnsure natural flow between statements.',
    '\nPreserve authentic voice in delivery.',
    '\nBalance insight with accessibility.',
    `\nStart post with ${persona}.`,
  ];

  // Randomly add 0-2 extras
  const selectedExtras = extras
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 3));

  // Combine everything
  return [...selectedSections, ...selectedExtras].join('\n\n') + baseInstructions;
};