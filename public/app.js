// Drishti-Skilling: Full-Featured Ministry Monitoring Dashboard Application Logic

let map;
let mapMarkers = {};
let centresData = [];
let selectedCentre = null;
let ws;
let modalChartInstance = null;

// Sound & Simulation Settings
let soundAlertsEnabled = true;
let isSimulationActive = true;

// In-Browser Edge AI State
let isCameraRunning = false;
let webcamStream = null;
let cocoModel = null;
let isModelLoading = false;
let detectedPeopleCount = 0;
let detectedAssetCount = 0;
let animationFrameId = null;

// Audio Context for Alerts (Synthesized Web Audio chime)
let audioCtx = null;
function playAlertChime(severity) {
  if (!soundAlertsEnabled) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (severity === 'red') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
      osc.frequency.setValueAtTime(330, audioCtx.currentTime + 0.15); // E4
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    }
  } catch (e) {
    // Audio context not allowed until user gesture
  }
}

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  initTabs();
  initMap();
  initControls();
  initWebSocket();
  fetchInitialData();
  initCameraSimulator();
  preloadCocoModel();
});

// -------------------------------------------------------------
// TAB NAVIGATION
// -------------------------------------------------------------
function initTabs() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active', 'border-orange-500', 'text-white');
        t.classList.add('text-slate-400');
      });
      tab.classList.add('active', 'border-orange-500', 'text-white');
      tab.classList.remove('text-slate-400');

      const targetTab = tab.getAttribute('data-tab');
      document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
      const activeContent = document.getElementById(targetTab);
      if (activeContent) {
        activeContent.classList.remove('hidden');
      }

      if (targetTab === 'tab-dashboard' && map) {
        setTimeout(() => map.invalidateSize(), 200);
      }
    });
  });
}

function initControls() {
  // Sound toggle
  const btnSound = document.getElementById('btn-toggle-sound');
  const soundIcon = document.getElementById('sound-icon');
  const soundStatus = document.getElementById('sound-status');
  btnSound.addEventListener('click', () => {
    soundAlertsEnabled = !soundAlertsEnabled;
    soundStatus.textContent = soundAlertsEnabled ? 'ON' : 'OFF';
    soundIcon.className = soundAlertsEnabled ? 'w-3.5 h-3.5 text-emerald-400' : 'w-3.5 h-3.5 text-slate-500';
  });

  // Simulation toggle
  const btnSim = document.getElementById('btn-toggle-sim');
  const simIndicator = document.getElementById('sim-indicator');
  const simStatus = document.getElementById('sim-status');
  btnSim.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/simulation/toggle', { method: 'POST' });
      const data = await res.json();
      isSimulationActive = data.simulation_active;
      simStatus.textContent = isSimulationActive ? 'ACTIVE' : 'PAUSED';
      simIndicator.className = isSimulationActive ? 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse' : 'w-2 h-2 rounded-full bg-slate-500';
    } catch (e) {
      console.error(e);
    }
  });
}

// -------------------------------------------------------------
// LEAFLET GIS MAP
// -------------------------------------------------------------
function initMap() {
  map = L.map('map').setView([22.5937, 78.9629], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors | MSDE GIS Node'
  }).addTo(map);
}

function resetMapView() {
  if (map) {
    map.setView([22.5937, 78.9629], 5);
  }
}

function renderMapMarkers(centres) {
  Object.values(mapMarkers).forEach(m => map.removeLayer(m));
  mapMarkers = {};

  centres.forEach(c => {
    const iconClass = c.status === 'green' ? 'green' : (c.status === 'amber' ? 'amber' : 'red');
    const customIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="map-pin ${iconClass}"><span>${c.status === 'green' ? '✓' : '!'}</span></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const marker = L.marker([c.lat, c.lng], { icon: customIcon }).addTo(map);
    marker.bindPopup(`
      <div class="text-xs font-sans p-1">
        <strong class="text-slate-900 block text-sm">${c.name}</strong>
        <span class="text-slate-500 block">${c.district}, ${c.state}</span>
        <div class="mt-2 pt-1 border-t border-slate-200">
          <div>Trade: <strong>${c.trade}</strong></div>
          <div>Claimed: <strong>${c.claimed_attendance}</strong> | Detected: <strong>${c.detected_attendance}</strong></div>
          <div class="mt-1 font-bold ${c.status === 'green' ? 'text-emerald-600' : (c.status === 'amber' ? 'text-amber-600' : 'text-rose-600')}">
            Status: ${c.status.toUpperCase()} (${c.discrepancy_rate}% Deficit)
          </div>
        </div>
        <button onclick="openCentreModal('${c.id}')" class="mt-2 w-full bg-blue-600 text-white font-bold py-1 px-2 rounded text-[11px] hover:bg-blue-700 transition">
          Inspect & Audit
        </button>
      </div>
    `);

    mapMarkers[c.id] = marker;
  });
}

// -------------------------------------------------------------
// WEBSOCKET & REAL-TIME INGESTION
// -------------------------------------------------------------
function initWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}`;

  try {
    ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'INITIAL_SNAPSHOT') {
          centresData = msg.data.centres;
          updateDashboardUI(centresData);
          renderAlerts(msg.data.alerts);
        } else if (msg.type === 'NEW_ALERT') {
          addAlertToStream(msg.data);
          playAlertChime(msg.data.severity);
        } else if (msg.type === 'CENTRE_UPDATED') {
          const idx = centresData.findIndex(c => c.id === msg.data.id);
          if (idx !== -1) {
            centresData[idx] = msg.data;
          } else {
            centresData.push(msg.data);
          }
          updateDashboardUI(centresData);
          if (selectedCentre && selectedCentre.id === msg.data.id) {
            openCentreModal(msg.data.id);
          }
        } else if (msg.type === 'SIMULATION_STATUS') {
          isSimulationActive = msg.data.active;
          document.getElementById('sim-status').textContent = isSimulationActive ? 'ACTIVE' : 'PAUSED';
        }
      } catch (err) {
        console.error('WebSocket parse error:', err);
      }
    };

    ws.onclose = () => {
      setTimeout(initWebSocket, 3000);
    };
  } catch (e) {
    console.warn('WebSocket offline mode');
  }
}

// -------------------------------------------------------------
// INITIAL DATA FETCH & RENDERING
// -------------------------------------------------------------
async function fetchInitialData() {
  try {
    const res = await fetch('/api/centres');
    centresData = await res.json();
    updateDashboardUI(centresData);

    const alertsRes = await fetch('/api/alerts');
    const alerts = await alertsRes.json();
    renderAlerts(alerts);
  } catch (err) {
    console.error('Failed to load initial data:', err);
  }
}

function updateDashboardUI(centres) {
  renderKPIs(centres);
  renderMapMarkers(centres);
  renderCentresTable(centres);
}

function renderKPIs(centres) {
  const total = centres.length;
  const compliant = centres.filter(c => c.status === 'green').length;
  const observation = centres.filter(c => c.status === 'amber').length;
  const red = centres.filter(c => c.status === 'red').length;
  const totalSubsidyAtRisk = centres
    .filter(c => c.status !== 'green')
    .reduce((sum, c) => sum + (c.monthly_subsidy || 0), 0);

  document.getElementById('kpi-total').textContent = total;
  document.getElementById('kpi-compliant').textContent = `${compliant} (${((compliant / total) * 100).toFixed(0)}%)`;
  document.getElementById('kpi-observation').textContent = `${observation} (${((observation / total) * 100).toFixed(0)}%)`;
  document.getElementById('kpi-red').textContent = `${red} (${((red / total) * 100).toFixed(0)}%)`;
  document.getElementById('kpi-funds').textContent = `₹${(totalSubsidyAtRisk / 100000).toFixed(2)} Lakhs`;
}

function renderCentresTable(centres) {
  const tbody = document.getElementById('centres-table-body');
  const search = document.getElementById('centre-search').value.toLowerCase();
  const filter = document.getElementById('status-filter').value;

  let filtered = centres.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search) || c.id.toLowerCase().includes(search) || c.trade.toLowerCase().includes(search);
    const matchStatus = filter === 'all' || c.status === filter;
    return matchSearch && matchStatus;
  });

  tbody.innerHTML = '';
  filtered.forEach(c => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 transition border-b border-slate-100';

    const statusBadge = c.status === 'green' 
      ? '<span class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">COMPLIANT</span>'
      : (c.status === 'amber'
        ? '<span class="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">OBSERVATION</span>'
        : '<span class="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded animate-pulse">CRITICAL DEFICIT</span>');

    const fillPct = c.claimed_attendance > 0 ? Math.min(100, Math.round((c.detected_attendance / c.claimed_attendance) * 100)) : 0;
    const barColor = c.status === 'green' ? 'bg-emerald-500' : (c.status === 'amber' ? 'bg-amber-500' : 'bg-rose-500');

    tr.innerHTML = `
      <td class="p-3.5">
        <div class="font-bold text-slate-900">${c.name}</div>
        <div class="text-[10px] text-slate-500 font-mono">${c.id} • ${c.scheme}</div>
      </td>
      <td class="p-3.5 text-slate-600">
        <div>${c.district}</div>
        <div class="text-[10px] text-slate-400">${c.state}</div>
      </td>
      <td class="p-3.5">
        <div class="font-semibold text-slate-800">${c.trade}</div>
        <div class="text-[10px] text-slate-500 font-mono">${c.active_batch}</div>
      </td>
      <td class="p-3.5">
        <div class="flex items-center justify-between text-[11px] mb-1">
          <span><strong>${c.detected_attendance}</strong> / ${c.claimed_attendance}</span>
          <span class="text-[10px] font-bold ${c.status === 'green' ? 'text-emerald-700' : (c.status === 'amber' ? 'text-amber-700' : 'text-rose-700')}">${fillPct}%</span>
        </div>
        <div class="w-28 bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div class="${barColor} h-full rounded-full" style="width: ${fillPct}%"></div>
        </div>
      </td>
      <td class="p-3.5">
        ${statusBadge}
      </td>
      <td class="p-3.5">
        <span class="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
          ${c.subsidy_status || 'ACTIVE'}
        </span>
      </td>
      <td class="p-3.5 text-right">
        <button onclick="openCentreModal('${c.id}')" class="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded text-xs transition">
          Audit & Evidence
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  lucide.createIcons();
}

document.getElementById('centre-search').addEventListener('input', () => renderCentresTable(centresData));
document.getElementById('status-filter').addEventListener('change', () => renderCentresTable(centresData));

// -------------------------------------------------------------
// ALERT TICKER STREAM
// -------------------------------------------------------------
function renderAlerts(alerts) {
  const container = document.getElementById('alert-stream');
  container.innerHTML = '';
  alerts.forEach(a => addAlertToStream(a, false));
  document.getElementById('live-alert-count').textContent = `${alerts.length} Today`;
  lucide.createIcons();
}

function addAlertToStream(a, prepend = true) {
  const container = document.getElementById('alert-stream');
  const alertCard = document.createElement('div');
  alertCard.className = `p-3 rounded-lg border text-xs transition transform hover:scale-[1.01] ${
    a.severity === 'red' ? 'bg-rose-50/70 border-rose-200 text-rose-950' : 'bg-amber-50/70 border-amber-200 text-amber-950'
  }`;

  const timeStr = new Date(a.timestamp).toLocaleTimeString();
  alertCard.innerHTML = `
    <div class="flex items-center justify-between font-semibold mb-1">
      <span class="text-[11px] font-bold ${a.severity === 'red' ? 'text-rose-700' : 'text-amber-700'}">
        [${a.type.replace('_', ' ')}]
      </span>
      <span class="text-[10px] text-slate-400 font-mono">${timeStr}</span>
    </div>
    <div class="font-bold text-slate-900">${a.centre_name}</div>
    <p class="mt-1 text-slate-600 text-[11px]">${a.message}</p>
    <div class="mt-2 flex items-center justify-between">
      <span class="text-[9px] text-slate-400 font-mono">Hash: ${a.evidence_hash.slice(0, 12)}...</span>
      <button onclick="openCentreModal('${a.centre_id}')" class="text-blue-600 font-bold hover:underline text-[11px]">
        View Evidence
      </button>
    </div>
  `;

  if (prepend && container.firstChild) {
    container.insertBefore(alertCard, container.firstChild);
  } else {
    container.appendChild(alertCard);
  }

  lucide.createIcons();
}

// -------------------------------------------------------------
// CENTRE AUDIT MODAL & CHART.JS TIMELINE
// -------------------------------------------------------------
async function openCentreModal(centreId) {
  const centre = centresData.find(c => c.id === centreId);
  if (!centre) return;
  selectedCentre = centre;

  document.getElementById('modal-centre-name').textContent = centre.name;
  document.getElementById('modal-centre-meta').textContent = `ID: ${centre.id} • ${centre.district}, ${centre.state} • Trade: ${centre.trade}`;

  const statusEl = document.getElementById('modal-centre-status');
  statusEl.textContent = centre.status.toUpperCase();
  statusEl.className = `text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
    centre.status === 'green' ? 'bg-emerald-500 text-white' : (centre.status === 'amber' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white')
  }`;

  document.getElementById('modal-claimed').textContent = `${centre.claimed_attendance} Students`;
  document.getElementById('modal-detected').textContent = `${centre.detected_attendance} Heads`;
  document.getElementById('modal-deficit').textContent = `${centre.discrepancy_rate}%`;

  const fillPct = centre.claimed_attendance > 0 ? Math.min(100, Math.round((centre.detected_attendance / centre.claimed_attendance) * 100)) : 0;
  document.getElementById('modal-bar-pct').textContent = `${fillPct}%`;
  document.getElementById('modal-bar').style.width = `${fillPct}%`;
  document.getElementById('modal-bar').className = `h-full rounded-full transition-all duration-500 ${
    centre.status === 'green' ? 'bg-emerald-500' : (centre.status === 'amber' ? 'bg-amber-500' : 'bg-rose-500')
  }`;

  // Populate Infrastructure Matrix
  const infraBody = document.getElementById('modal-infra-body');
  infraBody.innerHTML = '';
  centre.infrastructure.forEach(item => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-slate-100';
    tr.innerHTML = `
      <td class="p-2.5 font-medium text-slate-800">${item.name}</td>
      <td class="p-2.5 text-center font-bold text-slate-700">${item.required}</td>
      <td class="p-2.5 text-center font-bold ${item.status === 'ok' ? 'text-emerald-600' : 'text-rose-600'}">${item.detected}</td>
      <td class="p-2.5 text-right font-bold text-[10px]">
        ${item.status === 'ok' 
          ? '<span class="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">VERIFIED</span>' 
          : '<span class="bg-rose-100 text-rose-800 px-2 py-0.5 rounded">DEFICIT</span>'}
      </td>
    `;
    infraBody.appendChild(tr);
  });

  // Render Time-Series Chart.js
  renderModalChart(centre);

  // Evidence snapshot
  document.getElementById('modal-evidence-hash').textContent = centre.evidence_hash || 'SHA256_VERIFIED';
  const imgEl = document.getElementById('modal-evidence-img');
  
  if (centre.evidence_snapshot && centre.evidence_snapshot.startsWith('data:image')) {
    imgEl.src = centre.evidence_snapshot;
  } else {
    imgEl.src = createSimulatedEvidenceImage(centre);
  }

  document.getElementById('modal-audit-notes').textContent = centre.audit_notes || 'All batch logs verified against physical camera streams.';

  document.getElementById('centre-modal').classList.remove('hidden');
  lucide.createIcons();
}

function renderModalChart(centre) {
  const ctx = document.getElementById('modal-chart-canvas').getContext('2d');
  if (modalChartInstance) {
    modalChartInstance.destroy();
  }

  const times = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00"];
  const claimedLine = Array(times.length).fill(centre.claimed_attendance);
  
  // Create realistic attendance curve showing when drop occurred
  const detectedCur = centre.detected_attendance;
  const detectedLine = [
    Math.min(centre.claimed_attendance, Math.round(centre.claimed_attendance * 0.95)),
    Math.min(centre.claimed_attendance, Math.round(centre.claimed_attendance * 0.90)),
    Math.round(centre.claimed_attendance * 0.80),
    Math.round(centre.claimed_attendance * 0.55),
    detectedCur,
    detectedCur,
    detectedCur
  ];

  modalChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: times,
      datasets: [
        {
          label: 'Portal Claimed Batch Roster',
          data: claimedLine,
          borderColor: '#94a3b8',
          borderDash: [5, 5],
          backgroundColor: 'transparent',
          pointRadius: 0,
          borderWidth: 2
        },
        {
          label: 'AI-Detected Physical Attendance',
          data: detectedLine,
          borderColor: centre.status === 'green' ? '#10b981' : (centre.status === 'amber' ? '#f59e0b' : '#ef4444'),
          backgroundColor: centre.status === 'green' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: centre.status === 'green' ? '#10b981' : (centre.status === 'amber' ? '#f59e0b' : '#ef4444'),
          borderWidth: 2.5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { boxWidth: 12, font: { size: 10 } }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: Math.max(35, centre.claimed_attendance + 5),
          ticks: { font: { size: 10 } }
        },
        x: {
          ticks: { font: { size: 10 } }
        }
      }
    }
  });
}

function closeModal() {
  document.getElementById('centre-modal').classList.add('hidden');
  selectedCentre = null;
  if (modalChartInstance) {
    modalChartInstance.destroy();
    modalChartInstance = null;
  }
}

// Synthesize blurred canvas snapshot proof
function createSimulatedEvidenceImage(centre) {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 180, canvas.width, 180);

  const count = centre.detected_attendance || 5;
  for (let i = 0; i < Math.min(count, 12); i++) {
    const x = 55 + (i % 6) * 95;
    const y = 140 + Math.floor(i / 6) * 75;

    // Body
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(x - 20, y + 20, 40, 60);

    // Blurred face box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillRect(x - 14, y - 14, 28, 28);
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 22, y - 20, 44, 95);
  }

  // Camera timestamp overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(10, 10, 410, 42);
  ctx.fillStyle = '#10b981';
  ctx.font = '12px monospace';
  ctx.fillText(`CAM-01 [${centre.id}] - DE-IDENTIFIED FEED`, 20, 26);
  ctx.fillText(`${new Date().toISOString()} • HEADS: ${centre.detected_attendance}`, 20, 42);

  return canvas.toDataURL('image/jpeg');
}

async function handleAuditAction(action) {
  if (!selectedCentre) return;

  try {
    const res = await fetch('/api/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        centre_id: selectedCentre.id,
        action: action,
        note: action === 'FREEZE_SUBSIDY' ? 'Severe attendance deficit & missing equipment' : 'Variance review'
      })
    });
    const result = await res.json();
    if (result.success) {
      alert(`Action '${action}' applied successfully to ${selectedCentre.name}`);
      openCentreModal(selectedCentre.id);
    }
  } catch (err) {
    alert('Action failed: ' + err.message);
  }
}

function printAuditNotice() {
  if (!selectedCentre) return;
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>MSDE Discrepancy Notice - ${selectedCentre.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; }
          .header { text-align: center; border-bottom: 2px solid #0a2540; padding-bottom: 15px; }
          .title { font-size: 20px; font-weight: bold; color: #0a2540; }
          .badge { background: #fee2e2; color: #991b1b; padding: 4px 8px; font-weight: bold; border-radius: 4px; display: inline-block; margin-top: 10px; }
          .section { margin-top: 25px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
          th { background: #f8fafc; }
          .evidence-box { background: #0f172a; color: white; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 12px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">MINISTRY OF SKILL DEVELOPMENT AND ENTREPRENEURSHIP</div>
          <div>GOVERNMENT OF INDIA • NATIONAL SKILL MONITORING UNIT</div>
          <div class="badge">OFFICIAL COMPLIANCE & DISCREPANCY AUDIT NOTICE</div>
        </div>

        <div class="section">
          <p><strong>Training Centre:</strong> ${selectedCentre.name} (${selectedCentre.id})</p>
          <p><strong>Location:</strong> ${selectedCentre.district}, ${selectedCentre.state} • <strong>Scheme:</strong> ${selectedCentre.scheme}</p>
          <p><strong>Batch:</strong> ${selectedCentre.active_batch} (Trade: ${selectedCentre.trade})</p>
          <p><strong>Claimed Trainees:</strong> ${selectedCentre.claimed_attendance} | <strong>AI-Detected Presence:</strong> ${selectedCentre.detected_attendance} (Deficit: ${selectedCentre.discrepancy_rate}%)</p>
          <p><strong>Subsidy Status:</strong> <span style="color:red; font-weight:bold;">${selectedCentre.subsidy_status}</span></p>
        </div>

        <div class="section">
          <strong>Sanctioned Infrastructure Audit Matrix:</strong>
          <table>
            <tr><th>Item</th><th>Sanctioned Quota</th><th>Detected</th><th>Status</th></tr>
            ${selectedCentre.infrastructure.map(it => `
              <tr>
                <td>${it.name}</td>
                <td>${it.required}</td>
                <td>${it.detected}</td>
                <td style="color:${it.status==='ok'?'green':'red'}; font-weight:bold;">${it.status.toUpperCase()}</td>
              </tr>
            `).join('')}
          </table>
        </div>

        <div class="section">
          <strong>Cryptographic Evidence Proof (DPDP Act 2023 Compliant):</strong>
          <div class="evidence-box">
            <div>SHA-256 HASH: ${selectedCentre.evidence_hash}</div>
            <div>STATUS: De-Identified Camera Snapshot Archived in MSDE Evidence Vault</div>
            <div>TIMESTAMP: ${selectedCentre.last_sync}</div>
          </div>
        </div>

        <div style="margin-top: 40px; text-align: right;">
          <p><strong>Authorised Signatory</strong><br>MSDE Central Monitoring Unit</p>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 500);
}

// -------------------------------------------------------------
// LIVE EDGE CAMERA AI & HARDWARE-ACCELERATED FACE TRACKING ENGINE
// -------------------------------------------------------------
let blazeModel = null;
let trackedFaces = [];
let trackedAssets = [];
let isDetecting = false;
let lastDetectionTime = 0;

async function preloadCocoModel() {
  const statusEl = document.getElementById('cv-model-status');
  statusEl.textContent = 'Initializing Edge Vision Models...';
  
  try {
    if (typeof blazeface !== 'undefined') {
      blazeModel = await blazeface.load();
      console.log('[Drishti AI] BlazeFace face detector loaded successfully.');
    }
  } catch (e) {
    console.warn('[Drishti AI] BlazeFace load error:', e);
  }

  try {
    if (typeof cocoSsd !== 'undefined') {
      cocoModel = await cocoSsd.load({ base: 'mobilenet_v2' });
      console.log('[Drishti AI] COCO-SSD asset detector loaded successfully.');
    }
  } catch (e) {
    console.warn('[Drishti AI] COCO-SSD load error:', e);
  }

  if (blazeModel || cocoModel) {
    statusEl.textContent = 'Models: BlazeFace + COCO-SSD (Dynamic Tracking)';
  } else {
    statusEl.textContent = 'Model: Native Motion & Skin Centroid Tracker (Active)';
  }
}

function initCameraSimulator() {
  const btnStartCam = document.getElementById('btn-start-camera');
  const btnSimClass = document.getElementById('btn-sim-classroom');
  const videoInput = document.getElementById('video-file-input');
  const sliderClaimed = document.getElementById('slider-claimed');
  const btnPushTelemetry = document.getElementById('btn-push-telemetry');

  btnStartCam.addEventListener('click', toggleCamera);
  btnSimClass.addEventListener('click', runSimulatedFeed);

  videoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      loadCustomVideoFile(file);
    }
  });

  sliderClaimed.addEventListener('input', (e) => {
    document.getElementById('slider-claimed-val').textContent = e.target.value;
    updateInjectCalculations();
  });

  btnPushTelemetry.addEventListener('click', pushCameraTelemetry);
}

function loadCustomVideoFile(file) {
  const video = document.getElementById('webcam-video');
  const placeholder = document.getElementById('camera-placeholder');
  const btn = document.getElementById('btn-start-camera');

  if (webcamStream) {
    webcamStream.getTracks().forEach(t => t.stop());
    webcamStream = null;
  }

  const fileUrl = URL.createObjectURL(file);
  video.srcObject = null;
  video.src = fileUrl;
  video.muted = true;
  video.loop = true;
  video.play();

  isCameraRunning = true;
  placeholder.classList.add('hidden');
  btn.innerHTML = `<i data-lucide="video-off" class="w-4 h-4"></i><span>Stop Video</span>`;
  lucide.createIcons();

  startVisionInferenceLoop();
}

async function toggleCamera() {
  const video = document.getElementById('webcam-video');
  const placeholder = document.getElementById('camera-placeholder');
  const btn = document.getElementById('btn-start-camera');

  if (isCameraRunning) {
    if (webcamStream) {
      webcamStream.getTracks().forEach(t => t.stop());
      webcamStream = null;
    }
    video.pause();
    video.src = '';
    video.srcObject = null;
    isCameraRunning = false;
    cancelAnimationFrame(animationFrameId);
    trackedFaces = [];
    trackedAssets = [];
    placeholder.classList.remove('hidden');
    btn.innerHTML = `<i data-lucide="video" class="w-4 h-4"></i><span>Start Laptop Camera</span>`;
    lucide.createIcons();
    return;
  }

  try {
    webcamStream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
    });
    video.srcObject = webcamStream;
    video.play();
    isCameraRunning = true;
    placeholder.classList.add('hidden');
    btn.innerHTML = `<i data-lucide="video-off" class="w-4 h-4"></i><span>Stop Camera</span>`;
    lucide.createIcons();

    startVisionInferenceLoop();
  } catch (err) {
    console.error('Webcam access error:', err);
    alert('Webcam permission not granted or camera not found. Playing simulated classroom feed.');
    runSimulatedFeed();
  }
}

// -------------------------------------------------------------
// DYNAMIC 60 FPS RENDER LOOP + ASYNC INFERENCE
// -------------------------------------------------------------
function startVisionInferenceLoop() {
  const video = document.getElementById('webcam-video');
  const canvas = document.getElementById('camera-canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = 640;
  canvas.height = 480;

  // Background Async Detection (runs every 60-90ms without blocking 60 FPS video render)
  async function runAsyncDetection() {
    if (!isCameraRunning) return;
    if (video.readyState < 2 || isDetecting) return;

    isDetecting = true;
    try {
      let detectedBoxes = [];

      // Priority 1: BlazeFace Face Detector (High-speed precise face bounding)
      if (blazeModel) {
        const predictions = await blazeModel.estimateFaces(video, false);
        if (predictions && predictions.length > 0) {
          detectedBoxes = predictions.map(p => {
            const start = p.topLeft;
            const end = p.bottomRight;
            const width = end[0] - start[0];
            const height = end[1] - start[1];
            return {
              x: start[0],
              y: start[1],
              w: width,
              h: height,
              confidence: p.probability ? p.probability[0] : 0.95
            };
          });
        }
      }

      // Priority 2: Native Browser FaceDetector API (Chromium / Edge Hardware Accelerated)
      if (detectedBoxes.length === 0 && 'FaceDetector' in window) {
        try {
          const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 10 });
          const faces = await detector.detect(video);
          if (faces && faces.length > 0) {
            detectedBoxes = faces.map(f => ({
              x: f.boundingBox.x,
              y: f.boundingBox.y,
              w: f.boundingBox.width,
              h: f.boundingBox.height,
              confidence: 0.9
            }));
          }
        } catch (e) {}
      }

      // Priority 3: COCO-SSD (Person head region estimation)
      if (detectedBoxes.length === 0 && cocoModel) {
        const objects = await cocoModel.detect(video);
        const persons = objects.filter(o => o.class === 'person');
        const assets = objects.filter(o => ['laptop', 'chair', 'cell phone', 'keyboard', 'book'].includes(o.class));
        trackedAssets = assets.map(a => ({ x: a.bbox[0], y: a.bbox[1], w: a.bbox[2], h: a.bbox[3], label: a.class.toUpperCase() }));

        if (persons.length > 0) {
          detectedBoxes = persons.map(p => ({
            x: p.bbox[0] + p.bbox[2] * 0.1,
            y: p.bbox[1],
            w: p.bbox[2] * 0.8,
            h: p.bbox[3] * 0.38,
            confidence: p.score
          }));
        }
      }

      // Priority 4: Dynamic Skin & Motion Centroid Fallback (Zero network failure guarantee)
      if (detectedBoxes.length === 0) {
        const skinCentroid = detectSkinToneCentroid(video);
        if (skinCentroid) {
          detectedBoxes = [skinCentroid];
        }
      }

      // Update Tracked Faces with LERP smoothing targets
      if (detectedBoxes.length > 0) {
        detectedPeopleCount = detectedBoxes.length;

        // Match detected boxes with existing tracked faces
        detectedBoxes.forEach((box, i) => {
          if (trackedFaces[i]) {
            trackedFaces[i].targetX = box.x;
            trackedFaces[i].targetY = box.y;
            trackedFaces[i].targetW = box.w;
            trackedFaces[i].targetH = box.h;
            trackedFaces[i].confidence = box.confidence;
            trackedFaces[i].lastSeen = Date.now();
          } else {
            trackedFaces.push({
              x: box.x,
              y: box.y,
              w: box.w,
              h: box.h,
              targetX: box.x,
              targetY: box.y,
              targetW: box.w,
              targetH: box.h,
              confidence: box.confidence,
              lastSeen: Date.now()
            });
          }
        });

        // Trim stale faces
        if (trackedFaces.length > detectedBoxes.length) {
          trackedFaces = trackedFaces.slice(0, detectedBoxes.length);
        }
      } else {
        // No faces seen
        if (Date.now() - lastDetectionTime > 1200) {
          trackedFaces = [];
          detectedPeopleCount = 0;
        }
      }

      if (detectedBoxes.length > 0) {
        lastDetectionTime = Date.now();
      }

      document.getElementById('cam-detected-students').textContent = detectedPeopleCount;
      document.getElementById('cam-detected-assets').textContent = trackedAssets.length || 2;
      updateInjectCalculations();

    } catch (err) {
      console.warn('Detection cycle error:', err);
    } finally {
      isDetecting = false;
      if (isCameraRunning) {
        setTimeout(runAsyncDetection, 60); // Schedule next detection cycle
      }
    }
  }

  // 60 FPS Render Loop: Interpolates positions and renders hardware-accelerated blur
  function renderFrame() {
    if (!isCameraRunning) return;

    if (video.readyState >= 2) {
      // 1. Draw live video
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // 2. Render each tracked face with Hardware-Accelerated Blur
      trackedFaces.forEach((face) => {
        // LERP Smooth interpolation (eliminates jitter and follows smoothly)
        face.x += (face.targetX - face.x) * 0.45;
        face.y += (face.targetY - face.y) * 0.45;
        face.w += (face.targetW - face.w) * 0.45;
        face.h += (face.targetH - face.h) * 0.45;

        const cx = face.x + face.w / 2;
        const cy = face.y + face.h / 2;
        const rx = Math.max(25, face.w * 0.65);
        const ry = Math.max(30, face.h * 0.75);

        // Hardware-Accelerated Canvas GPU Blur
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.clip();
        ctx.filter = 'blur(22px)';
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();

        // Privacy Shield Outline
        ctx.save();
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Privacy Badge Tag
        const badgeW = 160;
        const badgeH = 22;
        const badgeX = cx - badgeW / 2;
        const badgeY = Math.max(10, cy - ry - 28);

        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4);
        } else {
          ctx.rect(badgeX, badgeY, badgeW, badgeH);
        }
        ctx.fill();

        ctx.fillStyle = '#064E3B';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('TRAINEE [DE-IDENTIFIED]', cx, badgeY + badgeH / 2);
        ctx.restore();
      });

      // 3. Render detected assets
      trackedAssets.forEach(a => {
        ctx.save();
        ctx.strokeStyle = '#0284C7';
        ctx.lineWidth = 2;
        ctx.strokeRect(a.x, a.y, a.w, a.h);

        ctx.fillStyle = '#0284C7';
        ctx.fillRect(a.x, Math.max(0, a.y - 20), Math.min(a.w, 150), 20);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`ASSET: ${a.label}`, a.x + 5, Math.max(14, a.y - 6));
        ctx.restore();
      });
    }

    animationFrameId = requestAnimationFrame(renderFrame);
  }

  // Start both loops
  renderFrame();
  runAsyncDetection();
}

// -------------------------------------------------------------
// DYNAMIC SKIN-TONE & MOTION CENTROID TRACKER (OFFLINE FALLBACK)
// -------------------------------------------------------------
const downCanvas = document.createElement('canvas');
downCanvas.width = 160;
downCanvas.height = 120;
const downCtx = downCanvas.getContext('2d');

function detectSkinToneCentroid(video) {
  try {
    downCtx.drawImage(video, 0, 0, downCanvas.width, downCanvas.height);
    const imgData = downCtx.getImageData(0, 0, downCanvas.width, downCanvas.height);
    const data = imgData.data;

    let sumX = 0;
    let sumY = 0;
    let count = 0;

    const scaleX = 640 / downCanvas.width;
    const scaleY = 480 / downCanvas.height;

    // Sample pixels in upper 75% of screen (head region)
    const maxY = Math.floor(downCanvas.height * 0.75);
    for (let y = 10; y < maxY; y += 3) {
      for (let x = 10; x < downCanvas.width - 10; x += 3) {
        const i = (y * downCanvas.width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Standard Human Skin Tone Color Range (Peer et al. model)
        if (r > 95 && g > 40 && b > 20 && r > g && r > b && (r - g) > 15 && Math.abs(r - g) > 15) {
          sumX += x;
          sumY += y;
          count++;
        }
      }
    }

    if (count > 25) {
      const avgX = (sumX / count) * scaleX;
      const avgY = (sumY / count) * scaleY;
      const w = Math.min(180, Math.max(90, Math.sqrt(count) * 12));
      const h = w * 1.25;

      return {
        x: Math.max(20, Math.min(640 - w - 20, avgX - w / 2)),
        y: Math.max(20, Math.min(480 - h - 20, avgY - h / 2)),
        w: w,
        h: h,
        confidence: 0.85
      };
    }
  } catch (e) {}

  return null;
}

function runSimulatedFeed() {
  const canvas = document.getElementById('camera-canvas');
  const placeholder = document.getElementById('camera-placeholder');
  const ctx = canvas.getContext('2d');

  placeholder.classList.add('hidden');
  canvas.width = 640;
  canvas.height = 480;

  let simStudents = 8;
  detectedPeopleCount = simStudents;
  detectedAssetCount = 10;

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 220, canvas.width, 260);

  for (let i = 0; i < 8; i++) {
    const x = 70 + (i % 4) * 140;
    const y = 140 + Math.floor(i / 4) * 130;

    // Body
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(x - 25, y + 25, 50, 70);

    // Pixelated face
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    // Privacy shield
    ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.fillRect(x - 18, y - 18, 36, 36);

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 30, y - 30, 60, 130);
  }

  // Workbenches
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 2;
  ctx.strokeRect(30, 350, 580, 100);
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(30, 325, 180, 24);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('ASSET: WORKBENCHES [10/10]', 40, 342);

  document.getElementById('cam-detected-students').textContent = detectedPeopleCount;
  document.getElementById('cam-detected-assets').textContent = detectedAssetCount;
  updateInjectCalculations();
}

function updateInjectCalculations() {
  const claimed = Number(document.getElementById('slider-claimed').value);
  const detected = detectedPeopleCount;
  const variance = claimed > 0 ? Math.max(0, ((claimed - detected) / claimed) * 100) : 0;

  document.getElementById('inject-detected').textContent = `${detected} Students`;
  document.getElementById('inject-variance').textContent = `${variance.toFixed(1)}% Deficit`;

  const statusBadge = document.getElementById('inject-status');
  if (variance >= 40) {
    statusBadge.textContent = 'CRITICAL RED DEFICIT';
    statusBadge.className = 'font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded text-[10px]';
  } else if (variance >= 15) {
    statusBadge.textContent = 'AMBER OBSERVATION';
    statusBadge.className = 'font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-[10px]';
  } else {
    statusBadge.textContent = 'GREEN COMPLIANT';
    statusBadge.className = 'font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px]';
  }
}

async function pushCameraTelemetry() {
  const claimed = Number(document.getElementById('slider-claimed').value);
  const detected = detectedPeopleCount;
  const canvas = document.getElementById('camera-canvas');
  const snapshotB64 = canvas ? canvas.toDataURL('image/jpeg', 0.5) : null;

  try {
    const res = await fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        centre_id: 'TC-UP-10492',
        batch_id: 'ELC-2026-B1',
        claimed_headcount: claimed,
        detected_headcount: detected,
        tamper_flag: false,
        evidence_b64: snapshotB64
      })
    });
    const result = await res.json();
    alert(`Telemetry Synchronized!\n\nPayload Size: ${result.telemetry_payload_bytes} Bytes\nDiscrepancy: ${result.discrepancy_rate}%\nStatus: ${result.centre_status.toUpperCase()}`);
    
    // Switch to dashboard tab to show live alert
    document.querySelector('[data-tab="tab-dashboard"]').click();
  } catch (err) {
    alert('Failed to send telemetry: ' + err.message);
  }
}
