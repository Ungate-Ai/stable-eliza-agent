import { Plugin } from "@ai16z/eliza";
import { createAgentAction } from "./actions/createAgentAction.ts";
import { userDataProvider } from "./providers/userDataProvider.ts";
import { userDataEvaluator } from "./evaluators/userDataEvaluator.ts";
import { clearAgentDataAction } from "./actions/clearAgentData.ts";
export * as actions from "./actions";
export * as evaluators from "./evaluators";
export * as providers from "./providers";

export const maitrixPlugin: Plugin = {
    name: "maitrix",
    description: "Plugin for creating new agents from user data",
    actions: [ createAgentAction, clearAgentDataAction ],
    evaluators: [ userDataEvaluator ],
    providers: [userDataProvider],
};
