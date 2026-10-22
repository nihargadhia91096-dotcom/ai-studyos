import assert from "node:assert/strict";
import test from "node:test";
import app from "../src/app.js";

test("health endpoint reports a healthy backend", async () => {
    const healthRoute = app.router.stack.find(
        (layer) => layer.route?.path === "/api/health",
    );
    const response = {
        statusCode: undefined,
        body: undefined,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        },
    };

    assert.ok(healthRoute, "health endpoint should be registered");
    healthRoute.route.stack[0].handle({}, response);

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body, {
        success: true,
        status: "healthy",
    });
});
