---
subjectCode: "CS503"
subjectName: "Computer Networks"
faculty: "Dr. Vikram Sethi"
credits: 4
semester: 5
driveUrl: "https://drive.google.com/drive/folders/section-v-cn-archive"
pyqDriveUrl: "https://drive.google.com/drive/folders/section-v-cn-pyq"
lastUpdated: "2026-09-15"
units:
  - unitNumber: 1
    title: "Physical Layer & Data Link Protocols"
    topics: ["Nyquist & Shannon Capacity", "Framing & Bit Stuffing", "CRC Error Detection", "Sliding Window (Go-Back-N vs SR)", "CSMA/CD & Ethernet"]
    slidesUrl: "https://drive.google.com/file/d/unit1-datalink.pdf"
  - unitNumber: 2
    title: "Network Layer & Routing Protocols"
    topics: ["IPv4 Addressing & CIDR Subnetting", "NAT / DHCP", "Distance Vector (RIP)", "Link State (OSPF)", "BGP Inter-domain Routing"]
    slidesUrl: "https://drive.google.com/file/d/unit2-network-layer.pdf"
  - unitNumber: 3
    title: "Transport Layer Mechanisms"
    topics: ["TCP 3-Way Handshake & Teardown", "Flow Control (Sliding Window)", "Congestion Control (Slow Start, Tahoe/Reno)", "UDP Header Analysis"]
    slidesUrl: "https://drive.google.com/file/d/unit3-transport.pdf"
  - unitNumber: 4
    title: "Application Layer & Security"
    topics: ["DNS Hierarchy & Resolution", "HTTP/1.1 vs HTTP/2 vs HTTP/3", "TLS/SSL Handshake", "Symmetric vs Asymmetric Ciphers"]
    slidesUrl: "https://drive.google.com/file/d/unit4-application-sec.pdf"
---

# Computer Networks (CS503) — Architecture & Protocols

Master handbook for Section V Computer Networks course. Covers packet trace analysis, socket programming, and numerical problem solving.

## Subnetting Cheat Sheet
- Class C: `/24` $\implies$ 254 usable hosts
- Subnet mask `/27` $\implies$ Subnet increment 32, 30 usable hosts per subnet
- Maximum segment lifetime (MSL) and TIME_WAIT state in TCP teardown prevent phantom packets from clashing with new connections.
