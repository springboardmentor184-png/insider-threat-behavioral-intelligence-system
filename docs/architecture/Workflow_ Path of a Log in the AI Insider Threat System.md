# Workflow: Path of a Log in the AI Insider Threat System

This document outlines the lifecycle of an activity log within the AI Insider Threat Behavioral Intelligence System, from its initial ingestion to the final investigation by a security analyst. This workflow ensures that all relevant employee activities are continuously monitored, analyzed for anomalies, and acted upon to mitigate potential insider threats.

## 1. Log Ingestion

**Description:** This is the entry point for all activity data into the system. Various log sources from the enterprise environment are collected and fed into the system.

**Process:**
-   **Source Collection**: Activity logs are gathered from diverse sources such as Active Directory, Windows Event Logs, Linux Audit Logs, VPN logs, firewall logs, email security logs, and endpoint security logs.
-   **Data Stream**: Logs are streamed into a central ingestion pipeline, often utilizing technologies capable of handling high-volume, real-time data (e.g., Kafka, message queues).
-   **Initial Processing**: Raw logs undergo initial parsing, normalization, and enrichment (e.g., adding employee context, timestamp standardization) to prepare them for storage and analysis.
-   **Storage**: Processed logs are stored in the designated data repositories, typically MongoDB for its flexibility with semi-structured log data.

**Key Modules Involved:** Activity Monitoring Engine (Ingestion Pipeline), Backend Services.

## 2. Analyzed for Anomaly

**Description:** Ingested and processed logs are continuously analyzed by the Behavioral Profiling and Anomaly Detection Engines to identify deviations from established normal behavior patterns.

**Process:**
-   **Behavioral Baseline Generation**: The system builds and maintains individual and peer-group behavioral baselines for each employee based on historical activity data (e.g., typical login times, file access patterns, network usage).
-   **Real-time Monitoring**: Incoming logs are compared against these baselines in real-time or near real-time.
-   **Anomaly Detection Algorithms**: Machine learning models (e.g., Isolation Forest, XGBoost) are applied to detect statistical outliers or unusual patterns that signify potential anomalies (e.g., login from an unusual location, large data transfer outside working hours, access to sensitive files by an unauthorized user).
-   **Anomaly Categorization**: Detected anomalies are categorized based on their type (e.g., unusual login time, abnormal data download, unauthorized access attempt).

**Key Modules Involved:** Behavioral Profiling Engine, Anomaly Detection Engine, UEBA Intelligence Engine.

## 3. Risk Score Updated

**Description:** Based on detected anomalies and other contextual factors, the insider risk score for the involved employee(s) is dynamically updated.

**Process:**
-   **Anomaly Weighting**: Each detected anomaly is assigned a weight or severity based on its potential impact and historical context.
-   **Risk Score Calculation**: The Insider Risk Scoring Engine aggregates these weighted anomalies, along with other risk indicators (e.g., privilege misuse, data access violations), to calculate an updated, dynamic risk score for the employee.
-   **Risk Categorization**: The calculated score is mapped to a risk category (e.g., Low, Medium, High, Critical).
-   **Risk Trend Monitoring**: The system tracks changes in risk scores over time to identify escalating or de-escalating threat levels.

**Key Modules Involved:** Insider Risk Scoring Engine, UEBA Intelligence Engine.

## 4. Alert Generated

**Description:** When an employee's risk score crosses a predefined threshold or a critical anomaly is detected, an alert is automatically generated and routed to the appropriate security personnel.

**Process:**
-   **Threshold Monitoring**: The system continuously monitors updated risk scores against configurable thresholds.
-   **Alert Triggering**: Upon a threshold breach or detection of a high-severity anomaly, an alert is triggered.
-   **Notification**: The Alert & Incident Management System sends notifications to designated security analysts, SOC engineers, or security managers via various channels (e.g., in-dashboard, email, integrated messaging platforms).
-   **Incident Creation**: A new incident record is automatically created, linking all relevant logs, anomalies, and employee information.

**Key Modules Involved:** Insider Risk Scoring Engine, Alert & Incident Management System, Notification & Escalation System.

## 5. Analyst Investigates

**Description:** Security analysts use the system's tools to investigate triggered alerts, gather evidence, and manage the incident resolution process.

**Process:**
-   **Alert Review**: An analyst receives the alert and accesses the investigation dashboard.
-   **Contextual Data Retrieval**: The system provides a comprehensive view, including the employee's risk history, activity timeline, related anomalies, and device usage information.
-   **Evidence Collection**: The analyst can drill down into raw logs, correlate events, and collect additional evidence directly within the platform.
-   **Incident Management**: The analyst updates the incident status, assigns tasks, communicates with relevant stakeholders, and documents findings.
-   **Resolution & Reporting**: Once the investigation is complete, the incident is resolved, and a report is generated for compliance and future reference.

**Key Modules Involved:** Threat Investigation Module, Alert & Incident Management System, Dashboard & Analytics, Reports & Export System.
