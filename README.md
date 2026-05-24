# Webhook Payload Sanitizer & Pipeline Buffer

A lightweight development tool designed to stage, clean, and map chaotic third-party API data payloads before passing them to low-code tools (Make.com, Zapier) or database endpoints. 

Automation tools frequently break when incoming payloads contain unexpected `null` fields, deeply nested objects, or empty strings. This micro-utility strips problematic keys on the fly and optionally flattens objects to preserve pipeline execution logic.

## Core Architecture
* **Frontend:** Single-page React instance built with Vite. Custom hooks manage pipeline state to segregate UI rendering from asynchronous transmission boundaries.
* **Backend:** Node.js + Express engine utilizing deterministic recursive algorithms to sanitize input payloads without introducing performance bottlenecks.

## Technical Decisions
* **Pure Functional Utilities:** The core sanitization parser relies entirely on pure functions. This prevents mutation side-effects and makes testing input mutations highly predictable.
* **Asynchronous Isolation:** Network operations and state transitions are abstracted into a single React hook (`usePayloadSubmit`). Components only consumer input fields and loading flags, eliminating code duplication across future interface expansions.
* **Centralized Error Middleware:** Express routes drop errors directly into a structured next() pipeline. This guarantees malicious or broken JSON structures return explicit HTTP 400 structures without terminating the runtime process.

## Setup & Deployment

### Backend Setup
1. Navigate to `/backend`.
2. Install dependencies: `npm install`
3. Create a `.env` file from the blueprint: `cp .env.example .env`
4. Run the development server: `npm start`

### Frontend Setup
1. Navigate to `/frontend`.
2. Install dependencies: `npm install`
3. Configure the environment string inside `.env.production` (Target `VITE_API_URL`).
4. Execute build command: `npm run build`