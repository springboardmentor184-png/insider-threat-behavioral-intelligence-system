# Database Design

## Employee

- id
- full_name
- email
- password

---

## ActivityLog

- id
- employee_id
- activity_type
- timestamp
- ip_address
- device

---

## Alert

- id
- employee_id
- severity
- description
- status

---

## Incident

- id
- alert_id
- assigned_to
- status