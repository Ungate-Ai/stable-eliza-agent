import {
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
    type Action,
} from "@ai16z/eliza";

export const helloworldAction: Action = {
    name: "HELLO_WORLD",
    similes: ["HELLO"],
    validate: async (_runtime: IAgentRuntime, _message: Memory) => {
        return true;
    },
    description: "Make a cool hello world ASCII art.",
    handler: async (
        _runtime: IAgentRuntime,
        _message: Memory,
        _state: State,
        _options: { [key: string]: unknown },
        _callback: HandlerCallback
    ): Promise<boolean> => {
        const helloWorld = `
This is definitely working!!!
 _   _      _ _         __        __         _     _
| | | | ___| | | ___    \\ \\      / /__  _ __| | __| |
| |_| |/ _ \\ | |/ _ \\    \\ \\ /\\ / / _ \\| '__| |/ _\` |
|  _  |  __/ | | (_) |    \\ V  V / (_) | |  | | (_| |
|_| |_|\\___|_|_|\\___( )    \\_/\\_/ \\___/|_|  |_|\\__,_|
                     |/
`;

        //_callback is like console.log to the users
        _callback({
            text: "Hey, I'm going to think through this"
        });

        //Do Stuff herex
        _callback({
            text: helloWorld
        });

        return true;
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "Please say hello world in ASCII?" },
            },
            {
                user: "{{user2}}",
                content: { text: "", action: "HELLO_WORLD" },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "I want to see a hello world example." },
            },
            {
                user: "{{user2}}",
                content: { text: "", action: "HELLO_WORLD" },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "Please display hello world." },
            },
            {
                user: "{{user2}}",
                content: { text: "", action: "HELLO_WORLD" },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "Show me hello world in ASCII art." },
            },
            {
                user: "{{user2}}",
                content: { text: "", action: "HELLO_WORLD" },
            },
        ],
    ] as ActionExample[][],
} as Action;
