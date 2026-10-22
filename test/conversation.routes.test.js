import assert from "node:assert/strict";
import test from "node:test";
import { createConversationRouter } from "../src/routes/conversation.routes.js";

function createResponse() {
    return {
        body: undefined,
        statusCode: undefined,
        sent: false,
        json(body) {
            this.body = body;
            return this;
        },
        send() {
            this.sent = true;
            return this;
        },
        status(code) {
            this.statusCode = code;
            return this;
        },
    };
}

function getRouteHandler(router, method, path) {
    const layer = router.stack.find(
        (candidate) =>
            candidate.route?.path === path && candidate.route.methods[method],
    );

    assert.ok(layer, `${method.toUpperCase()} ${path} should be registered`);
    return layer.route.stack[0].handle;
}

test("conversation routes refuse requests without a trusted identity", async () => {
    const router = createConversationRouter({
        getConversationService: async () => {
            throw new Error("The service should not be resolved.");
        },
    });
    const response = createResponse();

    await getRouteHandler(router, "get", "/")({}, response);

    assert.equal(response.statusCode, 401);
    assert.deepEqual(response.body, {
        success: false,
        message: "Authentication is required.",
    });
});

test("conversation routes use the resolved identity instead of request data", async () => {
    const calls = [];
    const router = createConversationRouter({
        getClerkId: () => "clerk_trusted",
        getConversationService: async () => ({
            createConversation: async (input) => {
                calls.push(input);
                return { id: "conversation_1", title: input.title };
            },
        }),
    });
    const response = createResponse();

    await getRouteHandler(router, "post", "/")(
        {
            body: {
                clerkId: "clerk_untrusted",
                title: "Physics notes",
            },
        },
        response,
    );

    assert.deepEqual(calls, [
        { clerkId: "clerk_trusted", title: "Physics notes" },
    ]);
    assert.equal(response.statusCode, 201);
    assert.deepEqual(response.body, {
        success: true,
        conversation: { id: "conversation_1", title: "Physics notes" },
    });
});
