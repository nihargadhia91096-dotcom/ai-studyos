import express from "express";
import { createConversationService } from "../services/conversation.service.js";

let defaultConversationService;

async function getDefaultConversationService() {
    if (!defaultConversationService) {
        defaultConversationService = import("../services/prisma.service.js").then(
            ({ default: prisma }) => createConversationService(prisma),
        );
    }

    return defaultConversationService;
}

function createConversationRouter({
    getClerkId = (req) => req.auth?.userId,
    getConversationService = getDefaultConversationService,
} = {}) {
    const router = express.Router();

    async function withIdentity(req, res, action) {
        const clerkId = getClerkId(req);

        if (typeof clerkId !== "string" || !clerkId.trim()) {
            return res.status(401).json({
                success: false,
                message: "Authentication is required.",
            });
        }

        try {
            return await action(await getConversationService(), clerkId.trim());
        } catch (error) {
            const status = error.message === "Conversation not found." ? 404 : 400;

            console.error("Conversation API error:", error);
            return res.status(status).json({
                success: false,
                message: error.message,
            });
        }
    }

    router.get("/", async (req, res) => {
        return withIdentity(req, res, async (service, clerkId) => {
            const conversations = await service.listConversations(clerkId);

            return res.status(200).json({ success: true, conversations });
        });
    });

    router.post("/", async (req, res) => {
        return withIdentity(req, res, async (service, clerkId) => {
            const conversation = await service.createConversation({
                clerkId,
                title: req.body?.title,
            });

            return res.status(201).json({ success: true, conversation });
        });
    });

    router.get("/:conversationId", async (req, res) => {
        return withIdentity(req, res, async (service, clerkId) => {
            const conversation = await service.getConversation(
                clerkId,
                req.params.conversationId,
            );

            if (!conversation) {
                return res.status(404).json({
                    success: false,
                    message: "Conversation not found.",
                });
            }

            return res.status(200).json({ success: true, conversation });
        });
    });

    router.post("/:conversationId/messages", async (req, res) => {
        return withIdentity(req, res, async (service, clerkId) => {
            const message = await service.appendMessage({
                clerkId,
                conversationId: req.params.conversationId,
                role: req.body?.role,
                content: req.body?.content,
            });

            return res.status(201).json({ success: true, message });
        });
    });

    router.delete("/:conversationId", async (req, res) => {
        return withIdentity(req, res, async (service, clerkId) => {
            const deleted = await service.deleteConversation(
                clerkId,
                req.params.conversationId,
            );

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: "Conversation not found.",
                });
            }

            return res.status(204).send();
        });
    });

    return router;
}

export { createConversationRouter };
