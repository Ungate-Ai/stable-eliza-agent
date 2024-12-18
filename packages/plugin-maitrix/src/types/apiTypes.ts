// src/providers/userData/api.ts
import {
    IAgentRuntime,
    Memory,
    State,
    Evaluator,
    ModelClass,
    ActionExample,
    elizaLogger
} from "@ai16z/eliza";
import { UserData } from "./types";
export interface CreateAgentRequest {
    userId: string;
    agentId: string;
    name: string;
    location: string;
    occupation: string;
    createdAt: number;
    metadata?: {
        dataSource: string;
        confidence: string;
        lastUpdated: number;
    };
}

export async function constructApiRequest(
    runtime: IAgentRuntime,
    message: Memory,
    userData: UserData
): Promise<CreateAgentRequest> {
    return {
        userId: message.userId,
        agentId: runtime.agentId,
        name: userData.name!,
        location: userData.location!,
        occupation: userData.occupation!,
        createdAt: Date.now(),
        metadata: {
            dataSource: 'conversation',
            confidence: 'high',
            lastUpdated: userData.lastUpdated,
        }
    };
}

export async function sendUserDataToApi(
    runtime: IAgentRuntime,
    message: Memory,
    userData: UserData
): Promise<void> {
    try {
        elizaLogger.debug('Constructing API request payload');

        const requestData = await constructApiRequest(runtime, message, userData);
        elizaLogger.debug('API request payload:', requestData);

        const response = await fetch('http://mematrix.fun/mematrix/agents/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const responseData = await response.json();
        elizaLogger.debug('API response:', responseData);

    } catch (error) {
        elizaLogger.error('Failed to send user data to API:', error);
    }
}