---
subjectCode: "CS501"
subjectName: "Operating Systems"
faculty: "Prof. Rajesh Verma"
credits: 4
semester: 5
driveUrl: "https://drive.google.com/drive/folders/section-v-os-archive"
pyqDriveUrl: "https://drive.google.com/drive/folders/section-v-os-pyq"
lastUpdated: "2026-09-18"
units:
  - unitNumber: 1
    title: "OS Architecture & Process Scheduling"
    topics: ["Dual Mode Execution", "System Calls", "Process Control Blocks", "Preemptive CPU Scheduling Algorithms", "Real-Time Scheduling"]
    slidesUrl: "https://drive.google.com/file/d/unit1-os-processes.pdf"
  - unitNumber: 2
    title: "Process Synchronization & Deadlocks"
    topics: ["Critical Section Problem", "Peterson's Algorithm", "Mutex vs Counting Semaphores", "Dining Philosophers Problem", "Banker's Algorithm Safety Test"]
    slidesUrl: "https://drive.google.com/file/d/unit2-synchronization.pdf"
  - unitNumber: 3
    title: "Memory Management & Virtual Memory"
    topics: ["Paging Hardware & TLB", "Multi-level Paging", "Page Fault Handling", "LRU / Optimal / Belady's Anomaly", "Thrashing & Working Set Model"]
    slidesUrl: "https://drive.google.com/file/d/unit3-virtual-memory.pdf"
  - unitNumber: 4
    title: "File Systems & Mass Storage"
    topics: ["Directory Structures", "File Allocation Tables (FAT vs Inode)", "SCAN / C-SCAN Disk Scheduling", "RAID Levels 0-6"]
    slidesUrl: "https://drive.google.com/file/d/unit4-storage-systems.pdf"
---

# Operating Systems (CS501) — Comprehensive Lecture Notes

Section-V master repository for Operating Systems notes, solved numerical problems, and practical Linux kernel C implementations.

## High-Probability Exam Questions
1. **Banker's Algorithm**: Remember $Need[i, j] = Max[i, j] - Allocation[i, j]$. Always calculate the step-by-step vector comparison $Need_i \le Work$.
2. **Page Fault Rate Calculation**: Effective Access Time $(EAT) = (1 - p) \times ma + p \times (\text{page fault service time})$.
3. **Producer-Consumer using Semaphores**:
   ```c
   wait(empty);
   wait(mutex);
   // produce item
   signal(mutex);
   signal(full);
   ```

## SDC Interview Tip
Understand the difference between User Level Threads (ULT) and Kernel Level Threads (KLT) and how modern Linux uses `clone()` with shared virtual memory.
