const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const { initialCentres, mockTelemetryHistory } = require('./mockData');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// In-memory state for centres and alerts
let centres = JSON.parse(JSON.stringify(initialCentres));
let alertLogs = [
  {
    id: "ALT-901",
    timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
    centre_id: "TC-MP-30912",
    centre_name: "Vindhya Kaushal Vikas Kendra, Bhopal",
    type: "TAMPER_DETECTED",
    severity: "red",
    message: "Camera lens obscured / blind spot created. Batch DEO-2026-B2 unmonitored.",
    evidence_hash: "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e"
  },
  {
    id: "ALT-902",
    timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
    centre_id: "TC-BR-20184",
    centre_name: "Nalanda Vocational Institute, Patna",
    type: "CRITICAL_DEFICIT",
    severity: "red",
    message: "Attendance deficit 80.0% (5 present vs 25 claimed). 4 welding booths missing.",
    evidence_hash: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
  },
  {
    id: "ALT-903",
    timestamp: new Date(Date.now() - 4 * 60000).toISOString(),
    centre_id: "TC-UP-10492",
    centre_name: "Shri Ram Skill Academy, Kanpur",
    type: "ATTENDANCE_MISMATCH",
    severity: "amber",
    message: "Sustained attendance deficit 63.3% (11 present vs 30 claimed). 8 toolkits missing.",
    evidence_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  }
];

let isLiveSimulationRunning = true;

// Broadcast helper for WebSocket clients
function broadcast(type, data) {
  const payload = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

// 1. Get high-level summary KPIs
app.get('/api/stats', (req, res) => {
  const total = centres.length;
  const compliant = centres.filter(c => c.status === 'green').length;
  const observation = centres.filter(c => c.status === 'amber').length;
  const redFlagged = centres.filter(c => c.status === 'red').length;
  const totalSubsidyAtRisk = centres
    .filter(c => c.status !== 'green')
    .reduce((sum, c) => sum + (c.monthly_subsidy || 0), 0);

  res.json({
    total_centres: total,
    compliant_count: compliant,
    compliant_percentage: ((compliant / total) * 100).toFixed(1),
    under_observation_count: observation,
    red_flagged_count: redFlagged,
    subsidy_at_risk_inr: totalSubsidyAtRisk,
    active_monitored_batches: total * 3,
    avg_bandwidth_saving_percentage: 99.4,
    simulation_active: isLiveSimulationRunning
  });
});

// 2. Get list of all centres (with filtering)
app.get('/api/centres', (req, res) => {
  const { status, state, search } = req.query;
  let result = [...centres];

  if (status && status !== 'all') {
    result = result.filter(c => c.status === status);
  }
  if (state && state !== 'all') {
    result = result.filter(c => c.state === state);
  }
  if (search) {
    const s = search.toLowerCase();
    result = result.filter(c => 
      c.name.toLowerCase().includes(s) ||
      c.id.toLowerCase().includes(s) ||
      c.district.toLowerCase().includes(s) ||
      c.trade.toLowerCase().includes(s)
    );
  }

  res.json(result);
});

// 3. Get single centre details
app.get('/api/centres/:id', (req, res) => {
  const centre = centres.find(c => c.id === req.params.id);
  if (!centre) {
    return res.status(404).json({ error: 'Centre not found' });
  }

  // Generate dynamic attendance timeline for Chart.js
  const claimed = centre.claimed_attendance;
  const detected = centre.detected_attendance;
  const dynamicHistory = [
    { time: "09:00", claimed: claimed, detected: Math.min(claimed, Math.round(claimed * 0.95)) },
    { time: "09:30", claimed: claimed, detected: Math.min(claimed, Math.round(claimed * 0.92)) },
    { time: "10:00", claimed: claimed, detected: Math.round(claimed * 0.85) },
    { time: "10:30", claimed: claimed, detected: Math.round(claimed * 0.65) },
    { time: "11:00", claimed: claimed, detected: detected },
    { time: "11:30", claimed: claimed, detected: detected },
    { time: "12:00", claimed: claimed, detected: Math.max(0, detected - 1) }
  ];

  res.json({
    centre,
    telemetry_history: dynamicHistory,
    alerts: alertLogs.filter(a => a.centre_id === centre.id)
  });
});

// 4. Ingest edge telemetry packet (From Edge Mini-PC / Camera Simulator)
app.post('/api/telemetry', (req, res) => {
  const {
    centre_id,
    batch_id,
    detected_headcount,
    claimed_headcount,
    detected_assets,
    tamper_flag,
    evidence_b64
  } = req.body;

  const centre = centres.find(c => c.id === centre_id);
  if (!centre) {
    return res.status(404).json({ error: 'Centre ID not registered' });
  }

  // Cross-Reconciliation Logic
  const claimed = claimed_headcount !== undefined ? Number(claimed_headcount) : centre.claimed_attendance;
  const detected = Number(detected_headcount);
  const discrepancyRate = claimed > 0 ? Math.max(0, ((claimed - detected) / claimed) * 100) : 0;

  centre.detected_attendance = detected;
  centre.claimed_attendance = claimed;
  centre.discrepancy_rate = Number(discrepancyRate.toFixed(1));
  centre.last_sync = new Date().toISOString();

  // Status Triage Logic
  let newStatus = 'green';
  let alertType = null;

  if (tamper_flag) {
    newStatus = 'red';
    alertType = 'TAMPER_DETECTED';
  } else if (discrepancyRate >= 40.0) {
    newStatus = 'red';
    alertType = 'CRITICAL_DEFICIT';
  } else if (discrepancyRate >= 15.0) {
    newStatus = 'amber';
    alertType = 'ATTENDANCE_MISMATCH';
  }

  centre.status = newStatus;

  // Cryptographic evidence generation
  let evidenceHash = centre.evidence_hash;
  if (evidence_b64) {
    evidenceHash = crypto.createHash('sha256').update(evidence_b64).digest('hex');
    centre.evidence_hash = evidenceHash;
    centre.evidence_snapshot = evidence_b64;
  }

  // Raise alert if red or amber
  if (alertType) {
    const newAlert = {
      id: `ALT-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      centre_id: centre.id,
      centre_name: centre.name,
      type: alertType,
      severity: newStatus,
      message: `${alertType.replace('_', ' ')}: Claimed ${claimed} vs Detected ${detected} (Deficit: ${centre.discrepancy_rate}%)`,
      evidence_hash: evidenceHash
    };
    alertLogs.unshift(newAlert);
    if (alertLogs.length > 30) alertLogs.pop();

    broadcast('NEW_ALERT', newAlert);
  }

  broadcast('CENTRE_UPDATED', centre);

  // Return packet confirmation & bandwidth metric
  const packetSizeBytes = Buffer.byteLength(JSON.stringify(req.body));
  res.json({
    status: 'INGESTED_OK',
    centre_status: centre.status,
    discrepancy_rate: centre.discrepancy_rate,
    telemetry_payload_bytes: packetSizeBytes,
    bandwidth_saved_vs_video_pct: 99.4
  });
});

// 5. Ministry Action: Freeze Subsidy / Issue Notice / Dispatch Squad
app.post('/api/actions', (req, res) => {
  const { centre_id, action, note } = req.body;
  const centre = centres.find(c => c.id === centre_id);
  if (!centre) {
    return res.status(404).json({ error: 'Centre not found' });
  }

  if (action === 'FREEZE_SUBSIDY') {
    centre.subsidy_status = 'FROZEN_LEVEL_2';
    centre.audit_notes = `[${new Date().toLocaleDateString()}] Subsidy frozen by MSDE Auditor. Reason: ${note || 'Severe attendance & asset discrepancy'}`;
  } else if (action === 'ISSUE_NOTICE') {
    centre.subsidy_status = 'HOLD_LEVEL_1';
    centre.audit_notes = `[${new Date().toLocaleDateString()}] Level-1 Explanation Notice Issued. Reason: ${note || 'Variance exceeds 20%'}`;
  } else if (action === 'VERIFY_APPROVE') {
    centre.subsidy_status = 'APPROVED_DISBURSED';
    centre.status = 'green';
    centre.audit_notes = `[${new Date().toLocaleDateString()}] Cleared by Auditor following flying squad verification.`;
  }

  broadcast('CENTRE_UPDATED', centre);
  res.json({ success: true, centre });
});

// 6. Get live alert feed
app.get('/api/alerts', (req, res) => {
  res.json(alertLogs);
});

// 7. Toggle Background Simulation
app.post('/api/simulation/toggle', (req, res) => {
  isLiveSimulationRunning = !isLiveSimulationRunning;
  broadcast('SIMULATION_STATUS', { active: isLiveSimulationRunning });
  res.json({ simulation_active: isLiveSimulationRunning });
});

// 8. Export CSV
app.get('/api/export/csv', (req, res) => {
  let csv = 'Centre_ID,Name,State,District,Scheme,Trade,Active_Batch,Claimed_Attendance,Detected_Attendance,Discrepancy_Pct,Status,Subsidy_Status,Monthly_Subsidy_INR\n';
  centres.forEach(c => {
    csv += `"${c.id}","${c.name}","${c.state}","${c.district}","${c.scheme}","${c.trade}","${c.active_batch}",${c.claimed_attendance},${c.detected_attendance},${c.discrepancy_rate},"${c.status}","${c.subsidy_status}",${c.monthly_subsidy}\n`;
  });
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="MSDE_Drishti_Audit_Register.csv"');
  res.send(csv);
});

// 9. Reset Data
app.post('/api/reset', (req, res) => {
  centres = JSON.parse(JSON.stringify(initialCentres));
  broadcast('INITIAL_SNAPSHOT', { centres, alerts: alertLogs });
  res.json({ success: true, message: 'All mock centres reset to empanelment baseline.' });
});

// -------------------------------------------------------------
// WEBSOCKET SERVER
// -------------------------------------------------------------
wss.on('connection', (ws) => {
  console.log('[WebSocket] MSDE Dashboard client connected.');
  ws.send(JSON.stringify({
    type: 'INITIAL_SNAPSHOT',
    data: { centres, alerts: alertLogs, simulation_active: isLiveSimulationRunning },
    timestamp: new Date().toISOString()
  }));

  ws.on('close', () => {
    console.log('[WebSocket] Dashboard client disconnected.');
  });
});

// -------------------------------------------------------------
// BACKGROUND AUTONOMOUS NETWORK SIMULATOR (PULSES CENTRES)
// -------------------------------------------------------------
setInterval(() => {
  if (!isLiveSimulationRunning || centres.length === 0) return;

  // Pick a random centre to simulate a live 5-minute telemetry update
  const randIdx = Math.floor(Math.random() * centres.length);
  const target = centres[randIdx];

  // Minor realistic jitter (-1 to +1 student fluctuation)
  const jitter = Math.floor(Math.random() * 3) - 1;
  const newDetected = Math.max(0, Math.min(target.claimed_attendance, target.detected_attendance + jitter));
  target.detected_attendance = newDetected;
  target.discrepancy_rate = Number((((target.claimed_attendance - newDetected) / target.claimed_attendance) * 100).toFixed(1));
  target.last_sync = new Date().toISOString();

  // Re-triage
  if (target.discrepancy_rate >= 40.0) {
    target.status = 'red';
  } else if (target.discrepancy_rate >= 15.0) {
    target.status = 'amber';
  } else {
    target.status = 'green';
  }

  broadcast('CENTRE_UPDATED', target);
}, 12000); // Pulse every 12 seconds

// Start Server
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` DRISHTI-SKILLING: MSDE MONITORING SYSTEM IS ONLINE!`);
  console.log(` HTTP & WebSocket Server running at: http://localhost:${PORT}`);
  console.log(` Autonomous Pan-India Edge Telemetry Pulse: ACTIVE`);
  console.log(`=======================================================`);
});
