# AI StudyOS 📚

AI StudyOS is an AI-powered study assistant designed to help students understand and interact with their study materials using document processing, semantic search, and Retrieval-Augmented Generation (RAG).

The project is being developed to let users upload study documents and eventually ask questions based on their content.

## 🚀 Current Features

- **PDF Upload:** Upload PDF documents through a REST API.
- **Text Extraction:** Extract readable text from uploaded PDFs.
- **Text Chunking:** Split extracted text into smaller, overlapping chunks for downstream processing.
- **REST API:** Backend built with Node.js and Express.
- **File Upload Handling:** Handle PDF uploads using Multer.
- **Conversation Persistence:** Prisma-backed user, conversation, and message storage with ownership-scoped operations.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Backend REST API |
| pdf-parse | PDF text extraction |
| Multer | File upload handling |
| LangChain.js | Text splitting and future RAG integration |
| ChromaDB | Planned vector storage |
| Google Gemini | Planned embeddings and AI integration |
| Prisma + PostgreSQL | Conversation persistence |
| React + Vite | Authenticated study workspace |
| Clerk | User authentication |

## 📂 Project Structure

```text
ai-studyos/
├── src/
│   ├── routes/
│   │   └── pdf.routes.js
│   ├── services/
│   │   └── chunk.service.js
│   └── app.js
├── documents/          # Uploaded PDFs (excluded from Git)
├── .env                # Environment variables (excluded from Git)
├── .gitignore
├── package.json
└── package-lock.json
```

## ⚙️ Getting Started

### Prerequisites

- Node.js
- npm
- Git
- PostgreSQL
- ChromaDB running at `http://localhost:8000`

### 1. Clone the repository

```bash
git clone https://github.com/nihargadhia91096-dotcom/ai-studyos.git
cd ai-studyos
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root.

Add your Google API key and PostgreSQL connection string:

```env
GOOGLE_API_KEY=your_api_key_here
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/ai_studyos
CLERK_SECRET_KEY=your_clerk_secret_key
FRONTEND_ORIGIN=http://localhost:5173
```

**Security:** Never commit your real API key to GitHub.

For the React client, set these environment variables locally when starting the
frontend (they are intentionally not stored in the repository):

```text
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:5000
```

### 4. Prepare the database

Generate the Prisma client and apply the committed migration to the configured database:

```bash
npm run prisma:generate
npx prisma migrate deploy
```

### 5. Start the development server

```bash
npm run dev
```

The backend runs at:

```text
http://localhost:5000
```

### 6. Start the web app

In a second terminal:

```bash
npm install --prefix web
npm run web:dev
```

Open `http://localhost:5173`, sign in with Clerk, upload a PDF, and begin a
document-grounded study session.

## 🚢 Container deployment

The repository includes a production-oriented Compose stack: React is served by
Nginx on port `8080`, requests under `/api` are proxied to Express, and named
Docker volumes retain PostgreSQL data, Chroma vectors, and uploaded PDFs.

Use your deployment platform's secret manager, or export the following values
in the deployment shell. Do not put them in a committed file:

```text
POSTGRES_PASSWORD
GOOGLE_API_KEY
CLERK_SECRET_KEY
CLERK_PUBLISHABLE_KEY
FRONTEND_ORIGIN
```

`FRONTEND_ORIGIN` must be the public application origin (for example,
`https://study.example.com`; use `http://localhost:8080` for a local Compose
run). Configure that same origin and redirect URL in Clerk, then start:

```bash
docker compose up --build -d
```

The API applies committed Prisma migrations before it starts. After the stack
is healthy, open the configured public origin and verify sign-in, a PDF upload,
and a document-grounded question.

## ▲ Vercel frontend deployment

Vercel hosts the React/Vite frontend only. The Express API, PostgreSQL, Chroma,
and uploaded-document storage are not Vercel functions in this repository; run
the API separately (the included `render.yaml` is the production configuration)
and point the frontend to its public HTTPS URL.

The root `vercel.json` makes the nested `web` app deployable without relying on
Vercel dashboard overrides. Import the repository with its **Root Directory**
set to the repository root, then set these build-time environment variables for
both Production and Preview deployments:

```text
VITE_CLERK_PUBLISHABLE_KEY=pk_...
VITE_API_URL=https://your-ai-studyos-api.onrender.com
```

`VITE_` variables are bundled into the browser application, so only use public
values there—never `CLERK_SECRET_KEY`, `DATABASE_URL`, or `GOOGLE_API_KEY`.
Set `FRONTEND_ORIGIN` on the API to the Vercel production URL (and allow any
preview URL you intend to use). After saving or changing either Vercel variable,
redeploy: Vite reads them during the build, not when the page is opened.

Verify the two services independently after deployment:

```text
https://your-vercel-app.vercel.app/                 # React frontend
https://your-ai-studyos-api.onrender.com/api/health # Express API
```

The API path is intentionally not available at the Vercel URL unless a separate
Vercel API deployment or rewrite is added.

## 🔌 API Endpoints

### Health Check

**GET** `/api/health`

Checks whether the backend is running.

Example response:

```json
{
  "success": true,
  "status": "healthy"
}
```

### PDF Upload

**POST** `/api/pdf/upload`

Uploads a PDF, extracts its text, and splits the extracted text into chunks.

Use Postman with:

- **Method:** `POST`
- **URL:** `http://localhost:5000/api/pdf/upload`
- **Body:** `form-data`
- **Key:** `pdf`
- **Type:** `File`

A successful response includes the filename, page count, number of chunks, and extracted text chunks.

### Conversation API

The conversation routes preserve conversation history independently of the client:

- `GET /api/conversations`
- `POST /api/conversations`
- `GET /api/conversations/:conversationId`
- `POST /api/conversations/:conversationId/messages`
- `DELETE /api/conversations/:conversationId`

These routes require verified authentication middleware to provide the current
user's Clerk ID at `req.auth.userId`. They intentionally reject unauthenticated
requests and never trust a client-supplied user ID. Connect Clerk (or another
identity provider) before exposing them to clients.

## 🗺️ Roadmap

- [x] PDF upload API
- [x] PDF text extraction
- [x] Text chunking
- [x] React study workspace
- [x] Clerk-backed API authentication
- [ ] Generate text embeddings
- [ ] Store embeddings in ChromaDB
- [ ] Implement semantic search
- [ ] Integrate an LLM for document-based question answering
- [ ] Build a frontend for document uploads and chat
- [ ] Connect verified authentication middleware to the conversation API
- [ ] Add document management

## 🔐 Security

- Environment variables are excluded from Git.
- Uploaded documents are excluded from Git.
- Dependencies are excluded from Git and installed using npm.

## 👨‍💻 Author

**Nihar Gadhia**

- GitHub: [nihargadhia91096-dotcom](https://github.com/nihargadhia91096-dotcom)

---

*AI StudyOS is under active development.*
