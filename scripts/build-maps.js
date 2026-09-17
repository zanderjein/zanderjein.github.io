#!/usr/bin/env node
/* ==========================================================================
   build-maps.js — generate the outlines used in the About section.

   Run:  node scripts/build-maps.js

   Source: Natural Earth 1:50m (public domain), via the official
   natural-earth-vector repository. Nothing here is hand-drawn or traced:
   each outline is the Natural Earth polygon, projected and simplified by
   this script. City dots come from real coordinates run through the same
   projection as the outline they sit on.

   Writes: data/maps.json
   ========================================================================== */

const fs = require('fs/promises');
const path = require('path');

const BASE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/';
const SOURCES = {
  countries: BASE + 'ne_50m_admin_0_countries.geojson',
  states: BASE + 'ne_50m_admin_1_states_provinces_lakes.geojson'
};
const OUT = path.resolve(__dirname, '..', 'data', 'maps.json');

const TARGETS = [
  {
    key: 'thailand',
    source: 'countries',
    name: 'Thailand',
    city: { name: 'Bangkok', lon: 100.5018, lat: 13.7563 },
    height: 200,
    tolerance: 0.06,     // projected degrees
    minRingArea: 0.04
  },
  {
    key: 'connecticut',
    source: 'states',
    name: 'Connecticut',
    city: { name: 'New Haven', lon: -72.9279, lat: 41.3083 },
    height: 200,
    tolerance: 0.004,    // Connecticut is ~1.5° across, so it needs a finer tolerance
    minRingArea: 0.0005
  }
];

/* --- equirectangular, x scaled by cos(reference latitude) ------------------ */
const projector = (latRef) => {
  const k = Math.cos((latRef * Math.PI) / 180);
  return ([lon, lat]) => [lon * k, -lat];
};

/* --- Douglas–Peucker ------------------------------------------------------ */
function perpDistance(p, a, b) {
  const [px, py] = p, [ax, ay] = a, [bx, by] = b;
  const dx = bx - ax, dy = by - ay;
  if (dx === 0 && dy === 0) return Math.hypot(px - ax, py - ay);
  const t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
  const cx = ax + Math.max(0, Math.min(1, t)) * dx;
  const cy = ay + Math.max(0, Math.min(1, t)) * dy;
  return Math.hypot(px - cx, py - cy);
}

function simplify(points, tol) {
  if (points.length < 3) return points;
  let maxDist = 0, idx = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpDistance(points[i], points[0], points[points.length - 1]);
    if (d > maxDist) { maxDist = d; idx = i; }
  }
  if (maxDist <= tol) return [points[0], points[points.length - 1]];
  return [
    ...simplify(points.slice(0, idx + 1), tol).slice(0, -1),
    ...simplify(points.slice(idx), tol)
  ];
}

const ringArea = (ring) => Math.abs(ring.reduce((sum, [x, y], i) => {
  const [nx, ny] = ring[(i + 1) % ring.length];
  return sum + (x * ny - nx * y);
}, 0) / 2);

function findFeature(fc, name) {
  return fc.features.find((f) => {
    const p = f.properties || {};
    return [p.NAME, p.NAME_EN, p.ADMIN, p.SOVEREIGNT, p.name, p.gn_name].includes(name);
  });
}

function build(feature, target) {
  const g = feature.geometry;
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  const project = projector(target.city.lat);

  const rings = polys
    .map((poly) => poly[0].map(project))
    .map((ring) => simplify(ring, target.tolerance))
    .filter((ring) => ring.length > 3 && ringArea(ring) >= target.minRingArea);

  if (!rings.length) throw new Error(`${target.name}: every ring was simplified away`);

  const pts = rings.flat();
  const minX = Math.min(...pts.map((p) => p[0]));
  const maxX = Math.max(...pts.map((p) => p[0]));
  const minY = Math.min(...pts.map((p) => p[1]));
  const maxY = Math.max(...pts.map((p) => p[1]));
  const scale = target.height / (maxY - minY);
  const width = +((maxX - minX) * scale).toFixed(2);

  const to = ([x, y]) => [
    +((x - minX) * scale).toFixed(2),
    +((y - minY) * scale).toFixed(2)
  ];

  const d = rings
    .map((ring) => 'M' + ring.map(to).map(([x, y]) => `${x} ${y}`).join('L') + 'Z')
    .join('');

  return {
    viewBox: `0 0 ${width} ${target.height}`,
    path: d,
    dot: to(project([target.city.lon, target.city.lat])),
    label: target.city.name,
    points: rings.reduce((n, r) => n + r.length, 0),
    rings: rings.length
  };
}

async function main() {
  const cache = {};
  const out = {
    generated: new Date().toISOString(),
    source: 'Natural Earth 1:50m (public domain) — ' + BASE,
    note: 'Projected and simplified by scripts/build-maps.js. Not traced or hand-drawn.'
  };

  for (const target of TARGETS) {
    if (!cache[target.source]) {
      const res = await fetch(SOURCES[target.source]);
      if (!res.ok) throw new Error(`${target.source} download failed: ${res.status}`);
      cache[target.source] = await res.json();
    }
    const feature = findFeature(cache[target.source], target.name);
    if (!feature) throw new Error(`${target.name} not found in the ${target.source} file`);

    const shape = build(feature, target);
    console.log(`${target.name}: ${shape.rings} ring(s), ${shape.points} points, `
      + `viewBox ${shape.viewBox}, ${shape.label} at ${shape.dot[0]}, ${shape.dot[1]}`);
    out[target.key] = shape;
  }

  await fs.writeFile(OUT, JSON.stringify(out, null, 2) + '\n');
}

main().catch((err) => { console.error(err.message); process.exit(1); });
