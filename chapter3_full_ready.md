# Chapter 3: Implementation

## 3.1 Introduction

This chapter presents the implementation phase of the AI Career Coach platform and explains how the system was developed using modern web technologies, Artificial Intelligence techniques, and Natural Language Processing (NLP) models. The implementation process focused on building a scalable, modular, and intelligent platform capable of analyzing résumés, identifying skill gaps, matching candidates with suitable job opportunities, generating personalized learning recommendations, and conducting fully automated AI interviews.

The system was implemented using a client-server architecture in which the frontend interface communicates with backend APIs responsible for résumé processing, AI analysis, recommendation generation, conversational agents, and database management. The implementation integrates multiple technologies and frameworks to ensure high performance, maintainability, and scalability.

The frontend layer was developed to provide a modern and user-friendly interface that allows users to upload résumés, view analysis results, track skill gaps, and access learning recommendations through an interactive dashboard. The backend layer handles authentication, résumé parsing, NLP pipelines, semantic matching, conversational state management, recommendation generation, and communication with external APIs and databases.

To enhance the intelligence of the platform, the system leverages pre-trained transformer models and external AI APIs for semantic analysis, skill extraction, and résumé-to-job matching. This approach improves accuracy while reducing the complexity and computational cost associated with training deep learning models from scratch.

This chapter describes the implementation of the main system modules, including frontend development, core backend APIs, agentic AI workflows, job matching algorithms, skill gap analysis, recommendation systems, database integration, security mechanisms, and deployment architecture. It also highlights the tools, frameworks, and methodologies used to ensure the successful development of the AI Career Coach platform.

### 3.1.1 System Architecture

The AI Career Coach system was implemented using a modular architecture to ensure scalability, maintainability, and flexibility. The system consists of multiple interconnected modules including:
* Frontend Interface
* Backend API
* Resume Processing Engine
* NLP & AI Processing Modules
* Job Matching Engine
* Skill Gap Detection Module
* Recommendation Engine
* AI Interview Agent & State Manager
* Email Ingestion Engine
* Database & File Storage

Each module communicates through REST APIs and internal service calls to provide seamless system functionality.

### 3.1.2 User Interface Implementation (Website)

The AI Career Coach platform provides a modern and interactive user interface designed to simplify résumé analysis and career guidance processes. The interface was implemented using React.js with a responsive dashboard layout to ensure usability, accessibility, and smooth user interaction.

The dashboard integrates multiple intelligent modules including CV analysis, job matching, skill gap detection, résumé optimization, and personalized learning recommendations.

### 3.1.3 CV Neural Analyzer

The CV Neural Analyzer interface represents the initial stage of the AI Career Coach workflow. This module allows users to upload their résumés in supported formats such as PDF and DOCX through an interactive drag-and-drop interface.
The system validates the uploaded file based on:
(File type, File size, Upload integrity)

After successful validation, the résumé is forwarded to the parsing engine where text extraction and preprocessing operations are performed. The interface then allows the user to start the NLP analysis pipeline through the "Analyze Target Document" operation.

[Figure Placeholder: Figure 3-1 CV Upload and Parsing Interface]

### 3.1.4 Resume Analysis Completion Interface

The Resume Analysis Completion interface confirms the successful execution of the résumé parsing and NLP analysis pipeline. After processing the uploaded résumé, the system extracts structural and semantic information such as skills, educational background, work experience, technical keywords, and career-related entities.

The interface then displays the processed document information and provides the user with several interactive operations, including uploading another résumé, viewing the extracted profile data, or running the complete NLP analysis pipeline for deeper processing.

[Figure Placeholder: Figure 3-2 Resume Analysis Completion Interface]

### 3.1.5 Skill Gap Detection Interface

The Skill Gap Detection interface presents the missing or underdeveloped competencies identified after analyzing the user’s résumé and comparing it with target job requirements. The detected missing skills are displayed through an interactive dashboard to provide users with a clear understanding of the areas that require improvement.

[Figure Placeholder: Figure 3-3 Skill Gap Detection Interface]

### 3.1.6 Learning and Projects Recommendation Interface

The Learning and Projects Recommendation interface generates personalized learning resources based on the skill gaps identified during résumé analysis. The system recommends online courses, technical learning materials, and practical GitHub projects that align with the user’s missing competencies.

[Figure Placeholder: Figure 3-4 Learning and Projects Recommendation Interface]

### 3.1.7 Job Matching Engine Interface

The Job Matching Engine interface presents AI-generated job recommendations based on semantic similarity analysis between the user’s résumé and available job descriptions. The interface displays detailed job information including job title, company name, location, salary range, and application links.

[Figure Placeholder: Figure 3-5 Job Matching Engine Interface]

### 3.1.8 AI Interview Agent Interface

The AI Interview Agent interface provides a seamless environment where candidates can interact directly with the conversational AI. This interface displays the dynamically generated questions based on the candidate's parsed résumé and allows them to submit their answers. It is designed to simulate a real-world interview setting, providing clear instructions, progress tracking through the questions, and an intuitive submission process.

[Figure Placeholder: Figure 3-6 AI Interview Agent Interface]

### 3.1.9 Interview Evaluation Report Interface

Once the interview concludes and the evaluation engine processes the answers, the results are displayed on the Interview Evaluation Report interface. This dashboard presents the candidate's overall score, final hiring decision, and a detailed breakdown of their strengths and weaknesses. The UI ensures that candidates receive actionable, transparent feedback mapped directly to the target job requirements.

[Figure Placeholder: Figure 3-7 Interview Evaluation Report Interface]

---

## 3.2 AI Interview Agent Implementation

The AI Interview Agent is a core, stateful component of the AI Career Coach platform designed to simulate human-like interviews. The system implements an agentic workflow using LangGraph to manage the complexities of asynchronous operations, AI integration, and state preservation.

### 3.2.1 Workflow Explanation and LangGraph Execution Flow
The AI Interview Agent operates on a directed graph where each node represents a specific phase of the interview pipeline. The `interview_graph` module orchestrates this execution flow. Unlike linear execution models, the graph-based approach allows the workflow to safely pause, await external events (like a candidate joining or time passing), and resume without data loss.

The execution flow begins when an interview invitation is detected. The graph traverses sequentially through parsing, validation, scheduling, and waiting, before proceeding to the active interview simulation, evaluation, reporting, and notification phases.

### 3.2.2 State Transitions
The system maintains consistency using the `InterviewState` model, which acts as the singular source of truth passing through the LangGraph nodes. The state encapsulates all context, including extracted email details, scheduled times, generated questions, candidate responses, and final evaluation metrics.

Transitions between states are rigorously controlled. The `InterviewController` manages the interaction between the API layer and the `interview_graph`. It relies on the `InterviewModel` to persistently store the state in the MongoDB database after every successful node execution, ensuring the system is highly resilient to failures and capable of retrying from the point of failure.

### 3.2.3 Node Implementations
The `interview_graph` is composed of several specialized nodes, each handling a distinct responsibility:

* **ParseEmailNode**: Processes the raw content of the ingested interview invitation email to extract structured details such as the candidate's name, job title, and proposed interview dates using Natural Language Processing.
* **ValidateInvitationNode**: Ensures that the parsed data meets the required constraints and format before allowing the workflow to schedule an event.
* **CreateCalendarEventNode**: Integrates with external calendar APIs (e.g., Google Calendar) to generate meeting links and schedule the interview event.
* **WaitForInterviewNode**: A non-blocking pause state that suspends the workflow until the scheduled interview time approaches, relying on external triggers to resume the graph execution.
* **RunAiInterviewNode**: Interfaces with the NLP controller to generate contextual questions based on the candidate's profile and the target job description, simulating an active interview.
* **EvaluateCandidateNode**: Submits the generated questions and the candidate's collected responses to the LLM for deep analytical scoring.
* **GenerateReportNode**: Transforms the raw evaluation data into a structured, comprehensive feedback report.
* **SendEmailNode**: Integrates with the notification service to dispatch the final report directly to the candidate.

[Figure Placeholder: Figure 3-8 AI Interview Agent LangGraph Architecture]

---

## 3.3 Interview Evaluation Engine

The Interview Evaluation Engine is responsible for accurately assessing the candidate's performance during the simulated interview. It utilizes advanced Large Language Model (LLM) prompts managed by the NLPController.

### 3.3.1 Question Generation
The engine dynamically generates interview questions tailored to the specific job role parsed from the email and the candidate's historical background. This ensures that every simulated interview is unique and contextually relevant.

### 3.3.2 Candidate Answer Collection
During the interview simulation, candidate responses are captured asynchronously via frontend interfaces and submitted to the engine. These responses are appended to the `InterviewState` to maintain the conversational context.

### 3.3.3 Evaluation Process and Scoring Dimensions
Once all answers are collected, the `EvaluateCandidateNode` triggers the LLM to perform a holistic assessment. The evaluation process avoids superficial keyword matching; instead, it performs semantic analysis to gauge the depth of the candidate's technical knowledge and problem-solving abilities.

The scoring dimensions typically include technical accuracy, communication clarity, relevance to the job description, and problem-solving approach.

### 3.3.4 Final Decision Generation
Based on the aggregated scores across all dimensions, the evaluation engine formulates an `overall_score`. A final, deterministic decision (e.g., Recommended, Needs Improvement, Rejected) is then generated to summarize the candidate's performance for recruiters.

[Figure Placeholder: Figure 3-9 Evaluation Engine Prompting Workflow]

---

## 3.4 Interview Report Generation

Following candidate evaluation, the `GenerateReportNode` synthesizes the quantitative scores and qualitative feedback into an actionable, structured report. This report serves as a core deliverable for both the candidate and the hiring team.

### 3.4.1 Report Structure
The generated report strictly adheres to a predefined schema, ensuring consistency across all interviews. It encapsulates the candidate's metadata, overall score, final decision, and detailed qualitative sections.

### 3.4.2 Score Calculation
The `overall_score` is parsed from the evaluation engine and rounded for clean presentation. Detailed sub-scores for individual competencies are preserved in the `detailed_scores` dictionary.

### 3.4.3 Strengths and Weaknesses Extraction
The report explicitly segregates feedback into `strengths` and `weaknesses` lists. These arrays provide direct, readable bullet points outlining exactly where the candidate excelled and where they fell short regarding the target job description.

### 3.4.4 Recommendation Generation
A holistic `summary` is injected into the report to provide contextual recommendations. This narrative feedback offers the candidate a clear path forward, directly addressing the identified weaknesses. The full question-and-answer transcript is also embedded to provide transparency into the scoring logic.

[Figure Placeholder: Figure 3-10 Sample Generated Interview Report]

---

## 3.5 Email Ingestion Service

To provide a fully automated experience, the AI Career Coach platform utilizes an Email Ingestion Service capable of actively monitoring external mailboxes to trigger AI workflows without manual user intervention.

### 3.5.1 Gmail Ingestion Service
The `gmail_ingestion_service.py` implements a robust OAuth2-authenticated connection to the Gmail API. It securely accesses the designated inbox using restricted scopes (`gmail.modify`) to read and process incoming interview invitations.

### 3.5.2 Polling Process
The service runs a continuous asynchronous loop, checking the inbox at configurable intervals (e.g., every 30 seconds). It filters the inbox for unread messages that match specific keywords (e.g., "interview", "schedule", "candidate").

### 3.5.3 Processing Workflow
When a relevant email is detected, the service extracts the subject, sender, and email body, stripping out HTML formatting to retrieve clean text. It subsequently calls the `InterviewController` to trigger a new interview graph execution. 

To prevent duplicate processing, the service utilizes the `ProcessedEmailModel`. Before triggering a workflow, the system checks the MongoDB collection to ensure the `message_id` has not been previously handled. Once successfully triggered, the email is marked as read in the inbox, and its metadata is committed to the database.

[Figure Placeholder: Figure 3-11 Email Ingestion Polling Architecture]

---

## 3.6 Notification Service

The Notification Service acts as the final communication bridge between the platform and the candidate, ensuring that scheduled events and final reports are reliably delivered.

### 3.6.1 EmailService and SMTP Workflow
The `EmailService` module provides a generalized interface for dispatching outgoing messages using SMTP protocols. It handles secure connections to mail servers, manages authentication, and constructs MIME-compliant email payloads capable of supporting both plain text and rich HTML formats.

### 3.6.2 send_email_node Integration
Within the LangGraph workflow, the `SendEmailNode` acts as the trigger for the Notification Service. Once the `GenerateReportNode` successfully formats the evaluation results, the `SendEmailNode` extracts the candidate's contact information from the `InterviewState`, formats the report into a readable email body, and utilizes the `EmailService` to dispatch the final feedback. Upon successful delivery, the interview state is formally marked as `COMPLETED`.

---

## 3.7 Core Backend and NLP Implementation

The backend of the AI Career Coach system was implemented using the FastAPI framework due to its high performance, asynchronous capabilities, and ease of integration with modern AI technologies. The backend acts as the core component responsible for handling document processing, embedding generation, vector database communication, retrieval operations, and interaction with Large Language Models (LLMs).

The system follows a modular architecture to improve maintainability, scalability, and code organization. Each module is designed to perform a specific task independently, which simplifies future development and debugging processes.

The backend was developed using asynchronous programming techniques to improve response speed and allow efficient handling of multiple requests simultaneously. FastAPI provides native support for asynchronous endpoints, which enhances the overall system performance, especially during AI model communication and database operations.

### 3.7.1 Document Processing Pipeline

The Document Processing Pipeline is responsible for handling uploaded files and preparing their content for semantic analysis and AI processing. This module was implemented to support multiple document formats while maintaining efficient preprocessing and chunk management operations.

TXT files are processed using the TextLoader module, while PDF documents are handled using the PyMuPDFLoader module. This design provides flexibility and allows the system to process different document types using a unified workflow.

After loading the document, the system extracts both textual content and metadata information such as page references. The extracted content is then passed to the preprocessing and chunking stage. To improve semantic retrieval quality and contextual understanding, the system divides the extracted text into smaller overlapping chunks using the RecursiveCharacterTextSplitter module from LangChain.

### 3.7.2 Embedding and Semantic Representation

The Embedding and Semantic Representation module is responsible for converting textual content into dense numerical vector representations that can be understood and processed by AI systems. 

After document preprocessing and chunk generation, each text chunk is transformed into a high-dimensional embedding vector using the Cohere multilingual embedding model `embed-multilingual-v3.0`. Unlike traditional keyword-based approaches, embeddings capture semantic meaning and contextual relationships between words, sentences, and technical concepts.

### 3.7.3 Vector Database and Semantic Search

The Vector Database and Semantic Search module is responsible for storing embedding vectors and performing semantic similarity retrieval operations. The system uses Qdrant as the vector database backend due to its high-performance vector indexing capabilities, scalability, and efficient nearest-neighbor similarity search operations. 

When the user submits a query, the system first converts the query into an embedding vector using the same embedding model applied during document processing. The generated query vector is then compared against stored vectors inside the database using semantic similarity calculations.

### 3.7.4 Large Language Model Integration

The Large Language Model (LLM) Integration module is responsible for generating intelligent and context-aware responses based on processed user queries and retrieved document information. The system integrates the `llama-3.1-8b-instant` model through the Groq API backend to provide high-speed inference and efficient response generation.

After semantic retrieval operations are completed, the retrieved contextual document chunks are combined with the user query and forwarded to the language model. The model then analyzes the provided context and generates a relevant response based on the retrieved information and the user request.

---

## 3.8 System APIs Summary

The API layer of the system was implemented using the FastAPI framework to provide efficient communication between the frontend interface, AI processing modules, vector database, and language model services. The API architecture follows a modular routing structure where endpoints are separated according to their functionality, improving maintainability and simplifying backend development.

The base API router was implemented using FastAPI APIRouter objects with versioned endpoints to support scalability and future API expansion.

### 3.8.1 Document & NLP APIs

The backend provides multiple API endpoints responsible for document upload, preprocessing, AI analysis, semantic search, skill extraction, recommendation generation, and job matching operations.

* **POST /upload/{project_id}**
  * **Purpose**: Receives files uploaded from the frontend interface and stores them inside the project workspace after validation and preprocessing checks.
* **POST /api/v1/nlp/index/answer/{project_id}**
  * **Purpose**: The core AI endpoint responsible for generating intelligent responses and extracting information from processed documents using the integrated language model via RAG.
* **POST /api/v1/nlp/index/jops/{project_id}**
  * **Purpose**: Integrates external job APIs to retrieve real-world job opportunities dynamically. The backend communicates with external recruitment services and returns structured job recommendations to the frontend dashboard.

### 3.8.2 Interview APIs

The platform provides a comprehensive suite of RESTful APIs to manage the lifecycle of the AI Interview Agent.

* **POST /api/v1/interview/trigger**
  * **Purpose**: Manually initiates a new AI interview workflow based on email contents, bypassing the automated polling service.
  * **Request**: Accepts a JSON payload containing the `subject`, `body`, `from_email`, and an optional `candidate_email`.
  * **Response**: Returns a `201 Created` status with the newly generated `interview_id` and the initial workflow `status`.

* **GET /api/v1/interview/{id}**
  * **Purpose**: Retrieves the real-time status and complete state data of a specific interview workflow.
  * **Request**: Requires the unique `interview_id` as a path parameter.
  * **Response**: Returns a comprehensive JSON object detailing the `status`, scheduled times, meeting links, current step, evaluation scores, and final reports if completed.

* **POST /api/v1/interview/{id}/resume**
  * **Purpose**: Resumes a paused interview workflow. It is particularly useful for advancing workflows that are halted at the `WAITING` node.
  * **Request**: Accepts an optional payload containing a `force_resume` boolean flag to bypass standard waiting restrictions during development and testing.
  * **Response**: Returns the updated `status`, `current_step`, and any `last_error` encountered during resumption.

* **POST /api/v1/interview/{id}/retry**
  * **Purpose**: Attempts to restart an interview workflow that has entered a `FAILED` state due to external API errors or parsing failures.
  * **Request**: Requires the unique `interview_id` path parameter.
  * **Response**: Returns the updated status and increments the `retry_count`.

* **POST /api/v1/interview/{id}/submit-answers**
  * **Purpose**: Submits the candidate's actual responses to the AI-generated questions to proceed with evaluation.
  * **Request**: Accepts a JSON array of string `answers` corresponding sequentially to the generated questions.
  * **Response**: Returns the updated `status` and `current_step`, confirming progression to the evaluation phase.

### 3.8.3 Email APIs

The platform provides administrative APIs to monitor and manually trigger the email ingestion service.

* **GET /api/v1/email-ingestion/status**
  * **Purpose**: Provides administrative oversight into the health and metrics of the background email polling task.
  * **Response**: Returns a JSON object containing the `enabled` status, `poll_interval_seconds`, `last_poll_at` timestamp, `total_processed` count, and database record metrics.

* **POST /api/v1/email-ingestion/poll-now**
  * **Purpose**: Forces an immediate, synchronous check of the Gmail inbox, bypassing the standard polling interval.
  * **Response**: Returns an integer breakdown of emails `unread`, `detected`, `triggered`, and `processed` during the forced execution.
