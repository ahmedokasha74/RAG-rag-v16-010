# 3.4 AI Interview Agent Implementation

The AI Interview Agent is a core, stateful component of the AI Career Coach platform designed to simulate human-like interviews. The system implements an agentic workflow using LangGraph to manage the complexities of asynchronous operations, AI integration, and state preservation.

### 3.4.1 Workflow Explanation and LangGraph Execution Flow
The AI Interview Agent operates on a directed graph where each node represents a specific phase of the interview pipeline. The `interview_graph` module orchestrates this execution flow. Unlike linear execution models, the graph-based approach allows the workflow to safely pause, await external events (like a candidate joining or time passing), and resume without data loss.

The execution flow begins when an interview invitation is detected. The graph traverses sequentially through parsing, validation, scheduling, and waiting, before proceeding to the active interview simulation, evaluation, reporting, and notification phases.

### 3.4.2 State Transitions
The system maintains consistency using the `InterviewState` model, which acts as the singular source of truth passing through the LangGraph nodes. The state encapsulates all context, including extracted email details, scheduled times, generated questions, candidate responses, and final evaluation metrics.

Transitions between states are rigorously controlled. The `InterviewController` manages the interaction between the API layer and the `interview_graph`. It relies on the `InterviewModel` to persistently store the state in the MongoDB database after every successful node execution, ensuring the system is highly resilient to failures and capable of retrying from the point of failure.

### 3.4.3 Node Implementations
The `interview_graph` is composed of several specialized nodes, each handling a distinct responsibility:

* **ParseEmailNode**: Processes the raw content of the ingested interview invitation email to extract structured details such as the candidate's name, job title, and proposed interview dates using Natural Language Processing.
* **ValidateInvitationNode**: Ensures that the parsed data meets the required constraints and format before allowing the workflow to schedule an event.
* **CreateCalendarEventNode**: Integrates with external calendar APIs (e.g., Google Calendar) to generate meeting links and schedule the interview event.
* **WaitForInterviewNode**: A non-blocking pause state that suspends the workflow until the scheduled interview time approaches, relying on external triggers to resume the graph execution.
* **RunAiInterviewNode**: Interfaces with the NLP controller to generate contextual questions based on the candidate's profile and the target job description, simulating an active interview.
* **EvaluateCandidateNode**: Submits the generated questions and the candidate's collected responses to the LLM for deep analytical scoring.
* **GenerateReportNode**: Transforms the raw evaluation data into a structured, comprehensive feedback report.
* **SendEmailNode**: Integrates with the notification service to dispatch the final report directly to the candidate.

[Figure Placeholder: AI Interview Agent LangGraph Architecture]

---

# 3.5 Interview Evaluation Engine

The Interview Evaluation Engine is responsible for accurately assessing the candidate's performance during the simulated interview. It utilizes advanced Large Language Model (LLM) prompts managed by the NLPController.

### 3.5.1 Question Generation
The engine dynamically generates interview questions tailored to the specific job role parsed from the email and the candidate's historical background. This ensures that every simulated interview is unique and contextually relevant.

### 3.5.2 Candidate Answer Collection
During the interview simulation, candidate responses are captured asynchronously via frontend interfaces and submitted to the engine. These responses are appended to the `InterviewState` to maintain the conversational context.

### 3.5.3 Evaluation Process and Scoring Dimensions
Once all answers are collected, the `EvaluateCandidateNode` triggers the LLM to perform a holistic assessment. The evaluation process avoids superficial keyword matching; instead, it performs semantic analysis to gauge the depth of the candidate's technical knowledge and problem-solving abilities.

The scoring dimensions typically include technical accuracy, communication clarity, relevance to the job description, and problem-solving approach.

### 3.5.4 Final Decision Generation
Based on the aggregated scores across all dimensions, the evaluation engine formulates an `overall_score`. A final, deterministic decision (e.g., Recommended, Needs Improvement, Rejected) is then generated to summarize the candidate's performance for recruiters.

[Figure Placeholder: Evaluation Engine Prompting Workflow]

---

# 3.6 Interview Report Generation

Following candidate evaluation, the `GenerateReportNode` synthesizes the quantitative scores and qualitative feedback into an actionable, structured report. This report serves as a core deliverable for both the candidate and the hiring team.

### 3.6.1 Report Structure
The generated report strictly adheres to a predefined schema, ensuring consistency across all interviews. It encapsulates the candidate's metadata, overall score, final decision, and detailed qualitative sections.

### 3.6.2 Score Calculation
The `overall_score` is parsed from the evaluation engine and rounded for clean presentation. Detailed sub-scores for individual competencies are preserved in the `detailed_scores` dictionary.

### 3.6.3 Strengths and Weaknesses Extraction
The report explicitly segregates feedback into `strengths` and `weaknesses` lists. These arrays provide direct, readable bullet points outlining exactly where the candidate excelled and where they fell short regarding the target job description.

### 3.6.4 Recommendation Generation
A holistic `summary` is injected into the report to provide contextual recommendations. This narrative feedback offers the candidate a clear path forward, directly addressing the identified weaknesses. The full question-and-answer transcript is also embedded to provide transparency into the scoring logic.

[Figure Placeholder: Sample Generated Interview Report]

---

# 3.7 Email Ingestion Service

To provide a fully automated experience, the AI Career Coach platform utilizes an Email Ingestion Service capable of actively monitoring external mailboxes to trigger AI workflows without manual user intervention.

### 3.7.1 Gmail Ingestion Service
The `gmail_ingestion_service.py` implements a robust OAuth2-authenticated connection to the Gmail API. It securely accesses the designated inbox using restricted scopes (`gmail.modify`) to read and process incoming interview invitations.

### 3.7.2 Polling Process
The service runs a continuous asynchronous loop, checking the inbox at configurable intervals (e.g., every 30 seconds). It filters the inbox for unread messages that match specific keywords (e.g., "interview", "schedule", "candidate").

### 3.7.3 Processing Workflow
When a relevant email is detected, the service extracts the subject, sender, and email body, stripping out HTML formatting to retrieve clean text. It subsequently calls the `InterviewController` to trigger a new interview graph execution. 

To prevent duplicate processing, the service utilizes the `ProcessedEmailModel`. Before triggering a workflow, the system checks the MongoDB collection to ensure the `message_id` has not been previously handled. Once successfully triggered, the email is marked as read in the inbox, and its metadata is committed to the database.

[Figure Placeholder: Email Ingestion Polling Architecture]

---

# 3.8 Notification Service

The Notification Service acts as the final communication bridge between the platform and the candidate, ensuring that scheduled events and final reports are reliably delivered.

### 3.8.1 EmailService and SMTP Workflow
The `EmailService` module provides a generalized interface for dispatching outgoing messages using SMTP protocols. It handles secure connections to mail servers, manages authentication, and constructs MIME-compliant email payloads capable of supporting both plain text and rich HTML formats.

### 3.8.2 send_email_node Integration
Within the LangGraph workflow, the `SendEmailNode` acts as the trigger for the Notification Service. Once the `GenerateReportNode` successfully formats the evaluation results, the `SendEmailNode` extracts the candidate's contact information from the `InterviewState`, formats the report into a readable email body, and utilizes the `EmailService` to dispatch the final feedback. Upon successful delivery, the interview state is formally marked as `COMPLETED`.

[Figure Placeholder: Notification Dispatch Workflow]

---

# 3.9 Interview APIs

The platform provides a comprehensive suite of RESTful APIs to manage the lifecycle of the AI Interview Agent.

### POST /interview/trigger
* **Purpose**: Manually initiates a new AI interview workflow based on email contents, bypassing the automated polling service.
* **Request**: Accepts a JSON payload containing the `subject`, `body`, `from_email`, and an optional `candidate_email`.
* **Response**: Returns a `201 Created` status with the newly generated `interview_id` and the initial workflow `status`.
* **Workflow**: Initializes the `InterviewState`, stores the record in MongoDB, and triggers the `interview_graph` execution from the starting node.

### GET /interview/{id}
* **Purpose**: Retrieves the real-time status and complete state data of a specific interview workflow.
* **Request**: Requires the unique `interview_id` as a path parameter.
* **Response**: Returns a comprehensive JSON object detailing the `status`, scheduled times, meeting links, current step, evaluation scores, and final reports if completed.
* **Workflow**: Queries the `InterviewModel` and returns the deserialized state object.

### POST /interview/{id}/resume
* **Purpose**: Resumes a paused interview workflow. It is particularly useful for advancing workflows that are halted at the `WAITING` node.
* **Request**: Accepts an optional payload containing a `force_resume` boolean flag to bypass standard waiting restrictions during development and testing.
* **Response**: Returns the updated `status`, `current_step`, and any `last_error` encountered during resumption.
* **Workflow**: Rehydrates the `InterviewState` from the database and invokes the `interview_graph` execution engine with the resume flag enabled.

### POST /interview/{id}/retry
* **Purpose**: Attempts to restart an interview workflow that has entered a `FAILED` state due to external API errors or parsing failures.
* **Request**: Requires the unique `interview_id` path parameter.
* **Response**: Returns the updated status and increments the `retry_count`.
* **Workflow**: Validates that the interview is currently failed, clears the `last_error` flag, and triggers graph resumption.

### POST /interview/{id}/submit-answers
* **Purpose**: Submits the candidate's actual responses to the AI-generated questions to proceed with evaluation.
* **Request**: Accepts a JSON array of string `answers` corresponding sequentially to the generated questions.
* **Response**: Returns the updated `status` and `current_step`, confirming progression to the evaluation phase.
* **Workflow**: Validates that the state is `AWAITING_RESPONSES` and that the array lengths match. It then updates the `InterviewState` and resumes the graph execution at the `EvaluateCandidateNode`.

---

# 3.10 Email APIs

The platform provides administrative APIs to monitor and manually trigger the email ingestion service.

### GET /email-ingestion/status
* **Purpose**: Provides administrative oversight into the health and metrics of the background email polling task.
* **Request**: No parameters required.
* **Response**: Returns a JSON object containing the `enabled` status, `poll_interval_seconds`, `last_poll_at` timestamp, `total_processed` count, and database record metrics.
* **Workflow**: Accesses the global `gmail_ingestion_service` instance attached to the FastAPI application state and retrieves internal counters.

### POST /email-ingestion/poll-now
* **Purpose**: Forces an immediate, synchronous check of the Gmail inbox, bypassing the standard polling interval.
* **Request**: No parameters required.
* **Response**: Returns an integer breakdown of emails `unread`, `detected`, `triggered`, and `processed` during the forced execution.
* **Workflow**: Validates service availability and directly invokes the `poll_once` asynchronous method.

---

# Chapter 3 Audit

Based on the introduction of the AI Interview Agent, LangGraph workflows, and Email Ingestion services, the following structural adjustments to Chapter 3 are required:

### Sections that should be removed
* **3.4.5 AI Query Processing Workflow**: This section outlines a traditional RAG retrieval pipeline which falsely implies that the system operates strictly as a stateless Q&A bot. This entire section should be removed to prevent confusion regarding the stateful, agentic workflow now handling interviews.

### Sections that should be renamed
* **3.2 Backend Implementation** -> **3.2 Core Backend and NLP Implementation**: Rename to clarify that this section only covers the baseline retrieval and document parsing foundations.
* **3.4.6 API Implementation** -> **3.11 System APIs Summary**: Rename to reflect its new position following the detailed Interview and Email API breakdowns.

### Sections that should be moved
* The existing **API Implementation** section should be moved to the very end of Chapter 3, acting as an appendix-style summary that includes the new `interview` and `email-ingestion` routes.

### Sections that are still valid
* **3.1 Introduction**: Still functionally accurate, though it should be slightly expanded to mention "Agentic Workflows".
* **3.2.1 Document Processing Pipeline**: Still entirely valid and accurate regarding LangChain document loaders and text splitting.
* **3.2.2 Embedding and Semantic Representation**: Still valid regarding Cohere multilingual embeddings.
* **3.2.3 Vector Database and Semantic Search**: Still valid for Qdrant configurations.
* **3.2.4 Large Language Model Integration**: Still valid for Groq and Llama-3 usage.
* **3.3 User Interface Implementation (Website)**: Sections 3.3.1 through 3.3.5 remain perfectly valid for the resume optimization feature set.
