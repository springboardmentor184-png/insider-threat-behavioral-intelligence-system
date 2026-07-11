# InsiderShield Backend

Enterprise Insider Threat Behavioral Intelligence Platform - Backend API

## Project Structure
- `app/api/`: API routers and endpoints
- `app/core/`: Configuration, security, and core dependencies
- `app/database/`: SQLAlchemy database setup
- `app/models/`: SQLAlchemy ORM models
- `app/schemas/`: Pydantic models for data validation
- `app/services/`: Business logic
- `app/utils/`: Helper functions

## Installation
1. Create a virtual environment:
   `python -m venv venv`
2. Activate the virtual environment:
   - Windows: `venv\\Scripts\\activate`
   - Linux/Mac: `source venv/bin/activate`
3. Install dependencies:
   `pip install -r requirements.txt`

## Configuration
Copy `.env.example` to `.env` and fill in the required values.

## Run Server
Run the FastAPI application with uvicorn:
`uvicorn app.main:app --reload`

## Database Schema Overview
The database uses PostgreSQL via SQLAlchemy ORM. All entities utilize UUIDs for primary keys to ensure distributed integrity. Timestamps (`created_at`, `updated_at`) are automatically managed across all models.

### Entity Relationship Summary
1. **Department**: Stores organizational units. Has a One-to-Many relationship with `Employee`.
2. **Role**: Defines RBAC (Role-Based Access Control) levels. Has a One-to-Many relationship with `Employee`.
3. **Employee**: The central identity model. Holds relationships pointing to `Department` and `Role`, and acts as the parent for `ActivityLog` and `RiskAssessment`.
4. **ActivityLog**: Represents granular behavioral telemetry (e.g., Login, File Access, USB insertion). Has a Many-to-One relationship with `Employee`.
5. **RiskAssessment**: Stores the output of the AI intelligence engine detailing anomaly scores and predictive security recommendations. Has a Many-to-One relationship with `Employee`.

## Enterprise Security Enhancements
The database architecture has been specifically refined to support tier-1 security operations and forensic investigations:

### Soft Deletes
Employees are never permanently deleted from the database. A `deleted_at` timestamp ensures full referential integrity is preserved for forensic history, allowing the SOC team to trace actions made by terminated accounts. 

### Audit Fields
Crucial compliance and access audit fields have been integrated directly into the core Identity model, including:
- `failed_login_attempts`: For mitigating brute force attacks.
- `last_password_change`: For enforcing corporate password rotation policies.

### Risk Scoring
Risk assessments now support granular `confidence_score` and `risk_reason` metadata, ensuring analysts can transparently understand why a behavior was flagged without guessing.

### Activity Tracking
The Activity Log entity now captures comprehensive forensic telemetry, expanding beyond basic IPs to include:
- `device_id` & `browser` fingerprints
- `operating_system` data
- `session_id` chaining
- Granular `resource_name` targets

### Future AI Integration
The schema has been explicitly constructed to feed clean, highly dimensional behavioral vectors into future Machine Learning anomaly detection pipelines seamlessly.
