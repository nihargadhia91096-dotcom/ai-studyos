import {
    SignInButton,
    UserButton,
    useAuth,
    useUser,
} from "@clerk/react";
import { useEffect, useState } from "react";
import { apiRequest } from "./api.js";

function App() {
    const { isLoaded, isSignedIn } = useAuth();

    if (!isLoaded) {
        return <main className="setup-card">Loading AI StudyOS…</main>;
    }

    if (isSignedIn) {
        return <StudyWorkspace />;
    }

    return (
        <main className="auth-card">
            <p className="eyebrow">Your private learning workspace</p>
            <h1>Study with your documents, not around them.</h1>
            <p>
                Upload a PDF, ask grounded questions, and return to every saved
                conversation when you need it.
            </p>
            <SignInButton mode="modal">
                <button className="primary-button">Sign in to StudyOS</button>
            </SignInButton>
        </main>
    );
}

function StudyWorkspace() {
    const { getToken } = useAuth();
    const { user } = useUser();
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [question, setQuestion] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState("");

    const currentEmail = user?.primaryEmailAddress?.emailAddress;

    useEffect(() => {
        if (!user || !currentEmail) {
            return;
        }

        async function initializeWorkspace() {
            try {
                await apiRequest("/api/conversations/profile", {
                    getToken,
                    method: "POST",
                    body: {
                        email: currentEmail,
                        name: user.fullName || user.username || null,
                    },
                });
                const payload = await apiRequest("/api/conversations", { getToken });
                setConversations(payload.conversations);
            } catch (requestError) {
                setError(requestError.message);
            } finally {
                setIsLoading(false);
            }
        }

        initializeWorkspace();
    }, [currentEmail, getToken, user]);

    async function openConversation(conversationId) {
        try {
            setError("");
            const payload = await apiRequest(`/api/conversations/${conversationId}`, {
                getToken,
            });
            setActiveConversation(payload.conversation);
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    async function createConversation() {
        try {
            setError("");
            const payload = await apiRequest("/api/conversations", {
                getToken,
                method: "POST",
                body: { title: "New study session" },
            });
            const conversation = { ...payload.conversation, messages: [] };
            setConversations((existing) => [conversation, ...existing]);
            setActiveConversation(conversation);
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    async function uploadDocument(event) {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) {
            return;
        }

        if (file.type !== "application/pdf") {
            setError("Choose a PDF document.");
            return;
        }

        const formData = new FormData();
        formData.append("pdf", file);
        setIsUploading(true);
        setError("");

        try {
            const payload = await apiRequest("/api/pdf/upload", {
                getToken,
                method: "POST",
                body: formData,
            });
            const document = {
                name: payload.filename,
                storageFilename: payload.storageFilename,
                pages: payload.totalPages,
            };
            setDocuments((existing) => [document, ...existing]);
            setSelectedDocument(document);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setIsUploading(false);
        }
    }

    async function askQuestion(event) {
        event.preventDefault();
        const trimmedQuestion = question.trim();

        if (!trimmedQuestion || isSending) {
            return;
        }

        setIsSending(true);
        setError("");

        try {
            let conversation = activeConversation;

            if (!conversation) {
                const payload = await apiRequest("/api/conversations", {
                    getToken,
                    method: "POST",
                    body: { title: trimmedQuestion.slice(0, 80) },
                });
                conversation = { ...payload.conversation, messages: [] };
                setConversations((existing) => [conversation, ...existing]);
                setActiveConversation(conversation);
            }

            const history = conversation.messages.map(({ role, content }) => ({
                role: role.toLowerCase(),
                content,
            }));
            const optimisticUserMessage = { role: "USER", content: trimmedQuestion };
            setActiveConversation((current) => ({
                ...current,
                messages: [...current.messages, optimisticUserMessage],
            }));
            setQuestion("");

            const searchPayload = await apiRequest("/api/pdf/search", {
                getToken,
                method: "POST",
                body: {
                    query: trimmedQuestion,
                    filename: selectedDocument?.storageFilename,
                    history,
                },
            });

            const answerMessage = {
                role: "ASSISTANT",
                content: searchPayload.answer,
                sources: searchPayload.sources,
            };
            await apiRequest(`/api/conversations/${conversation.id}/messages`, {
                getToken,
                method: "POST",
                body: optimisticUserMessage,
            });
            await apiRequest(`/api/conversations/${conversation.id}/messages`, {
                getToken,
                method: "POST",
                body: answerMessage,
            });
            setActiveConversation((current) => ({
                ...current,
                messages: [...current.messages, answerMessage],
            }));
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setIsSending(false);
        }
    }

    return (
        <main className="workspace">
            <aside className="sidebar">
                <div className="brand">AI StudyOS</div>
                <button className="primary-button full-width" onClick={createConversation}>
                    + New session
                </button>
                <div className="conversation-list">
                    {isLoading ? <p>Loading sessions…</p> : null}
                    {conversations.map((conversation) => (
                        <button
                            className={
                                activeConversation?.id === conversation.id
                                    ? "conversation active"
                                    : "conversation"
                            }
                            key={conversation.id}
                            onClick={() => openConversation(conversation.id)}
                        >
                            {conversation.title}
                        </button>
                    ))}
                </div>
                <div className="account"><UserButton /> <span>{user?.firstName || "Account"}</span></div>
            </aside>

            <section className="study-panel">
                <header>
                    <div>
                        <p className="eyebrow">Grounded study assistant</p>
                        <h1>{activeConversation?.title || "Start a study session"}</h1>
                    </div>
                    <label className="upload-button">
                        {isUploading ? "Processing PDF…" : "Upload PDF"}
                        <input accept="application/pdf" disabled={isUploading} onChange={uploadDocument} type="file" />
                    </label>
                </header>

                {documents.length ? (
                    <label className="document-picker">
                        Search within
                        <select
                            onChange={(event) =>
                                setSelectedDocument(
                                    documents.find((document) => document.storageFilename === event.target.value) || null,
                                )
                            }
                            value={selectedDocument?.storageFilename || ""}
                        >
                            <option value="">All uploaded documents</option>
                            {documents.map((document) => (
                                <option key={document.storageFilename} value={document.storageFilename}>
                                    {document.name} · {document.pages} pages
                                </option>
                            ))}
                        </select>
                    </label>
                ) : (
                    <p className="hint">Upload a PDF to begin asking document-grounded questions.</p>
                )}

                {error ? <p className="error-message">{error}</p> : null}

                <div className="messages">
                    {activeConversation?.messages?.map((message, index) => (
                        <article className={`message ${message.role.toLowerCase()}`} key={`${message.createdAt || index}-${message.role}`}>
                            <p>{message.content}</p>
                            {message.sources?.length ? (
                                <details>
                                    <summary>Sources</summary>
                                    {message.sources.map((source) => (
                                        <p className="source" key={`${source.filename}-${source.chunkIndex}`}>
                                            {source.originalName}, page {source.page || "?"}
                                        </p>
                                    ))}
                                </details>
                            ) : null}
                        </article>
                    ))}
                </div>

                <form className="question-form" onSubmit={askQuestion}>
                    <textarea
                        onChange={(event) => setQuestion(event.target.value)}
                        placeholder="Ask about your study material…"
                        value={question}
                    />
                    <button className="primary-button" disabled={isSending} type="submit">
                        {isSending ? "Thinking…" : "Ask"}
                    </button>
                </form>
            </section>
        </main>
    );
}

export default App;
