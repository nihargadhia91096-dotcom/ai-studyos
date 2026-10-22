import assert from "node:assert/strict";
import test from "node:test";
import { clerkAuthMiddleware } from "../src/middleware/clerk-auth.middleware.js";

test("auth middleware keeps APIs closed when Clerk is not configured", () => {
    const previousSecret = process.env.CLERK_SECRET_KEY;
    delete process.env.CLERK_SECRET_KEY;
    const middleware = clerkAuthMiddleware();
    const request = {};
    let calledNext = false;

    middleware(request, {}, () => {
        calledNext = true;
    });

    assert.equal(calledNext, true);
    assert.deepEqual(request.auth, { isAuthenticated: false, userId: null });

    if (previousSecret) {
        process.env.CLERK_SECRET_KEY = previousSecret;
    }
});
