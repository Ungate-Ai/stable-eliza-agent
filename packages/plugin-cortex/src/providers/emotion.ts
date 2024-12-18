import { IAgentRuntime, Memory, Provider, State } from "@ai16z/eliza";

const randomEmotionProvider: Provider = {
    get: async (_runtime: IAgentRuntime, _message: Memory, _state?: State) => {
        const emotions = {
            "Happiness": _runtime.character.name + " is feeling a sense of joy and contentment.",
            "Sadness": _runtime.character.name + " is feeling a sense of sorrow and loss.",
            "Anger": _runtime.character.name + " is feeling a strong sense of displeasure or hostility.",
            "Fear": _runtime.character.name + " experiences an emotional response to a perceived threat.",
            "Surprise": _runtime.character.name + " is feeling a sudden sense of wonder or astonishment.",
            "Disgust": _runtime.character.name + " is feeling a sense of revulsion or distaste.",
            "Excitement": _runtime.character.name + " is feeling a sense of enthusiasm and eagerness.",
            "Jealousy": _runtime.character.name + " is feeling a sense of resentment and insecurity.",
            "Love": _runtime.character.name + " is feeling a strong sense of affection and attachment.",
            "Confusion": _runtime.character.name + " is feeling a sense of uncertainty and disorientation.",
            "Frustration": _runtime.character.name + " is feeling a sense of dissatisfaction and annoyance.",
            "Gratitude": _runtime.character.name + " is feeling a sense of appreciation and thankfulness.",
            "Shame": _runtime.character.name + " is feeling a sense of guilt and self-consciousness.",
            "Pride": _runtime.character.name + " is feeling a sense of satisfaction and accomplishment.",
        };

        const keys = Object.keys(emotions);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        return emotions[randomKey];
    },
};
export { randomEmotionProvider };
