graph TD
    User((Security Analyst)) -->|Uses| Frontend[React Dashboard]
    
    subgraph "The Brain (FastAPI Backend)"
        Frontend -->|API Requests| API[FastAPI Server]
        API -->|Checks| Auth[JWT Auth]
        API -->|Saves/Reads| DB_Logic[Database Logic]
    end

    subgraph "The Storage (Databases)"
        DB_Logic -->|Structured Data| MySQL[(MySQL: Users & Profiles)]
        DB_Logic -->|Activity Logs| Mongo[(MongoDB: Event Logs)]
    end

    subgraph "The Detective (AI Engine)"
        API -->|Sends Logs| AI[Anomaly Detection]
        AI -->|Finds Threats| Risk[Risk Scoring]
        Risk -->|Updates| MySQL
    end
