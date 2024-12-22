import {
    IAgentRuntime,
    Memory,
    elizaLogger
} from "@ai16z/eliza";
import { UserData } from "./types";

export interface CreateAgentRequest {
    userId: string;
    agentId: string;
    name: string;
    description: string;
    walletAddress: string;
    createdAt: number;
    metadata?: {
        dataSource: string;
        confidence: string;
        lastUpdated: number;
    };
}

export interface CreateAgentResponse {
    success: boolean;
    agentUrl?: string;
    error?: string;
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
        description: userData.description!,
        walletAddress: userData.walletAddress!,
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
): Promise<CreateAgentResponse> {
    try {
        elizaLogger.debug('Constructing API request payload');

        const requestData = await constructApiRequest(runtime, message, userData);
        elizaLogger.debug('API request payload:', requestData);
        const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InNpbTIifQ.eyJzdWIiOiI4OWZlOTFkMy03ODNkLTBhMzYtOWQ4MC04MmJmNjMzZjMxNzIiLCJpYXQiOjE3MzQ2ODYyMDgsImV4cCI6MTczNDc3MjYwOH0.3Xk883hsdCbWYJLTbVzH5IdLGJcVQ5IvkaoNKj0f6UI";
        const body = {
            "agentName": userData.name,
            "agentDescription": userData.description,
            "wallet_address": userData.walletAddress,
            "wallet_chain": "solana"
        };
        console.log("Body:");
        console.log(body);
        const response = await fetch(`https://mematrix.fun/api/mematrix/agents/create/by-agent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + apiKey,
            },
            body: JSON.stringify(body)
        });

        console.log("Response:");
        console.log(response.body);

        if (response.ok) {
            const data = await response.json();
            console.log("Data:");
            console.log(data);
            elizaLogger.debug('API response:', data);

            const agentUrl = data.viewAgentUrl;
            //const agentUrl = `https://mematrix.fun/agent/${agentId}`;

            return {
                success: true,
                agentUrl,
            };
        } else {
            elizaLogger.error('API request failed:', response.status, response.statusText);
            const errorData = await response.json();
            return {
                success: false,
                error: errorData.error || 'Unknown error',
            };
        }
    } catch (error) {
        elizaLogger.error('Failed to send user data to API:', error);
        return {
            success: false,
            error: error.message || 'Unknown error',
        };
    }
}