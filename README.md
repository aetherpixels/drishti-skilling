# Drishti-Skilling (दृष्टि-कौशल)
### AI-Based Real-Time Monitoring of Training Centres for Attendance and Infrastructure Compliance
**Smart India Hackathon 2026** | **Problem Statement ID**: 26245  
**Ministry / Department**: Ministry of Skill Development and Entrepreneurship (MSDE)  
**Theme**: Smart Education | **Category**: Software  

---

## 📌 Executive Summary
Under government skilling schemes like **PMKVY 4.0**, **DDU-GKY**, and **ITIs**, the government disburses hundreds of crores in training subsidies. Because manual inspections happen only once in 3 to 6 months, two major integrity risks occur:
1. **Ghost Trainees**: Centers submit 30 enrolled names but only 5-10 students physically attend.
2. **Ghost / Rented Infrastructure**: Centers rent machinery for the physical inspection day and remove it immediately after.

**Drishti-Skilling** is an **edge-first, privacy-preserving video analytics and compliance platform** that connects to existing classroom/workshop CCTV feeds, blurs all trainee faces at the camera buffer (DPDP Act 2023 compliant), counts actual student presence, detects sanctioned equipment, and transmits lightweight **<5 KB JSON telemetry** over rural 2G/3G connections to an automated Ministry Dashboard.

---

## 🚀 1-Click Launch (How to Run)

### Method 1: Using the Batch Launcher (Easiest)
Simply double-click:
```
start_drishti.bat
```
This automatically boots the Central Server and opens `http://localhost:3000` in your browser.

### Method 2: From Terminal
```bash
cd C:\Users\DELL\.gemini\antigravity\scratch\drishti_skilling
npm start
```
Open **`http://localhost:3000`** in Google Chrome or Edge.

---

## 🎯 How to Present the 3-Minute Live Demo to Judges

1. **Tab 1: National GIS Overview**
   - Show the **National Map of India** with 8 empanelled training centres across states (Kanpur, Patna, Bhopal, Jaipur, Pune, Bhubaneswar, etc.).
   - Explain the 3 color-coded statuses: 
     - 🟢 **Green**: Verified Compliant (Attendance & Assets match).
     - 🟡 **Amber**: Observation (Variance 15-30% sustained; Level-1 query issued).
     - 🔴 **Red**: Critical Deficit (>40% deficit or missing critical machines; subsidy frozen).
   - Point to the **Real-Time Discrepancy Stream** on the right side.

2. **Audit Modal & Evidence Vault**
   - Click on **`TC-UP-10492 (Kanpur)`** or **`TC-BR-20184 (Patna)`**.
   - Show the **Attendance Reconciliation Chart** (Claimed: 30 vs AI Headcount: 11).
   - Show the **Mandated Infrastructure Audit Table** (e.g., 4 Welding Booths missing from shop floor).
   - Show the **Cryptographically Signed Evidence Vault**: A face-blurred snapshot proof with its SHA-256 integrity hash.
   - Demonstrate the auditor action: Click **"Freeze Batch Subsidy"** and watch the status update instantly across the entire platform!

3. **Tab 2: Live Edge Camera AI Simulator (The Showstopper)**
   - Click the **"Live Edge AI Camera Simulator"** tab.
   - Click **"Start Laptop Camera"** (or "Simulate Classroom Feed").
   - **Show Privacy by Design**: Point out how the user's face is **automatically blurred in real-time** with a green `[TRAINEE DE-IDENTIFIED]` shield, proving zero individual surveillance under the DPDP Act 2023.
   - Use the **Interactive Discrepancy Injector**:
     - Set Claimed Attendance to **30**.
     - Since the webcam sees only 1 person, the calculated variance immediately jumps to **96.7% (CRITICAL RED)**.
     - Click **"Push Real-Time Telemetry to MSDE Portal"**.
     - An alert is instantly broadcast over WebSockets, popping up on the National Overview!

4. **Tab 3: Low-Bandwidth Rural Mode**
   - Show the side-by-side comparison:
     - 24/7 Video Streaming = 45 GB/mo per camera (fails in rural 2G/3G).
     - Drishti JSON Telemetry = **1,842 Bytes (~1.8 KB)** per 5 min = **99.4% Bandwidth Reduction**.

5. **Tab 4: Accuracy Assessment & Privacy Charter**
   - Highlight the **Confusion Matrix** (Precision: 95.1%, Recall: 96.7%, F1-Score: 95.9%).
   - Explain how the **5-15 minute rolling average** suppresses false positives (students temporarily leaving for water).

---

## 🛡️ Privacy & Compliance Architecture (DPDP Act 2023)
* **What IS Identified**: Aggregate physical head count, spatial positioning of approved tools and workbenches, room illumination.
* **What is NOT Identified**: No facial recognition vectors, no trainee identities, no Aadhaar facial match, no demographic profiling.
* **Edge-Only De-Identification**: Faces are blurred directly inside the frame buffer before any visual representation is cached or transmitted.

---

## 📦 Project Structure
```
drishti_skilling/
├── edge_ai/
│   └── edge_simulator.js       # On-premise Edge Mini-PC telemetry generator
├── public/
│   ├── index.html              # Ministry Monitoring Portal UI
│   ├── app.js                  # GIS Map, WebSocket sync, in-browser Edge CV engine
│   └── style.css               # Government theme, pulsing map pins & alerts
├── server/
│   ├── index.js                # Express REST API & WebSocket broadcast server
│   └── mockData.js             # Realistic empanelled Indian training centres & batches
├── package.json
├── start_drishti.bat           # 1-click launch batch script
└── README.md
```
