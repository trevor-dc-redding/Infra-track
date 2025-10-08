// --- Demo Charleston data (replace with real sources when ready) ---
const DATA = {
  projects: [
    {
      id: "CHS-001",
      name: "Low Battery Seawall — Phase 4",
      category: "resilience",
      status: "active",
      city: "Charleston, SC",
      lat: 32.7749, lng: -79.9496,
      budget_usd: 100000000,
      start_date: "2024-03-01", end_date: "2027-12-31",
      links: ["https://placeholder/low-battery-phase4"],
      description: "Seawall elevation, storm surge protection along Murray Blvd."
    },
    {
      id: "CHS-002",
      name: "I-526 Lowcountry Corridor (West) — Improvements",
      category: "road",
      status: "planned",
      city: "Charleston, SC",
      lat: 32.8670, lng: -80.0200,
      budget_usd: 0,
      start_date: "", end_date: "",
      links: ["https://placeholder/i526-corridor-west"],
      description: "Capacity, interchange, and safety upgrades along I-526 West."
    },
    {
      id: "CHS-003",
      name: "Union Pier Redevelopment — Public Realm Infrastructure",
      category: "building",
      status: "planned",
      city: "Charleston, SC",
      lat: 32.7865, lng: -79.9240,
      budget_usd: 0,
      start_date: "", end_date: "",
      links: ["https://placeholder/union-pier"],
      description: "Street grid, utilities, waterfront access improvements."
    },
    {
      id: "CHS-004",
      name: "Ashley River Crossing (Bike/Ped Bridge)",
      category: "transit",
      status: "active",
      city: "Charleston, SC",
      lat: 32.7905, lng: -79.9585,
      budget_usd: 0,
      start_date: "", end_date: "",
      links: ["https://placeholder/ashley-river-crossing"],
      description: "Dedicated multi-use bridge connecting downtown and West Ashley."
    },
    {
      id: "CHS-005",
      name: "Charleston International Airport (CHS) — Terminal Expansion",
      category: "building",
      status: "active",
      city: "Charleston, SC",
      lat: 32.8986, lng: -80.0405,
      budget_usd: 0,
      start_date: "", end_date: "",
      links: ["https://placeholder/chs-terminal-expansion"],
      description: "Gate expansion, security, and curbside upgrades."
    },
    {
      id: "CHS-006",
      name: "West Ashley Greenway & Bikeway Upgrades",
      category: "park",
      status: "planned",
      city: "Charleston, SC",
      lat: 32.7830, lng: -80.0120,
      budget_usd: 0,
      start_date: "", end_date: "",
      links: ["https://placeholder/wag-upgrades"],
      description: "Trail surface, lighting, crossings, and access improvements."
    }
  ]
};

// --- Map setup (center on Charleston) ---
const map = L.map('map', { zoomControl: true }).setView([32.78, -79.94], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19, attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Marker layers keyed by project id for easy updates
const layerGroup = L.layerGroup().addTo(map);
const markerIndex = new Map();

function markerColor(category) {
  const colors = { transit: "blue", road: "red", park: "green", building: "purple", resilience: "orange" };
  return colors[category] || "gray";
}
function makeDivIcon(color) {
  const el = document.createElement('div');
  el.style.width = '12px';
  el.style.height = '12px';
  el.style.borderRadius = '50%';
  el.style.background = color;
  el.style.border = '2px solid white';
  el.style.boxShadow = '0 0 0 1px rgba(0,0,0,0.2)';
  return L.divIcon({ html: el, className: "dot", iconSize: [12,12] });
}

function projectPopup(p) {
  const money = p.budget_usd ? `$${p.budget_usd.toLocaleString()}` : "—";
  const links = (p.links||[]).map(h => `<a href="${h}" target="_blank" rel="noopener">link</a>`).join(" · ");
  return `
    <strong>${p.name}</strong><br/>
    <span class="tag">${p.category}</span> <span class="tag">${p.status}</span><br/>
    ${p.city}<br/>
    Budget: ${money}<br/>
    ${p.start_date || "?"} → ${p.end_date || "?"}<br/>
    <small>${p.description || ""}</small><br/>
    ${links}
  `;
}

function addOrUpdateMarker(p) {
  const existing = markerIndex.get(p.id);
  if (existing) {
    existing.setLatLng([p.lat, p.lng])
      .setIcon(makeDivIcon(markerColor(p.category)))
      .bindPopup(projectPopup(p));
    return;
  }
  const m = L.marker([p.lat, p.lng], { icon: makeDivIcon(markerColor(p.category)) })
    .bindPopup(projectPopup(p));
  m.addTo(layerGroup);
  markerIndex.set(p.id, m);
}

function removeMarker(id) {
  const m = markerIndex.get(id);
  if (m) { layerGroup.removeLayer(m); markerIndex.delete(id); }
}

// --- Filtering & rendering ---
const cityEl = document.getElementById('citySelect');
const listEl = document.getElementById('list');
const statusChecks = [...document.querySelectorAll('input[name="status"]')];
const categoryChecks = [...document.querySelectorAll('input[name="category"]')];

function getFilters() {
  const city = cityEl.value;
  const status = statusChecks.filter(c=>c.checked).map(c=>c.value);
  const category = categoryChecks.filter(c=>c.checked).map(c=>c.value);
  return { city, status, category };
}

function passes(p, f) {
  const cityOk = !f.city || p.city === f.city;
  const sOk = f.status.includes(p.status);
  const cOk = f.category.includes(p.category);
  return cityOk && sOk && cOk;
}

function render() {
  const f = getFilters();
  const keep = new Set();

  // Update markers
  DATA.projects.forEach(p => {
    if (passes(p, f)) { addOrUpdateMarker(p); keep.add(p.id); }
  });
  // Remove hidden
  [...markerIndex.keys()].forEach(id => { if (!keep.has(id)) removeMarker(id); });

  // Update list
  const items = DATA.projects.filter(p => passes(p, f));
  listEl.innerHTML = items.map(p => `
    <div class="project-card">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <strong>${p.name}</strong>
        <span class="tag">${p.category}</span>
      </div>
      <div><span class="tag">${p.status}</span> <span>${p.city}</span></div>
      <div><small>${p.start_date || "?"} → ${p.end_date || "?"}</small></div>
      <div><small>Budget: ${p.budget_usd ? '$'+p.budget_usd.toLocaleString() : '—'}</small></div>
      <div style="margin-top:6px">${(p.links||[]).map(h=>`<a href="${h}" target="_blank" rel="noopener">source</a>`).join(" · ")}</div>
      <button onclick="flyTo('${p.id}')" style="margin-top:8px">Zoom to</button>
    </div>
  `).join("");

  // Fit to visible markers
  if (keep.size > 0) {
    const group = L.featureGroup([...markerIndex.values()]);
    map.fitBounds(group.getBounds().pad(0.2), { animate: false });
  }
}

function flyTo(id) {
  const m = markerIndex.get(id);
  if (m) { map.flyTo(m.getLatLng(), 15, { duration: 0.6 }); m.openPopup(); }
}

// Events
[cityEl, ...statusChecks, ...categoryChecks].forEach(el => el.addEventListener('input', render));

// Initial render
render();
