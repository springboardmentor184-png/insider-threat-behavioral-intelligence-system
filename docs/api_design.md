# API Design

## Base URL

```
http://localhost:8000
```

---

# Authentication APIs

## Register Employee

**POST** `/auth/register`

### Request

```json
{
    "full_name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
}
```

### Response

```json
{
    "id": 1,
    "full_name": "John Doe",
    "email": "john@example.com"
}
```

---

## Login

**POST** `/auth/login`

### Request

```json
{
    "email": "john@example.com",
    "password": "password123"
}
```

### Response

```json
{
    "access_token": "JWT_TOKEN",
    "token_type": "bearer"
}
```

---

# Employee APIs

## Get All Employees

**GET** `/employees`

---

## Get Employee by ID

**GET** `/employees/{id}`

---

## Update Employee

**PUT** `/employees/{id}`

---

## Delete Employee

**DELETE** `/employees/{id}`

---

# Activity APIs

## Add Activity Log

**POST** `/activities`

### Request

```json
{
    "employee_id": 1,
    "activity_type": "File Access",
    "ip_address": "192.168.1.15",
    "device": "Windows Laptop"
}
```

---

## Get Activity Logs

**GET** `/activities`

---

# Alert APIs

## Get Alerts

**GET** `/alerts`

---

## Update Alert Status

**PUT** `/alerts/{id}`

---

# Dashboard APIs

## Dashboard Summary

**GET** `/dashboard`

Returns:

- Total Employees
- Active Employees
- Total Alerts
- High Risk Employees
- Recent Activities