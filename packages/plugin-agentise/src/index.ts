import { Plugin } from "@ai16z/eliza";
import { createAgentAction } from "./actions/createAgentAction.ts";
import { userDataProvider } from "./providers/userDataProvider.ts";
import { userDataEvaluator } from "./evaluators/userDataEvaluator.ts";
//import { redPillAction } from "./actions/redPillAction.ts";
export * as actions from "./actions";
export * as evaluators from "./evaluators";
export * as providers from "./providers";

export const agentisePlugin: Plugin = {
    name: "agentise",
    description: "Plugin to agentise twitter accounts",
    actions: [ createAgentAction ],
    evaluators: [ userDataEvaluator ],
    providers: [userDataProvider],
};
