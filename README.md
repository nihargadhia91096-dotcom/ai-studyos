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
```

**Security:** Never commit your real API key to GitHub.

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
