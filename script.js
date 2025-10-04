const toggle = document.getElementById('theme-toggle');
toggle.addEventListener('click', () => document.body.classList.toggle('dark'));

let RAW = [];
let REGION_COL = null;
let YEAR_COL = null;
let NUMERIC_COLS = [];
let SETTINGS = {};

const regionSelect = document.getElementById('region-select');
const metricsContainer = document.getElementById('metrics-container');
const applyBtn = document.getElementById('apply-btn');
const reloadBtn = document.getElementById('reload-btn');
const kpisEl = document.getElementById('kpis');
const chartsEl = document.getElementById('charts');
const actionsWrap = document.getElementById('action-cards');

const targetsBtn = document.getElementById('targets-btn');
const targetsModal = document.getElementById('targets-modal');
const targetsForm = document.getElementById('targets-form');
const targetsClose = document.getElementById('targets-close');
const targetsSave = document.getElementById('targets-save');

const exportActionsPDF = document.getElementById('export-actions-pdf');

const REGION_COL_NAME = null;
const YEAR_COL_NAME = null;
const METRIC_WHITELIST = [
  "household_kids_under18",
  "commute_without_car_fee",
  "commute_time",
  "population_asian",
  "crime_rate",
  "median_income",
  "child_capacity"
];

const childcareFacilities = {
  Bronx: [
    { name: "Casita Maria Inc.", capacity: 561 },
    { name: "Directions for Our Youth, Inc", capacity: 464 },
    { name: "Women's Housing and Economic Development", capacity: 460 },
    { name: "SCAN-Harbor", capacity: 420 },
    { name: "Mosholu Montefiore Community Center", capacity: 415 },
    { name: "GOOD SHEPHERD SERVICES CS 300", capacity: 399 },
    { name: "New York Edge, Inc.", capacity: 375 },
    { name: "Mosholu-Montefiore Community Center", capacity: 352 },
    { name: "LEAP AFTER SCHOOL AT I.S 22", capacity: 360 },
    { name: "ASPIRA of New York", capacity: 353 },
    { name: "Mosholu Montefiore Community Ctr @PS/", capacity: 352 },
    { name: "Kips Bay Boys & Girls Club", capacity: 342 },
    { name: "New Settlement Apartments", capacity: 340 }
  ],
  Brooklyn: [
    { name: "Stats Legacy Inc", capacity: 780 },
    { name: "CYPRESS HILLS LOCAL DEVELOPMENT", capacity: 671 },
    { name: "Yeshivath Kehilath Yaklov", capacity: 491 },
    { name: "ONE WORLD AFTER SCH PS 186", capacity: 466 },
    { name: "St. Nicks Alliance Corp PS: 147", capacity: 420 },
    { name: "NIA Community Services Network @ IS 98", capacity: 409 },
    { name: "BCA A S P @ PS 105", capacity: 400 },
    { name: "InnovateEDU Inc", capacity: 400 },
    { name: "Morningside Center for Teaching Social Responsibility", capacity: 380 },
    { name: "HD Tech Holdings Inc.", capacity: 372 },
    { name: "Big Apple Institute", capacity: 366 },
    { name: "NIA Community Services Network", capacity: 360 },
    { name: "Center for Family Life in Sunset Park", capacity: 360 }
  ],
  Queens: [
    { name: "Samuel Field Y @ PS/IS 266", capacity: 400 },
    { name: "O.S.T Program @ P.S. 306", capacity: 300 },
    { name: "BPA of NY INC.", capacity: 267 },
    { name: "New York Edge, Inc.", capacity: 263 },
    { name: "Boys & Girls Club of Metro Queens @ P.S. 97", capacity: 248 },
    { name: "NYJTL @ PS 219Q", capacity: 240 },
    { name: "Samuel Field YM & YWHA, Inc. @ PS / MS 200", capacity: 238 },
    { name: "Samuel Field YM & YWHA", capacity: 221 },
    { name: "Jacob A. Riis Settlement House @ PS 111Q", capacity: 200 },
    { name: "NYJTL Aces Club @ P.S.42Q", capacity: 194 },
    { name: "Queens Community House, Inc.", capacity: 193 },
    { name: "THE GREATER RIDGEWOOD YOUTH COUNCIL, INC.", capacity: 188 },
    { name: "Coalition For Hispanic Family Services @ PS 7", capacity: 184 },
    { name: "New York Edge, Inc.", capacity: 180 },
    { name: "Boys & Girls Club of Metro Queens", capacity: 180 }
  ],
  Manhattan: [
    { name: "Manhattan Youth Recreation & Resources Inc.", capacity: 156 },
    { name: "KidZone@PS 178M, Inc.", capacity: 83 },
    { name: "Zavala, Maribel Ofelia", capacity: 16 },
    { name: "Taveras, Ana", capacity: 16 },
    { name: "DD Play and Learn Daycare LLC", capacity: 16 },
    { name: "Reynoso De Barcacel, Carla", capacity: 16 },
    { name: "Tuggles, Lashonne", capacity: 16 },
    { name: "Perdomo Cabrera, Sonia Michelle", capacity: 16 },
    { name: "Feliz, Luz O.", capacity: 14 },
    { name: "Santos, Zoraida", capacity: 12 },
    { name: "Tejeda, Aurelia", capacity: 10 },
    { name: "Cedeno, Esthel", capacity: 10 },
    { name: "Larancuent De Gray, Rosa", capacity: 8 }
  ],
  StatenIsland: [
    { name: "New York Center for Interpersonal Development 1", capacity: 479 },
    { name: "New York Center for Interpersonal Development 2", capacity: 437 },
    { name: "New York Center for Interpersonal Development 3", capacity: 400 },
    { name: "Police Athletic League @TASC Petrides PS 80", capacity: 326 },
    { name: "New York Center for Interpersonal Development 4", capacity: 300 },
    { name: "YMCA of Greater NY @Virtual Y PS 19", capacity: 290 },
    { name: "YMCA of Greater NY @Staten Island Virtual Y PS 57", capacity: 248 },
    { name: "New York Edge, Inc.", capacity: 240 },
    { name: "United Activities Unlimited, Inc.", capacity: 226 },
    { name: "Jewish Community Center of Staten Island", capacity: 209 },
    { name: "United Activities Unlimited, Inc. @ IS 7", capacity: 203 },
    { name: "Jewish Community Center of Staten Island, Inc.", capacity: 200 },
    { name: "New York Center for Interpersonal Development 5", capacity: 200 },
    { name: "The Children's Aid Society @Goodhue Center", capacity: 195 },
    { name: "YMCA of Greater NY @Staten Island ASP PS 22", capacity: 191 }
  ]
};

bootstrap();
reloadBtn.addEventListener('click', () => bootstrap(true));

applyBtn.addEventListener('click', () => {
  const region = regionSelect.value;
  if (!region) return;
  const selectedMetrics = [...metricsContainer.querySelectorAll('.metric-chip input:checked')].map(i => i.value);
  const filtered = RAW.filter(r => {
    const rv = (r[REGION_COL] ?? '').toString().trim().toLowerCase();
    return rv === region.toLowerCase();
  });
  renderKPIs(filtered, selectedMetrics);
  renderCharts(filtered, selectedMetrics);
  renderActions(filtered, selectedMetrics);
});

regionSelect.addEventListener('change', () => applyBtn.disabled = !regionSelect.value);

document.getElementById('select-all').addEventListener('click', () => {
  metricsContainer.querySelectorAll('.metric-chip').forEach(chip => {
    const input = chip.querySelector('input');
    input.checked = true;
    chip.classList.add('active');
  });
});
document.getElementById('clear-all').addEventListener('click', () => {
  metricsContainer.querySelectorAll('.metric-chip').forEach(chip => {
    const input = chip.querySelector('input');
    input.checked = false;
    chip.classList.remove('active');
  });
});
metricsContainer.addEventListener('click', e => {
  const chip = e.target.closest('.metric-chip');
  if (!chip) return;
  const input = chip.querySelector('input[type="checkbox"]');
  input.checked = !input.checked;
  chip.classList.toggle('active', input.checked);
});

targetsBtn.addEventListener('click', openTargets);
targetsClose.addEventListener('click', () => targetsModal.classList.add('hidden'));
targetsSave.addEventListener('click', saveSettings);

exportActionsPDF.addEventListener('click', async () => {
  const node = document.getElementById('actions');
  const canvas = await html2canvas(node, { scale: 2 });
  const img = canvas.toDataURL('image/png');
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgProps = pdf.getImageProperties(img);
  const ratio = Math.min(pageWidth / imgProps.width, pageHeight / imgProps.height);
  const w = imgProps.width * ratio;
  const h = imgProps.height * ratio;
  pdf.addImage(img, 'PNG', (pageWidth - w) / 2, 10, w, h);
  pdf.save('actions.pdf');
});

async function bootstrap(bustCache = false) {
  const wb = await fetchWorkbook('database.xlsx', bustCache);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  RAW = XLSX.utils.sheet_to_json(sheet, { defval: null });
  normalizeColumns();
  detectColumns();
  loadSettings();
  buildRegionFilter();
  buildMetricCheckboxes();
  kpisEl.innerHTML = '';
  chartsEl.innerHTML = '';
  actionsWrap.innerHTML = '';
  applyBtn.disabled = !regionSelect.value;
}

async function fetchWorkbook(path, bust) {
  const url = bust ? `${path}?t=${Date.now()}` : path;
  const buf = await fetch(url, { cache: 'no-store' }).then(r => r.arrayBuffer());
  return XLSX.read(buf, { type: 'array' });
}

function normalizeColumns() {
  RAW = RAW.map(r => {
    const out = {};
    Object.keys(r).forEach(k => out[String(k).trim()] = r[k]);
    return out;
  });
}

function detectColumns() {
  const cols = Object.keys(RAW[0] || {});
  REGION_COL = REGION_COL_NAME || findCol(cols, ['region', 'region display', 'region_display', 'borough']);
  YEAR_COL = YEAR_COL_NAME || findCol(cols, ['year', 'fiscal_year', 'fiscal year']);
  if (!YEAR_COL) {
    const yearish = cols.find(c => {
      const vals = RAW.map(r => toNum(r[c])).filter(v => v !== null);
      if (vals.length < 3) return false;
      const uniq = [...new Set(vals.map(x => Math.round(x)))];
      const inRange = uniq.filter(y => y >= 1900 && y <= 2100);
      return inRange.length >= Math.max(3, Math.ceil(uniq.length * 0.6));
    });
    YEAR_COL = yearish || null;
  }
  let numericCandidates = cols
    .filter(c => ![REGION_COL, YEAR_COL].includes(c))
    .filter(c => {
      const nums = RAW.map(r => toNum(r[c])).filter(v => v !== null);
      if (nums.length === 0) return false;
      return new Set(nums).size > 1;
    });
  if (METRIC_WHITELIST.length) {
    const present = new Set(cols);
    const fromWhitelist = METRIC_WHITELIST.filter(c => present.has(c));
    if (fromWhitelist.length) numericCandidates = fromWhitelist;
  }
  if (numericCandidates.length === 0) numericCandidates = cols.filter(c => ![REGION_COL, YEAR_COL].includes(c));
  if (numericCandidates.length === 0 && cols.length) numericCandidates = cols.slice(0, Math.min(8, cols.length));
  NUMERIC_COLS = numericCandidates;
}

function findCol(cols, aliases) {
  const lc = cols.map(c => c.toLowerCase());
  for (const a of aliases) {
    const idx = lc.indexOf(a);
    if (idx !== -1) return cols[idx];
  }
  return cols.find(c => aliases.some(a => c.toLowerCase().includes(a.replace('_', ' ')))) || null;
}

function toNum(v) {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const s = String(v).trim().replace(/%/g, '').replace(/,/g, '').replace(/[^0-9eE.\-]+/g, '');
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function buildRegionFilter() {
  regionSelect.innerHTML = `<option value="">Select a region…</option>`;
  const regions = [...new Set(RAW.map(r => (r[REGION_COL] ?? '').toString().trim()))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
  regions.forEach(reg => {
    const opt = document.createElement('option');
    opt.value = reg;
    opt.textContent = reg;
    regionSelect.appendChild(opt);
  });
}

function buildMetricCheckboxes() {
  metricsContainer.innerHTML = '';
  const list = NUMERIC_COLS && NUMERIC_COLS.length ? NUMERIC_COLS : Object.keys(RAW[0] || {});
  const usable = list.filter(c => c !== REGION_COL && c !== YEAR_COL);
  usable.forEach(c => {
    const chip = document.createElement('label');
    chip.className = 'metric-chip';
    chip.dataset.metric = c;
    const hidden = document.createElement('input');
    hidden.type = 'checkbox';
    hidden.value = c;
    const box = document.createElement('span');
    box.className = 'tick';
    const text = document.createElement('span');
    text.textContent = c;
    chip.appendChild(hidden);
    chip.appendChild(box);
    chip.appendChild(text);
    metricsContainer.appendChild(chip);
  });
}

function loadSettings() {
  try {
    const s = localStorage.getItem('ohff_settings_v6');
    SETTINGS = s ? JSON.parse(s) : {};
  } catch (e) {
    SETTINGS = {};
  }
}

function saveSettings() {
  const inputs = [...targetsForm.querySelectorAll('.t-row')].map(row => {
    const metric = row.querySelector('.t-label').dataset.metric;
    const target = row.querySelector('.t-input.target').value === '' ? null : Number(row.querySelector('.t-input.target').value);
    const goal = row.querySelector('.t-select.goal').value;
    const unit = row.querySelector('.t-input.unit').value.trim();
    return { metric, target, goal, unit };
  });
  inputs.forEach(({ metric, target, goal, unit }) => {
    if (!SETTINGS[metric]) SETTINGS[metric] = {};
    SETTINGS[metric].target = target;
    SETTINGS[metric].goal = goal;
    SETTINGS[metric].unit = unit;
  });
  localStorage.setItem('ohff_settings_v6', JSON.stringify(SETTINGS));
  targetsModal.classList.add('hidden');
}

function openTargets() {
  const selected = [...metricsContainer.querySelectorAll('.metric-chip input:checked')].map(i => i.value);
  targetsForm.innerHTML = '';
  selected.forEach(m => {
    const row = document.createElement('div');
    row.className = 't-row';
    const lab = document.createElement('div');
    lab.className = 't-label';
    lab.dataset.metric = m;
    lab.textContent = m;
    const target = document.createElement('input');
    target.type = 'number';
    target.step = 'any';
    target.className = 't-input target';
    target.value = SETTINGS[m]?.target ?? '';
    const goal = document.createElement('select');
    goal.className = 't-select goal';
    goal.innerHTML = `<option value="above">meet or exceed</option><option value="below">at or below</option>`;
    goal.value = SETTINGS[m]?.goal ?? guessGoal(m);
    const unit = document.createElement('input');
    unit.type = 'text';
    unit.placeholder = 'e.g., %, K, seats';
    unit.className = 't-input unit';
    unit.value = SETTINGS[m]?.unit ?? defaultUnit(m);
    row.appendChild(lab);
    row.appendChild(target);
    row.appendChild(goal);
    row.appendChild(unit);
    targetsForm.appendChild(row);
  });
  targetsModal.classList.remove('hidden');
}

function guessGoal(metric) {
  const m = metric.toLowerCase();
  if (m.includes('crime') || m.includes('commute') || m.includes('time') || m.includes('rate_') || m.includes('rate')) return 'below';
  return 'above';
}

function defaultUnit(metric) {
  const m = metric.toLowerCase();
  if (m.includes('income')) return 'K';
  if (m.includes('rate') || m.includes('percent') || m.includes('%')) return '%';
  if (m.includes('capacity') || m.includes('seats') || m.includes('child')) return 'seats';
  return '';
}

function kpiClasses(metric, gap) {
  const goal = (SETTINGS[metric]?.goal) || guessGoal(metric);
  const good = goal === 'above' ? gap >= 0 : gap <= 0;
  return good ? 'gap-pos' : 'gap-neg';
}

function renderKPIs(data, metrics) {
  kpisEl.innerHTML = '';
  if (!metrics.length) return;
  metrics.forEach(m => {
    const vals = data.map(r => toNum(r[m])).filter(v => v !== null);
    const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length) : null;
    const target = SETTINGS[m]?.target;
    const unit = SETTINGS[m]?.unit ? ` ${SETTINGS[m].unit}` : '';
    const gap = target == null || avg == null ? null : (avg - target);
    const card = document.createElement('div');
    card.className = 'kpi';
    card.innerHTML = `
      <h3>${m}</h3>
      <div class="sub">Average${regionSelect.value ? ` in ${regionSelect.value}` : ''}${target != null ? ` (Target: ${formatNumber(target)}${unit})` : ''}</div>
      <div class="value">${avg === null ? '—' : formatNumber(avg)}${unit}</div>
    `;
    if (gap !== null) {
      const b = document.createElement('div');
      b.className = `gap-badge ${kpiClasses(m, gap)}`;
      b.textContent = `Gap: ${gap >= 0 ? '+' : ''}${formatNumber(gap)}${unit}`;
      card.appendChild(b);
    }
    kpisEl.appendChild(card);
  });
}

function renderCharts(data, metrics) {
  chartsEl.innerHTML = '';
  if (!metrics.length) return;
  const years = (YEAR_COL
    ? [...new Set(data.map(r => toNum(r[YEAR_COL])).filter(v => v !== null).map(v => Math.round(v)))]
    : []
  ).sort((a, b) => a - b);
  metrics.forEach(m => {
    let labels;
    let series;
    let title;
    if (YEAR_COL && years.length) {
      labels = years;
      series = years.map(y => {
        const rows = data.filter(r => Math.round(toNum(r[YEAR_COL])) === y).map(r => toNum(r[m])).filter(v => v !== null);
        return rows.length ? (rows.reduce((a, b) => a + b, 0) / rows.length) : null;
      });
      title = `${m} • Average by Year`;
    } else {
      labels = ['Average'];
      const vals = data.map(r => toNum(r[m])).filter(v => v !== null);
      series = [vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length) : null];
      title = `${m} • Average`;
    }
    const card = document.createElement('div');
    card.className = 'chart-card';
    card.innerHTML = `<h4>${title}</h4><canvas></canvas>`;
    chartsEl.appendChild(card);
    const ctx = card.querySelector('canvas').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Average',
          data: series,
          spanGaps: true,
          tension: 0.25,
          borderWidth: 2,
          pointRadius: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: YEAR_COL && years.length ? 'Year' : '' } },
          y: { title: { display: true, text: m }, ticks: { callback: v => formatNumber(v) } }
        },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: t => `Average: ${formatNumber(t.parsed.y)}` } }
        }
      }
    });
  });
}

function renderActions(regionRows, metrics) {
  actionsWrap.innerHTML = '';
  if (!metrics.length) return;
  const region = regionSelect.value;
  const peers = groupByRegionAverages();
  metrics.forEach(m => {
    const unit = SETTINGS[m]?.unit ? ` ${SETTINGS[m].unit}` : '';
    const goal = SETTINGS[m]?.goal || guessGoal(m);
    const regAvg = mean(regionRows.map(r => toNum(r[m])));
    if (regAvg === null) return;
    const peerEntries = Object.entries(peers)
      .filter(([k]) => k !== region)
      .map(([k, obj]) => [k, obj[m]])
      .filter(([, v]) => v !== null);
    if (!peerEntries.length) return;
    const peerAvg = mean(peerEntries.map(([, v]) => v));
    const bestPeer = peerEntries.sort((a, b) => (goal === 'above' ? b[1] - a[1] : a[1] - b[1]))[0];
    const diff = regAvg - peerAvg;
    const pctDiff = peerAvg !== 0 && peerAvg !== null ? (diff / peerAvg) * 100 : null;
    const years = YEAR_COL ? unique(regionRows.map(r => Math.round(toNum(r[YEAR_COL]))).filter(v => v)) : [];
    let trend = null;
    if (years.length >= 2) {
      const series = years.map(y => {
        const rows = regionRows.filter(r => Math.round(toNum(r[YEAR_COL])) === y).map(r => toNum(r[m])).filter(v => v !== null);
        return rows.length ? (rows.reduce((a, b) => a + b, 0) / rows.length) : null;
      }).filter(v => v !== null);
      if (series.length >= 2) trend = series[series.length - 1] - series[0];
    }
    const needToPeer = goal === 'above' ? Math.max(0, peerAvg - regAvg) : Math.max(0, regAvg - peerAvg);
    const needToTarget = SETTINGS[m]?.target == null ? null : (goal === 'above' ? Math.max(0, SETTINGS[m].target - regAvg) : Math.max(0, regAvg - SETTINGS[m].target));
    const recs = outreachFirstRecommendations({
      metric: m,
      goal,
      region,
      regAvg,
      peerAvg,
      bestPeer,
      diff,
      pctDiff,
      trend,
      needToPeer,
      needToTarget
    }, unit);
    const card = document.createElement('div');
    card.className = 'action-card';
    const head = document.createElement('div');
    head.className = 'action-head';
    const title = document.createElement('div');
    title.className = 'action-title';
    title.textContent = m;
    const meta = document.createElement('div');
    meta.className = 'action-meta';
    meta.textContent = `${region} avg: ${formatNumber(regAvg)}${unit} • Peers avg: ${formatNumber(peerAvg)}${unit}`;
    head.appendChild(title);
    head.appendChild(meta);
    const badge = document.createElement('span');
    const goodClass = kpiClasses(m, regAvg - peerAvg) === 'gap-pos' ? 'action-good' : 'action-bad';
    const sign = diff >= 0 ? '+' : '';
    badge.className = `action-gap ${goodClass}`;
    badge.textContent = `vs peers: ${sign}${formatNumber(diff)}${unit}${pctDiff === null ? '' : ` (${pctDiff >= 0 ? '+' : ''}${pctDiff.toFixed(1)}%)`}`;
    const ul = document.createElement('ul');
    ul.className = 'action-list';
    recs.forEach(t => { const li = document.createElement('li'); li.textContent = t; ul.appendChild(li); });
    card.appendChild(head);
    card.appendChild(badge);
    card.appendChild(ul);
    if (isChildcareMetric(m)) {
      const list = document.createElement('div');
      list.className = 'facility-list';
      const fk = regionToFacilityKey(region);
      const facs = (childcareFacilities[fk] || []).slice().sort((a, b) => b.capacity - a.capacity);
      facs.slice(0, 8).forEach(f => {
        const row = document.createElement('div');
        row.className = 'facility-item';
        row.innerHTML = `<span>${f.name}:</span><span>&nbsp;${formatInt(f.capacity)} seats</span>`;
        list.appendChild(row);
      });
      if (facs.length) {
        const label = document.createElement('div');
        label.className = 'action-chip';
        label.textContent = 'Nearby facilities to partner with';
        card.appendChild(label);
        card.appendChild(list);
      }
    }
    actionsWrap.appendChild(card);
  });
}

function isChildcareMetric(m) {
  const s = m.toLowerCase();
  return s.includes('capacity') || s.includes('child');
}

function regionToFacilityKey(r) {
  const s = (r || '').toLowerCase().replace(/\s+/g, '');
  if (s.includes('statenisland')) return 'StatenIsland';
  if (s.includes('staten')) return 'StatenIsland';
  if (s.includes('manhattan')) return 'Manhattan';
  if (s.includes('bronx')) return 'Bronx';
  if (s.includes('brooklyn')) return 'Brooklyn';
  if (s.includes('queens')) return 'Queens';
  return r;
}

function outreachFirstRecommendations(s, unit) {
  const u = unit || '';
  const name = s.metric.toLowerCase();
  const betterUp = s.goal === 'above';
  const worseThanPeers = betterUp ? (s.regAvg < s.peerAvg) : (s.regAvg > s.peerAvg);
  const gapTxt = s.needToPeer > 0 ? ` Close ~${formatNumber(s.needToPeer)}${u} to reach peer averages.` : '';
  const recs = [];
  if (name.includes('capacity') || name.includes('child')) {
    recs.push(`Run targeted outreach in ${s.region} through schools, WIC/SNAP offices, and faith groups to fill open seats.${gapTxt}`);
    recs.push(`Create a shared waitlist with top providers and offer text-message reminders for openings.`);
    recs.push(`Offer pop-up enrollment tables at the facilities listed below on paydays and school dismissal times.`);
    recs.push(`Recruit neighborhood volunteers as “care navigators” to help families complete applications on site.`);
  } else if (name.includes('income')) {
    recs.push(`Text and flyer campaign in ${s.region} to invite low-income jobseekers to resume clinics and weekly employer walk-ins.`);
    recs.push(`Co-host small hiring events with 3–5 local employers; guarantee on-the-spot interviews and child-watch.`);
    recs.push(`Screen every intake for EITC/SNAP/WIC and set up quick referrals; track benefit approvals.`);
  } else if (name.includes('commute')) {
    recs.push(`Match families to nearest providers; send transit-friendly route cards and offer MetroCard stipends from donor pool.`);
    recs.push(`Schedule services during off-peak commute windows and offer virtual intake for first appointments.`);
    recs.push(`Organize parent carpools via WhatsApp groups moderated by a staff lead.`);
  } else if (name.includes('crime')) {
    recs.push(`Concentrate activities at daytime hours and inside trusted community sites; coordinate safe-route escorts with volunteers.`);
    recs.push(`Provide virtual options for evening workshops to reduce exposure to hotspots.`);
    recs.push(`Share safety checklists with providers and parents; log incidents and adjust program hours quarterly.`);
  } else if (name.includes('population_asian')) {
    recs.push(`Partner with Asian community orgs in ${s.region}; translate outreach into top local languages and use WeChat/WhatsApp groups.`);
    recs.push(`Hold weekend info tables at popular markets and temples; advertise child-care help and job leads.`);
    recs.push(`Recruit bilingual volunteers for application support and resume help.`);
  } else if (name.includes('commute_without_car_fee')) {
    recs.push(`Outreach to no-car households via housing offices; provide transit route guides and limited MetroCard assistance.`);
    recs.push(`Locate workshops at sites within a 10-minute walk of main bus/subway stops; text reminders morning of.`);
  } else if (name.includes('household_kids_under18')) {
    recs.push(`Door-to-door flyers on family-dense blocks near schools; offer on-site sign-ups and quick eligibility checks.`);
    recs.push(`Run parent nights with free child-watch at listed facilities; collect referrals for families on waitlists.`);
  } else {
    recs.push(`Prioritize neighborhoods where ${s.metric} lags peers and run a two-week phone/text outreach sprint.`);
    recs.push(`Set a simple weekly target and track responses; redeploy to blocks with lowest response rates.`);
  }
  if (worseThanPeers) recs.unshift(`Focus ${s.region} because it trails peers in ${s.metric}.${gapTxt}`);
  if (!worseThanPeers) recs.unshift(`Maintain ${s.region} momentum in ${s.metric}; copy low-cost tactics to adjacent neighborhoods.`);
  return recs;
}

function groupByRegionAverages() {
  const groups = {};
  RAW.forEach(r => {
    const key = (r[REGION_COL] ?? '').toString().trim();
    if (!key) return;
    if (!groups[key]) groups[key] = {};
    NUMERIC_COLS.forEach(c => {
      const v = toNum(r[c]);
      if (v === null) return;
      if (!groups[key][c]) groups[key][c] = [];
      groups[key][c].push(v);
    });
  });
  const out = {};
  Object.keys(groups).forEach(region => {
    out[region] = {};
    Object.keys(groups[region]).forEach(c => {
      out[region][c] = mean(groups[region][c]);
    });
  });
  return out;
}

function mean(arr) {
  const v = arr.filter(x => x !== null && x !== undefined && !Number.isNaN(x));
  if (!v.length) return null;
  return v.reduce((a, b) => a + b, 0) / v.length;
}

function unique(arr) {
  return [...new Set(arr)];
}

function formatNumber(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  const abs = Math.abs(n);
  if (abs >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (abs >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (abs >= 1e3) return (n / 1e3).toFixed(2) + 'K';
  return n.toFixed(2);
}

function formatInt(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return Math.round(Number(n)).toLocaleString();
}
