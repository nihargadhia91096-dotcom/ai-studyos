import { ClerkProvider } from "@clerk/react";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function Root() {
    if (!publishableKey) {
        return (
            <main className="setup-card">
                <p className="eyebrow">Configuration required</p>
                <h1>AI StudyOS needs a Clerk publishable key.</h1>
                <p>
                    Set <code>VITE_CLERK_PUBLISHABLE_KEY</code> in your local
                    environment before starting the web app.
                </p>
            </main>
        );
    }

    return (
        <ClerkProvider publishableKey={publishableKey}>
            <App />
        </ClerkProvider>
    );
}

createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <Root />
    </React.StrictMode>,
);
