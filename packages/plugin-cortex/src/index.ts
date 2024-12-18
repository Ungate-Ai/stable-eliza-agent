import { Plugin } from "@ai16z/eliza";
import { helloworldAction } from "./actions/helloworld.ts";
import { factEvaluator } from "./evaluators/fact.ts";
import { goalEvaluator } from "./evaluators/goal.ts";
import { randomEmotionProvider } from "./providers/emotion.ts";
import { currentnewsAction } from "./actions";
export * as actions from "./actions";
export * as evaluators from "./evaluators";
export * as providers from "./providers";

export const cortexPlugin: Plugin = {
    name: "cortex",
    description: "Create advanced thinking and planning capabilities for Eliza",
    actions: [
        helloworldAction, currentnewsAction
    ],
    //evaluators: [factEvaluator, goalEvaluator],
    providers: [randomEmotionProvider],
};
