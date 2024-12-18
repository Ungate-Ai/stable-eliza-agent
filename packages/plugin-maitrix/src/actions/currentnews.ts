import {
    ActionExample,
    composeContext,
    Content,
    generateText,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    ModelClass,
    State,
    type Action,
} from "@ai16z/eliza";

export const currentnewsAction: Action = {
    name: "CURRENT_NEWS",
    similes: ["NEWS", "GET_NEWS", "GET_CURRENT_NEWS"],
    validate: async (_runtime: IAgentRuntime, _message: Memory) => {
        return true;
    },
    description: "Get the current news for a search term if asked by the user",
    handler: async (
        _runtime: IAgentRuntime,
        _message: Memory,
        _state: State,
        _options: { [key: string]: unknown },
        _callback: HandlerCallback
    ): Promise<boolean> => {

        async function getCurrentNews(searchTerm: string) {
            const response = await fetch(`https://newsapi.org/v2/everything?q=${searchTerm}&sortBy=publishedAt&apiKey=${process.env.NEWS_API_KEY}`);

            const data = await response.json();
            console.log (data)
            return data.articles
                .slice(0, 5)
                .map(
                    (article) =>
                            `${article.title}\n${article.description}\n${article.url}`
                )
                .join("\n\n");
        }

        const context = `
        Extract the search term from the user's message. The message is:
        ${_message.content.text}

        Only respond with the search term, do not include any other text.
        `

        const response = await generateText({
            runtime: _runtime,
            context,
            modelClass: ModelClass.SMALL,
            stop: ["\n"],
        });
        // const context = await composeContext({
        //     state: _state,
        //     template,
        // });

        const searchTerm = response.trim();
        const currentNews = await getCurrentNews(searchTerm);

        const responseText =
            "The current news for the search term " +
            searchTerm +
            " is " +
            currentNews;

        const newMemory: Memory = {
            userId: _message.agentId,
            agentId: _message.agentId,
            roomId: _message.roomId,
            content: {
                text: responseText,
                action: "CURRENT_NEWS_RESPONSE",
                source: _message.content?.source,
            } as Content,
        }

        await _runtime.messageManager.createMemory(newMemory);

        _callback({
            text: `Top News: ${currentNews}`
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
