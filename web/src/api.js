const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function apiRequest(path, { getToken, method = "GET", body } = {}) {
    const token = getToken ? await getToken() : null;
    const isFormData = body instanceof FormData;
    const response = await fetch(`${apiBaseUrl}${path}`, {
        method,
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(body && !isFormData ? { "Content-Type": "application/json" } : {}),
        },
        body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 204) {
        return null;
    }

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(payload.message || "The request could not be completed.");
    }

    return payload;
}

export { apiRequest };
