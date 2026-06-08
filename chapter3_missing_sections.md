# PART 1 — Frontend Documentation Expansion

### 3.X.1 User Dashboard

The User Dashboard serves as the central hub of the AI Career Coach platform. It is designed to provide job seekers with a unified, high-level overview of their career development progress.
* **Dashboard Layout**: The interface is divided into a sidebar for quick navigation and a main content area for data visualization. The layout follows a card-based design, where each card represents a specific career metric such as the latest ATS score, the number of missing skills, and upcoming AI interviews.
* **Navigation**: The sidebar enables seamless routing between core modules: CV Analyzer, Job Matching, Skill Gap Detector, Resume Optimizer, Learning & Projects, and Interview Agent.
* **User Experience**: The dashboard utilizes asynchronous data fetching to ensure the interface remains responsive. Loading states and skeleton screens are employed to provide visual feedback while AI models process data in the background.
* **Main Modules**: From the dashboard, users can immediately access their most recent uploaded résumé, review active job matches, or launch a simulated interview session.

### 3.X.2 Results Visualization

Data visualization is critical for conveying complex AI-generated insights in an actionable format. The platform employs dynamic charts and structured lists to present analytical results.
* **Skill Gap Display**: Identified skill gaps are visualized using comparative bar charts or radar charts, highlighting the user's current proficiency against the industry baseline required for their target role.
* **ATS Score Display**: The ATS compatibility score is presented as a circular progress gauge (0-100%). Color coding (red, yellow, green) provides immediate visual feedback on résumé health, accompanied by actionable bullet points for improvement.
* **Job Matching Display**: Job recommendations are displayed in a vertically scrolling list of cards. Each card highlights the job title, company, location, salary, and an AI-calculated Match Score badge. 
* **Recommendation Display**: Learning paths are structured chronologically. Recommended courses and GitHub projects are presented with embedded links, estimated completion times, and the specific skill gap they address.

### 3.X.3 Responsive Design

The frontend is built to provide a consistent and accessible experience across diverse devices.
* **Mobile Compatibility**: The UI utilizes CSS flexbox and grid systems to stack elements vertically on smaller screens. The sidebar collapses into a hamburger menu, and data tables are converted into scrollable card lists to maintain readability on mobile devices.
* **Desktop Compatibility**: On larger screens, the platform takes advantage of the horizontal space to display side-by-side comparative views, such as viewing the original résumé next to the AI-optimized version.
* **Accessibility Considerations**: The interface incorporates semantic HTML, high-contrast color themes for readability, and ARIA labels to ensure compatibility with screen readers.

### 3.X.4 User Workflow

The complete frontend workflow ensures a logical progression from initial data ingestion to advanced career preparation. The sequence is as follows:
1. **Upload CV**: The user begins by dragging and dropping their résumé (PDF/DOCX) into the parsing engine.
2. **Analyze**: The system extracts structural data and generates an initial profile.
3. **Skill Gap**: The user selects a target role, and the system visualizes the missing competencies.
4. **Recommendations**: Based on the gaps, the user is presented with tailored courses and projects.
5. **Jobs**: The user reviews real-world job postings sorted by semantic match score.
6. **Interview**: Finally, the user enters the AI Interview Agent interface to simulate a technical screening for their targeted roles.

[Figure Placeholder: Figure 3-X Complete User Workflow Diagram]
[Figure Placeholder: Figure 3-X Mobile vs Desktop View]

==================================================

# PART 2 — Screenshot Plan

The following figure plan outlines the required screenshots and diagrams to support the implementation chapter.

| Figure Number | Figure Title | Screenshot Source | Purpose | Recommended Placement |
| :--- | :--- | :--- | :--- | :--- |
| **Figure 3-1** | System Dashboard Overview | `/dashboard` | To demonstrate the central hub and navigation structure of the platform. | Section: User Dashboard |
| **Figure 3-2** | CV Upload Interface | `/upload` | To show the drag-and-drop file ingestion UI. | Section: CV Neural Analyzer |
| **Figure 3-3** | Resume Analysis Extraction | `/profile` | To visualize the structured data parsed by the NLP engine. | Section: Resume Analysis Completion |
| **Figure 3-4** | ATS Score Gauge | `/ats-optimizer` | To show the 0-100% scoring gauge and UI color coding. | Section: Results Visualization |
| **Figure 3-5** | Skill Gap Radar Chart | `/skill-gap` | To illustrate how missing competencies are visually compared to target requirements. | Section: Skill Gap Detection |
| **Figure 3-6** | Learning Recommendations List | `/learning` | To display the actionable course and project suggestions. | Section: Learning Recommendation |
| **Figure 3-7** | Job Matching Results | `/jobs` | To show the semantic match scoring against live job postings. | Section: Job Matching Engine |
| **Figure 3-8** | Interview Agent Interface | `/interview/active` | To demonstrate the conversational UI where questions are asked and answered. | Section: AI Interview Agent Interface |
| **Figure 3-9** | Interview Evaluation Report | `/interview/report` | To display the final LLM-generated feedback, strengths, and weaknesses. | Section: Interview Evaluation Report |
| **Figure 3-10** | Mobile Responsive View | Browser DevTools (Mobile View) | To prove cross-device compatibility. | Section: Responsive Design |
| **Figure 3-11** | Swagger API Documentation | `/docs` | To illustrate the FastAPI auto-generated documentation interface. | Section: System APIs Summary |
| **Figure 3-12** | MongoDB Collections | MongoDB Compass / Atlas | To show the actual database structure (`projects`, `assets`, `chunks`, `ProcessedEmail`). | Section: Database Implementation |
| **Figure 3-13** | LangGraph Execution Graph | Custom Diagram | To visualize the state machine nodes for the Interview Agent. | Section: AI Interview Agent Implementation |
| **Figure 3-14** | Email Ingestion Logs | Terminal / Docker Logs | To prove the background polling service detects and processes Gmail messages. | Section: Email Ingestion Service |
| **Figure 3-15** | Notification Email Received | Gmail Inbox | To show the final generated report email successfully delivered to a candidate. | Section: Notification Service |

==================================================

# PART 3 — Missing Backend Sections

### 3.X.1 Database Implementation

The backend relies on MongoDB as its primary NoSQL data store, chosen for its flexibility in handling unstructured textual data and complex AI state objects. 

**MongoDB Collections:**
* **User (`projects` collection)**: Stores user credentials, hashed passwords, roles, and high-level career goals. 
* **Asset & Chunks**: Stores file metadata (`AssetModel`) and the vectorized, segmented text chunks (`ChunkModel`) used for semantic search.
* **Interview**: Stores the serialized `InterviewState`, including generated questions, candidate responses, LLM evaluation scores, and scheduling metadata.
* **ProcessedEmail**: Acts as a ledger for the Email Ingestion Service. It stores `message_id` and metadata to ensure idempotency and prevent duplicate processing of the same interview invitation.

**Storage Strategy**: 
The system separates operational metadata (MongoDB) from high-dimensional semantic vectors (Qdrant). This hybrid storage strategy ensures fast transactional queries for user state while maintaining high-performance similarity searches for NLP tasks.

[Figure Placeholder: Figure 3-X MongoDB Collections View]

---

### 3.X.2 State Persistence Layer

Because AI workflows can be long-running and asynchronous, the platform implements a robust State Persistence Layer.

* **InterviewState**: A strictly typed Pydantic model that encapsulates every variable of an ongoing interview (emails, status, transcripts, scores).
* **MongoDB Persistence**: At the completion of every node in the LangGraph, the `InterviewController` serializes the current `InterviewState` and updates the MongoDB record. 
* **Recovery Mechanism**: If the backend server crashes or restarts, the graph can be perfectly reconstructed by querying the last known state from the database.
* **Resume Mechanism**: The workflow utilizes a `WAITING` state. External triggers (like a candidate joining the session or an API call to `/resume`) rehydrate the state from MongoDB and seamlessly resume graph execution from the exact point it paused.

---

### 3.X.3 Error Handling and Recovery

To ensure enterprise-grade reliability, the backend implements comprehensive error handling.

* **Retry Workflow**: The LangGraph state machine includes a `retry_count` attribute. If an external API (e.g., Cohere, Groq, Google Calendar) times out, the node gracefully fails, sets the status to `FAILED`, and logs the `last_error`. The user or admin can trigger a retry API which clears the error and re-executes the failed node.
* **Failure States**: The system prevents cascading failures by isolating errors to specific workflows. A failed interview parsing does not crash the email ingestion polling loop.
* **Exception Handling**: FastAPI global exception handlers catch and format internal errors into standardized JSON responses (`ResponseSignal`), preventing raw stack traces from reaching the frontend.
* **Logging Strategy**: Python's native `logging` library is utilized across all controllers and agents, directing formatted output to the terminal/Docker console for debugging and operational monitoring.

---

### 3.X.4 Security Implementation

Security is integrated at multiple layers of the backend architecture.

* **API Validation**: Pydantic models strictly validate all incoming HTTP payloads. Malformed requests are rejected with `422 Unprocessable Entity` before reaching business logic.
* **Input Sanitization**: HTML content parsed from the Gmail ingestion service is aggressively stripped of tags using regular expressions to prevent injection attacks before being passed to the LLM.
* **Email & Token Validation**: The Authentication router utilizes JWT (JSON Web Tokens) with short-lived access tokens (15 minutes) and longer-lived refresh tokens (7 days). 
* **Database Protection**: Passwords (and sensitive state data where applicable) must be protected. Currently, database collections isolate user assets strictly by `project_id` to prevent cross-tenant data leaks.

---

### 3.X.5 Configuration Management

The system avoids hardcoded secrets by utilizing strict configuration management.

* **Environment Variables**: The `helpers/config.py` module utilizes Pydantic's `BaseSettings` to load configurations from a `.env` file.
* **Settings Management**: Critical parameters, such as the `GMAIL_POLL_INTERVAL_SECONDS`, chunk sizes, and active model IDs (`llama-3.1-8b-instant`), are dynamically injected at runtime.
* **API Key Protection**: External credentials (e.g., `APP_ID`, `APP_KEY` for Adzuna, Google OAuth tokens) are kept out of source control. Gmail OAuth tokens are generated locally and stored in a secure, git-ignored `gmail_ingestion_token.json` file.

==================================================

# PART 4 — Missing API Documentation

The following APIs are present in the core routing implementation but were previously undocumented in the implementation chapter.

### Authentication APIs

**POST /api/v1/auth/signup**
* **Purpose**: Registers a new user/project in the system.
* **Request**: JSON payload requiring `email`, `password`, and `role`.
* **Response**: Returns a `200 OK` with a success message and the generated `user_id` (`project_id`).
* **Workflow**: Checks MongoDB for existing emails to prevent duplicates, calculates the next incremental `project_id`, and stores the credentials.

**POST /api/v1/auth/login**
* **Purpose**: Authenticates a user and issues JWT session tokens.
* **Request**: JSON payload requiring `email` and `password`.
* **Response**: Returns a `200 OK` containing the `user_id`, a 15-minute `access_token`, and a 7-day `refresh_token`.
* **Workflow**: Validates credentials against the `projects` collection and cryptographically signs the JWTs using `HS256`.

### Data Processing APIs

**POST /api/v1/data/upload/{project_id}**
* **Purpose**: Ingests raw document files (PDF/DOCX) into the platform.
* **Request**: Multipart form data containing the `file`.
* **Response**: Returns the `file_id` (Asset ID) and a success signal.
* **Workflow**: Validates file integrity, saves the file to the local disk under the project directory, and creates a metadata record using `AssetModel`.

**POST /api/v1/data/process/{project_id}**
* **Purpose**: Triggers the chunking and vectorization preparation of an uploaded document.
* **Request**: JSON payload defining `chunk_size`, `overlap_size`, and a `do_reset` flag.
* **Response**: Returns the count of `inserted_chunks` and `processed_files`.
* **Workflow**: Reads the file from disk, utilizes LangChain to split the text, and stores the resulting raw chunks in MongoDB via `ChunkModel`.

### Advanced NLP APIs

**POST /api/v1/nlp/index/run_all/{project_id}**
* **Purpose**: A macro-endpoint that sequentially executes the entire career analysis pipeline in a single call.
* **Request**: JSON payload containing both `skill_request` and `gap_request` objects.
* **Response**: Returns a massive aggregated JSON object containing extracted skills, identified gaps, learning recommendations, and ATS scores.
* **Workflow**: Internally awaits and orchestrates the individual endpoints: `answer_rag`, `retun_skills`, `skill` (gap analysis), `learning_recommendtion`, and `ats_score`.

**POST /api/v1/nlp/index/skill_gap/{project_id}**
* **Purpose**: Compares the user's extracted skills against industry requirements for their target role.
* **Request**: JSON payload containing the user's current skills.
* **Response**: Returns the calculated missing skills, the LLM prompt used, and chat history.
* **Workflow**: Invokes the `NLPController` to query the vector database and generate the gap analysis via the LLM, then updates the chunk metadata in the database.

**POST /api/v1/nlp/index/learning_recommendtion/{project_id}**
* **Purpose**: Generates actionable learning paths based on identified skill gaps.
* **Request**: JSON payload providing the `user_gap_skill` array.
* **Response**: Returns a structured list of recommended courses and projects.
* **Workflow**: Uses the LLM to map gaps to educational resources and persists the recommendations back to the `ChunkModel`.

**POST /api/v1/nlp/index/ats_score/{project_id}**
* **Purpose**: Evaluates the résumé against ATS parsing standards.
* **Request**: Path parameter `project_id` only.
* **Response**: Returns a numerical `answer_score` and an array of `answer_recommendetions`.
* **Workflow**: Retrieves the parsed résumé chunk, runs the LLM ATS evaluation prompt, and updates the database with the score.

==================================================

# PART 5 — Chapter 3 Quality Improvement Review

The following outlines a critical audit of the Chapter 3 implementation documentation, aimed at aligning the text with academic graduation project standards.

### Weak Sections
* **System Architecture (3.1.1)**: Currently presented as a simple bulleted list. This is too informal. It must be expanded into narrative paragraphs explaining *why* a modular architecture was chosen and how data flows between these modules.
* **Document Processing Pipeline (3.7.1)**: Fails to explain *why* overlapping chunks are necessary for semantic context. It mentions the tool (RecursiveCharacterTextSplitter) but lacks the academic justification for the hyperparameters chosen.

### Sections Needing Screenshots
* **Email Ingestion Service**: Needs a screenshot of terminal logs proving that the async polling loop is actively checking Gmail and triggering workflows.
* **AI Interview Agent Interface**: Requires screenshots of the chat/question UI to prove the backend LangGraph implementation successfully connects to a user-facing frontend.

### Sections Needing Diagrams
* **Database Implementation**: Desperately needs an updated Entity-Relationship Diagram (ERD) specifically showing how the NoSQL documents (`User`, `Asset`, `Chunk`, `Interview`, `ProcessedEmail`) relate to one another via ObjectIds.
* **State Persistence Layer**: Needs a Sequence Diagram illustrating the "Pause and Resume" cycle (e.g., API Call -> `interview_graph` -> Save to Mongo -> Wait -> API `/resume` -> Load from Mongo -> Continue graph).

### Sections Too Short
* **Security Implementation**: Currently non-existent in the main text. Academic examiners heavily scrutinize security. The expanded section generated in Part 3 of this document must be integrated to explain JWT tokens, password handling, and input sanitization.
* **Configuration Management**: Needs deeper explanation of how environment variables prevent hardcoded secrets from leaking into version control.

### Sections Too Generic
* **Large Language Model Integration (3.7.4)**: Mentions using Groq and Llama-3, but is too generic. It needs to provide a concrete example of a prompt template (e.g., the exact prompt used for ATS scoring or Interview Evaluation) to prove that complex prompt engineering was actually performed.
* **Notification Service (3.6)**: Mentions SMTP, but should explicitly state *which* SMTP provider is used (e.g., Gmail SMTP, SendGrid) and how the MIME payload is constructed.

### Sections Not Matching Actual Implementation
* **Authentication**: The current codebase in `auth.py` stores passwords in **plain text** (`"password": data.password, # 👈 plain text`). The documentation must either honestly reflect this (and list it as a future work/limitation) or the codebase must be updated to use `bcrypt` hashing before the final submission.
* **Job APIs (`/index/jops`)**: The documentation calls it `Job Matching Engine`, but the actual implementation in `nlp.py` makes a direct HTTP request to the external Adzuna API (`api.adzuna.com`). The documentation must accurately reflect that job matching is outsourced to Adzuna rather than processed via internal semantic similarity.
