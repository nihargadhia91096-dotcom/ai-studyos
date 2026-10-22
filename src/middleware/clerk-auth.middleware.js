import { clerkMiddleware } from "@clerk/express";

function clerkAuthMiddleware() {
    if (process.env.CLERK_SECRET_KEY) {
        return clerkMiddleware();
    }

    return (req, res, next) => {
        req.auth = { isAuthenticated: false, userId: null };
        next();
    };
}

export { clerkAuthMiddleware };
