import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fetch from "node-fetch"
import {
    AgentRuntime,
    elizaLogger,
    validateCharacterConfig,
} from "@ai16z/eliza";

import { REST, Routes } from "discord.js";

export function createApiRouter(agents: Map<string, AgentRuntime>, directClient) {
    const router = express.Router();

    router.use(cors());
    router.use(bodyParser.json());
    router.use(bodyParser.urlencoded({ extended: true }));

    router.get("/", (req, res) => {
        res.send("Welcome, this is the REST API!");
    });

    router.get("/hello", (req, res) => {
        res.json({ message: "Hello World!" });
    });

    router.get("/agents", (req, res) => {
        const agentsList = Array.from(agents.values()).map((agent) => ({
            id: agent.agentId,
            name: agent.character.name,
            clients: Object.keys(agent.clients),
        }));
        res.json({ agents: agentsList });
    });

    router.get("/agents/:agentId", (req, res) => {
        const agentId = req.params.agentId;
        const agent = agents.get(agentId);

        if (!agent) {
            res.status(404).json({ error: "Agent not found" });
            return;
        }

        res.json({
            id: agent.agentId,
            character: agent.character,
        });
    });

    router.post("/agents/:agentId/set", async (req, res) => {
        const agentId = req.params.agentId;
        console.log('agentId', agentId)
        let agent:AgentRuntime = agents.get(agentId);

        // update character
        if (agent) {
            // stop agent
            agent.stop()
            directClient.unregisterAgent(agent)
            // if it has a different name, the agentId will change
        }

        // load character from body
        const character = req.body
        try {
          validateCharacterConfig(character)
        } catch(e) {
          elizaLogger.error(`Error parsing character: ${e}`);
          res.status(400).json({
            success: false,
            message: e.message,
          });
          return;
        }

        // start it up (and register it)
        agent = await directClient.startAgent(character)
        elizaLogger.log(`${character.name} started`)

        res.json({
            id: character.id,
            character: character,
        });
    });

    router.post("/agents/load-agent", async (req, res) => {
        try {
            if (!process.env.AGENT_PORT || !process.env.AGENT_RUNTIME_MANAGEMENT || process.env.AGENT_RUNTIME_MANAGEMENT === "false") {
                res.status(500).json({ message: "Agent Runtime not initialized for loading" });
                return;
            }

            const response = await fetch(`http://localhost:${process.env.AGENT_PORT}/load-agent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(req.body),
            });

            const data = await response.json();
            res.status(response.status).json(data);
        } catch (error) {
            res.status(500).json({ message: "Error starting agent", error: error.message || error.toString() });
        }
    });

    router.post("/agents/unload-agent", async (req, res) => {
        try {
            const {agentId } = req.query
            if(!agentId){
                res.status(500).json({ message: "Invalid Agent Id" });
                return;
            }
            let agent:AgentRuntime = agents.get(`${agentId}`);
            if (agent) {
                agent.stop()
                directClient.unregisterAgent(agent)
                res.status(200).json({ message: "Agent Stopped Successfully" });

            }else{
                res.status(400).json({ message: "Error starting agent! Agent Not Found" });
            }

        } catch (error) {
            res.status(500).json({ message: "Error stopping agent", error: error.message || error.toString() });
        }
    });

    router.get("/agents/:agentId/channels", async (req, res) => {
        const agentId = req.params.agentId;
        const runtime = agents.get(agentId);

        if (!runtime) {
            res.status(404).json({ error: "Runtime not found" });
            return;
        }

        const API_TOKEN = runtime.getSetting("DISCORD_API_TOKEN") as string;
        const rest = new REST({ version: "10" }).setToken(API_TOKEN);

        try {
            const guilds = (await rest.get(Routes.userGuilds())) as Array<any>;

            res.json({
                id: runtime.agentId,
                guilds: guilds,
                serverCount: guilds.length,
            });
        } catch (error) {
            console.error("Error fetching guilds:", error);
            res.status(500).json({ error: "Failed to fetch guilds" });
        }
    });

    return router;
}
