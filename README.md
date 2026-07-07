NIRMAAN — Government Projects Finance Management System

NIRMAAN is a full-stack finance management system built for tracking and managing government project funding, expenditure, and reporting. It grew out of an earlier academic prototype (GPOMS) into a production-style application with a relational backend, a secured REST API, interactive dashboards, and an AI-powered chatbot for natural-language data queries.

Demo Link



Table of Contents


Business Understanding
Data Understanding
Screenshots of Visualizations/Results
Technologies
Setup
Approach
Status
Credits


Business Understanding

Government-funded projects typically span multiple departments, contractors, and disbursement stages, which makes it hard to track fund allocation, utilization, and delays using spreadsheets or siloed systems. NIRMAAN was built to give administrators a single system to record project details, monitor budget allocation versus actual spend, and generate reports — while also letting non-technical stakeholders ask questions about the data in plain language instead of writing SQL.

The biggest challenges while building this were designing a schema flexible enough to model real-world project/fund/disbursement relationships without becoming unwieldy, and building a reliable natural-language-to-SQL layer that stays scoped to the actual database schema rather than hallucinating fields or tables.

Data Understanding

The system is built around a 12-table MySQL schema modeling entities such as projects, departments, funding sources, disbursements, contractors, and audit/status records, connected through normalized relationships. Data is created and updated directly through the application via the REST API, rather than sourced from an external dataset.

Planned enhancements include richer historical trend analysis across project timelines and expanding the RAG chatbot's context to support more complex, multi-table queries.

Screenshots of Visualizations/Results

Add screenshots of the React dashboards, project tracking views, and chatbot interface here.

Technologies


Backend: Spring Boot, JWT-based authentication, REST API
Database: MySQL (12-table relational schema)
Frontend: React, dashboard components for project/fund visualization
AI/RAG Chatbot: LangChain, FAISS (vector store), Gemini (LLM)
Natural Language to SQL: Text-to-SQL pipeline scoped to the project schema
DevOps: Docker, GitHub Actions (CI/CD)


Setup


Update the commands below to match the actual repo structure once finalized.



bash# Clone the repository
git clone https://github.com/Suchitra196/NIRMAAN-gpoms.git
cd NIRMAAN-gpoms

# Backend setup
cd backend
# configure application.properties / .env with MySQL credentials and JWT secret
./mvnw spring-boot:run

# Frontend setup
cd ../frontend
npm install
npm start

# Docker (optional, full stack)
docker-compose up --build

Environment variables you'll likely need to configure:


MySQL connection string, username, password
JWT signing secret
Gemini API key (for the RAG chatbot / text-to-SQL layer)


Approach


Schema design — Modeled the 12-table relational structure covering projects, departments, funding sources, disbursements, and contractors, with appropriate foreign key relationships and constraints.
Backend API — Built a Spring Boot REST API secured with JWT authentication, exposing endpoints for CRUD operations on projects, funds, and disbursements.
Frontend dashboards — Built React dashboards to visualize project status, budget allocation vs. utilization, and department-level summaries.
RAG chatbot — Implemented a retrieval-augmented chatbot using LangChain and FAISS for context retrieval, backed by Gemini, allowing users to ask natural-language questions about the data.
Text-to-SQL — Added a layer that translates natural-language queries into SQL scoped to the project's schema, enabling ad-hoc reporting without writing SQL manually.
CI/CD — Set up Docker containerization and GitHub Actions workflows for automated builds and deployment.


Status

In progress. Core backend (schema, REST API, JWT auth), frontend dashboards, and the RAG chatbot / text-to-SQL layer are built; ongoing work includes refining the chatbot's query scope and expanding dashboard visualizations.

Credits

Built by Suchitra (Suchi), Computer Engineering, Cummins College of Engineering for Women, Pune.
