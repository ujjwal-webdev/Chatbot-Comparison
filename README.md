# AI Model Comparison Framework

A comprehensive testing framework for comparing the performance of different AI models (ChatGPT, Gemini, and Claude) across various categories:

- Text Generation & Correctness
- Code Generation & Correctness
- Mathematical Problem Solving & Correctness
- Hallucination Detection

## Features

- Side-by-side comparison of AI model responses
- Automated evaluation of responses based on multiple criteria
- Support for both text and image inputs
- Detailed performance analytics and recommendations
- SRH-branded UI with modern design

## Prerequisites

- Node.js (v18 or higher)
- API key for:
  - OpenRouter (routes requests to OpenAI/Gemini/Claude models)

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ai-model-comparison
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Add your API keys to the `.env` file:
   ```
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

## Development

Start the development server:
```bash
npm run dev
```

## Deployment (GCP, minimal cost)

Recommended split:
- **Backend**: Cloud Run (container, scales to zero)
- **Frontend**: Firebase Hosting (static + CDN)
- **Secrets**: Secret Manager mapped to Cloud Run env vars
- **CI/CD**: GitHub Actions with **Workload Identity Federation (OIDC)** (no long-lived keys)

### 1) Create Secret Manager secrets (one-time)

Create this secret in your GCP project (name referenced by CI):
- `openrouter-api-key`

Then grant your Cloud Run runtime service account access:
- `roles/secretmanager.secretAccessor`

### 2) Cloud Run deploy (manual option)

Cloud Run can deploy directly from source; if a Dockerfile exists (`backend/Dockerfile`), Cloud Build will use it:

```bash
gcloud run deploy chatbot-backend \
  --source backend \
  --region YOUR_REGION \
  --allow-unauthenticated \
  --set-secrets OPENAI_API_KEY=openai-api-key:latest,GEMINI_API_KEY=gemini-api-key:latest,ANTHROPIC_API_KEY=anthropic-api-key:latest
```

### 3) CI/CD via GitHub Actions (recommended)

Workflows:
- `gcp-deploy-backend-cloudrun.yml`: deploys backend to Cloud Run
- `gcp-deploy-frontend-firebase-hosting.yml`: builds + deploys frontend to Firebase Hosting

In your GitHub repo, set:

- **Repository secrets**
  - `GCP_WORKLOAD_IDENTITY_PROVIDER`: Workload Identity Provider resource name
  - `GCP_SERVICE_ACCOUNT_EMAIL`: Service account email used by GitHub Actions

- **Repository variables**
  - `GCP_PROJECT_ID`
  - `GCP_REGION`
  - `CLOUD_RUN_SERVICE` (e.g. `chatbot-backend`)
  - `ALLOWED_ORIGINS` (Firebase Hosting URL(s), comma-separated)
  - `VITE_API_URL` (Cloud Run URL)
  - `VITE_REQUEST_TIMEOUT_MS` (optional)

The service account should have (minimum):
- Cloud Run deploy: `roles/run.admin`, `roles/iam.serviceAccountUser`, `roles/cloudbuild.builds.editor`
- Read secrets: `roles/secretmanager.secretAccessor`
- Firebase deploy: `roles/firebasehosting.admin` (or equivalent Firebase admin role for hosting)

## Testing Categories

### 1. Text Generation & Correctness
- Writing quality assessment
- Factual accuracy verification
- Language understanding
- Multilingual capabilities

### 2. Code Generation & Correctness
- Syntax accuracy
- Best practices adherence
- Error handling
- Documentation quality
- Performance optimization

### 3. Mathematical Problem Solving & Correctness
- Basic arithmetic
- Complex mathematical concepts
- Step-by-step problem solving
- Formula derivation
- Statistical analysis

### 4. Hallucination Detection
- Fact verification
- Source citation accuracy
- Confidence assessment
- Response consistency
- Image interpretation accuracy

## Evaluation Criteria

Each response is evaluated based on:
- Accuracy (0-1): Correctness of the response
- Clarity (0-1): How clear and understandable the response is
- Completeness (0-1): Coverage of all required aspects
- Reliability (0-1): Consistency and trustworthiness

## Project Structure

```
src/
├── components/          # React components
│   ├── TestRunner.tsx  # Main test execution component
│   ├── TestResults.tsx # Results display component
│   └── ...
├── controllers/        # API controllers
│   └── chatController.ts
├── tests/             # Test cases and runner
│   ├── testCases.ts
│   └── testRunner.ts
├── types/             # TypeScript type definitions
│   └── testing.ts
└── config.ts          # Configuration management
```