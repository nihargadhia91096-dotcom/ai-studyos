const MAX_TITLE_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 20_000;
const MESSAGE_ROLES = new Set(["USER", "ASSISTANT"]);

function requireText(value, field, maxLength) {
    if (typeof value !== "string" || !value.trim()) {
        throw new Error(`${field} must be a non-empty string.`);
    }

    const normalized = value.trim();

    if (normalized.length > maxLength) {
        throw new Error(`${field} must be at most ${maxLength} characters.`);
    }

    return normalized;
}

function createConversationService(prisma) {
    if (!prisma?.user || !prisma?.conversation || !prisma?.message) {
        throw new Error("A Prisma client is required for conversation storage.");
    }

    async function upsertUser({ clerkId, email, name }) {
        const normalizedClerkId = requireText(clerkId, "clerkId", 255);
        const normalizedEmail = requireText(email, "email", 320).toLowerCase();
        const normalizedName = name ? requireText(name, "name", 255) : null;

        return prisma.user.upsert({
            where: { clerkId: normalizedClerkId },
            update: {
                email: normalizedEmail,
                name: normalizedName,
            },
            create: {
                clerkId: normalizedClerkId,
                email: normalizedEmail,
                name: normalizedName,
            },
        });
    }

    async function createConversation({ clerkId, title = "New conversation" }) {
        const normalizedClerkId = requireText(clerkId, "clerkId", 255);
        const normalizedTitle = requireText(title, "title", MAX_TITLE_LENGTH);

        return prisma.conversation.create({
            data: {
                title: normalizedTitle,
                user: {
                    connect: { clerkId: normalizedClerkId },
                },
            },
        });
    }

    async function listConversations(clerkId) {
        const normalizedClerkId = requireText(clerkId, "clerkId", 255);

        return prisma.conversation.findMany({
            where: {
                user: { clerkId: normalizedClerkId },
            },
            orderBy: { updatedAt: "desc" },
            select: {
                id: true,
                title: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: { messages: true },
                },
            },
        });
    }

    async function getConversation(clerkId, conversationId) {
        const normalizedClerkId = requireText(clerkId, "clerkId", 255);
        const normalizedConversationId = requireText(
            conversationId,
            "conversationId",
            255,
        );

        return prisma.conversation.findFirst({
            where: {
                id: normalizedConversationId,
                user: { clerkId: normalizedClerkId },
            },
            include: {
                messages: {
                    orderBy: { createdAt: "asc" },
                },
            },
        });
    }

    async function appendMessage({ clerkId, conversationId, role, content }) {
        const conversation = await getConversation(clerkId, conversationId);

        if (!conversation) {
            throw new Error("Conversation not found.");
        }

        const normalizedRole = requireText(role, "role", 16).toUpperCase();

        if (!MESSAGE_ROLES.has(normalizedRole)) {
            throw new Error("role must be USER or ASSISTANT.");
        }

        const normalizedContent = requireText(content, "content", MAX_MESSAGE_LENGTH);

        return prisma.message.create({
            data: {
                role: normalizedRole,
                content: normalizedContent,
                conversation: {
                    connect: { id: conversation.id },
                },
            },
        });
    }

    async function deleteConversation(clerkId, conversationId) {
        const normalizedClerkId = requireText(clerkId, "clerkId", 255);
        const normalizedConversationId = requireText(
            conversationId,
            "conversationId",
            255,
        );

        const result = await prisma.conversation.deleteMany({
            where: {
                id: normalizedConversationId,
                user: { clerkId: normalizedClerkId },
            },
        });

        return result.count === 1;
    }

    return {
        appendMessage,
        createConversation,
        deleteConversation,
        getConversation,
        listConversations,
        upsertUser,
    };
}

export { createConversationService };
