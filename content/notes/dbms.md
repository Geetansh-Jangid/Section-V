---
subjectCode: "CS502"
subjectName: "Database Management Systems"
faculty: "Dr. Ananya Sharma"
credits: 4
semester: 5
driveUrl: "https://drive.google.com/drive/folders/section-v-dbms-archive"
pyqDriveUrl: "https://drive.google.com/drive/folders/section-v-dbms-pyq"
lastUpdated: "2026-09-17"
units:
  - unitNumber: 1
    title: "ER Modeling & Relational Algebra"
    topics: ["Entity Sets", "Weak Entities", "Extended ER Features", "Relational Operators", "Tuple Relational Calculus"]
    slidesUrl: "https://drive.google.com/file/d/unit1-er-relational.pdf"
  - unitNumber: 2
    title: "SQL & Relational Database Design"
    topics: ["Complex Queries", "Triggers & Assertions", "Functional Dependencies", "1NF to BCNF", "4NF/5NF Multivalued"]
    slidesUrl: "https://drive.google.com/file/d/unit2-normal-forms.pdf"
  - unitNumber: 3
    title: "Transaction Processing & Concurrency"
    topics: ["ACID Properties", "Schedules & Serializability", "2PL Protocol", "Timestamp Ordering", "Deadlock Detection"]
    slidesUrl: "https://drive.google.com/file/d/unit3-concurrency.pdf"
  - unitNumber: 4
    title: "Storage & Indexing Strategies"
    topics: ["B+ Tree Indexing", "Hash Indices", "Buffer Pool Management", "Query Execution Plan Costing"]
    slidesUrl: "https://drive.google.com/file/d/unit4-storage-indexing.pdf"
---

# Database Management Systems (CS502) — Complete Study Guide

Welcome to the Section-V curated DBMS repository. This syllabus maps directly to university mid-term and end-term requirements with solved previous year questions (PYQs).

## Key Highlights & Exam Hotspots
1. **BCNF vs 3NF Decomposition**: Always test for dependency preservation. If $F^+$ is lost in BCNF, evaluate the 3NF synthesis algorithm.
2. **Conflict Serializability**: Draw the precedence graph (serialization graph). An acyclic graph guarantees conflict serializability.
3. **Strict 2PL vs Rigorous 2PL**: Strict 2PL releases shared locks before end of transaction but holds exclusive locks till commit/abort. Rigorous 2PL holds all locks till termination.

## Quick Cheat Sheet
- **Candidate Key determination**: Find minimal attribute sets whose closure includes all attributes $R$.
- **Armstrong's Axioms**: Reflexivity ($Y \subseteq X \implies X \to Y$), Augmentation ($X \to Y \implies XZ \to YZ$), Transitivity ($X \to Y, Y \to Z \implies X \to Z$).
