import { Plugin } from "@ai16z/eliza";
import { helloworldAction } from "./actions/helloworld.ts";
import { currentnewsAction } from "./actions";
import { userDataProvider } from "./providers/userDataProvider.ts";
import { userDataEvaluator } from "./evaluators/userDataEvaluator.ts";

export * as actions from "./actions";
export * as evaluators from "./evaluators";
export * as providers from "./providers";

export const maitrixPlugin: Plugin = {
    name: "maitrix",
    description: "Create new agents with the ability to think and plan",
    actions: [
        helloworldAction, currentnewsAction
    ],
    evaluators: [userDataEvaluator],
    providers: [userDataProvider],
};
