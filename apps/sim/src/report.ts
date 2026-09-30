// Renders the balance report as one self-contained HTML file (inline SVG, no dependencies).
// Colors: reference palette slots 1-2 (validated adjacent + all-pairs for <=3 series)
// and the blue ordinal ramp for victory grades.
import type { Summary } from "./balance.js";

interface Row { persona: string; day: number; STR: number; END: number; AGI: number; VIT: number }
interface AtrophyRow { capacity: string; week: number; engineLossPct: number; r1Low: number; r1Mid: number; r1High: number }
interface BattleRow { strategy: string; grade: string; minHpFrac: number }

export interface ReportInput {
  personas: { id: string; label: string }[];
  rows: Row[];
  atrophy: AtrophyRow[];
  battles: BattleRow[];
  personaBattles: BattleRow[];
  summary: Summary;
  params: { version: string; battle: Record<string, number> };
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

// ------------------------------------------------------------------ chart primitives
interface Frame { w: number; h: number; l: number; r: number; t: number; b: number }
const F: Frame = { w: 300, h: 170, l: 34, r: 10, t: 10, b: 24 };

function axes(f: Frame, xTicks: [number, string][], yTicks: [number, string][]): string {
  const grid = yTicks.map(([y, lab]) => `<line class="grid" x1="${f.l}" x2="${f.w - f.r}" y1="${y}" y2="${y}"/><text class="tick" x="${f.l - 5}" y="${y + 3}" text-anchor="end">${lab}</text>`).join("");
  const xs = xTicks.map(([x, lab]) => `<text class="tick" x="${x}" y="${f.h - 7}" text-anchor="middle">${lab}</text>`).join("");
  return `${grid}<line class="axis" x1="${f.l}" x2="${f.w - f.r}" y1="${f.h - f.b}" y2="${f.h - f.b}"/>${xs}`;
}

function lineChart(opts: {
  title: string;
  series: { name: string; cls: string; points: [number, number][]; dashed?: boolean }[];
  xMax: number; yMax: number; xLabel: (x: number) => string; yLabel: (y: number) => string;
  xTicks: number[]; yTicks: number[];
  extra?: (sx: (x: number) => number, sy: (y: number) => number) => string;
}): string {
  const f = F;
  const sx = (x: number) => f.l + (x / opts.xMax) * (f.w - f.l - f.r);
  const sy = (y: number) => f.h - f.b - (Math.min(y, opts.yMax) / opts.yMax) * (f.h - f.t - f.b);
  const paths = opts.series.map((s) => {
    const d = s.points.map(([x, y], i) => `${i ? "L" : "M"}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join("");
    const hits = s.points.map(([x, y]) => `<circle class="hit" cx="${sx(x).toFixed(1)}" cy="${sy(y).toFixed(1)}" r="7" data-tip="${esc(`${s.name}: ${opts.yLabel(y)} at ${opts.xLabel(x)}`)}"/>`).join("");
    return `<path class="line ${s.cls}${s.dashed ? " dashed" : ""}" d="${d}"/>${hits}`;
  }).join("");
  const legend = opts.series.map((s) => `<span class="key"><i class="sw ${s.cls}${s.dashed ? " dashed" : ""}"></i>${esc(s.name)}</span>`).join("");
  return `<figure class="chart"><figcaption>${esc(opts.title)}</figcaption>${opts.series.length > 1 ? `<div class="legend">${legend}</div>` : ""}
<svg viewBox="0 0 ${f.w} ${f.h}" role="img" aria-label="${esc(opts.title)}">${axes(f, opts.xTicks.map((x) => [sx(x), opts.xLabel(x)]), opts.yTicks.map((y) => [sy(y), opts.yLabel(y)]))}${opts.extra?.(sx, sy) ?? ""}${paths}</svg></figure>`;
}

function histogram(title: string, values: number[], bins: number): string {
  const f = F;
  const counts = Array.from({ length: bins }, () => 0);
  for (const v of values) counts[Math.min(bins - 1, Math.floor(v * bins))]!++;
  const max = Math.max(...counts, 1);
  const bw = (f.w - f.l - f.r) / bins;
  const bars = counts.map((c, i) => {
    const h = (c / max) * (f.h - f.t - f.b);
    const x = f.l + i * bw + 1;
    const y = f.h - f.b - h;
    const pct = ((100 * c) / values.length).toFixed(1);
    return `<path class="bar s1" d="M${x},${f.h - f.b}V${y + Math.min(4, h)}Q${x},${y} ${x + 4},${y}H${x + bw - 6}Q${x + bw - 2},${y} ${x + bw - 2},${y + Math.min(4, h)}V${f.h - f.b}Z"/>
<rect class="hit" x="${x}" y="${f.t}" width="${bw}" height="${f.h - f.t - f.b}" data-tip="${esc(`lowest HP ${i * (100 / bins)}-${(i + 1) * (100 / bins)}%: ${c} fights (${pct}%)`)}"/>`;
  }).join("");
  const xt: [number, string][] = [0, 0.25, 0.5, 0.75, 1].map((v) => [f.l + v * (f.w - f.l - f.r), `${v * 100}%`]);
  const yt: [number, string][] = [0, 0.5, 1].map((v) => [f.h - f.b - v * (f.h - f.t - f.b), String(Math.round(v * max))]);
  return `<figure class="chart"><figcaption>${esc(title)}</figcaption><svg viewBox="0 0 ${f.w} ${f.h}" role="img" aria-label="${esc(title)}">${axes(f, xt, yt)}${bars}</svg></figure>`;
}

function gradeBars(data: Summary["battle"], title: string): string {
  const grades = [["narrow", "g1"], ["valiant", "g2"], ["legendary", "g3"]] as const;
  const rows = Object.entries(data).map(([strategy, s]) => {
    let x = 0;
    const segs = grades.map(([g, cls]) => {
      const w = s[g];
      const seg = w > 0 ? `<rect class="seg ${cls}" x="${x}%" width="calc(${w}% - 2px)" height="22" rx="4" data-tip="${esc(`${strategy}: ${g} ${w}%`)}"/>${w >= 8 ? `<text class="seglabel ${cls}" x="${x + w / 2}%" y="15" text-anchor="middle">${w}%</text>` : ""}` : "";
      x += w;
      return seg;
    }).join("");
    return `<div class="gbrow"><span class="gblabel">${esc(strategy)}</span><svg class="gbsvg" height="22" width="100%">${segs}</svg></div>`;
  }).join("");
  const legend = grades.map(([g, cls]) => `<span class="key"><i class="sw ${cls}"></i>${g}</span>`).join("");
  return `<figure class="chart wide"><figcaption>${esc(title)}</figcaption><div class="legend">${legend}</div>${rows}</figure>`;
}

// ------------------------------------------------------------------ page
export function renderReport(r: ReportInput): string {
  const s = r.summary;
  const tile = (label: string, value: string, ok: boolean | null, note: string) =>
    `<div class="tile"><div class="tlabel">${label}</div><div class="tvalue">${value}</div><div class="tnote ${ok === null ? "" : ok ? "good" : "bad"}">${ok === null ? "" : ok ? "✓ pass · " : "✗ fail · "}${note}</div></div>`;

  const atrophyCharts = ["aerobic", "muscular_strength", "muscular_endurance", "mobility"].map((c) => {
    const rows = r.atrophy.filter((a) => a.capacity === c);
    return lineChart({
      title: c.replace("_", " "),
      series: [
        { name: "Engine", cls: "s1", points: rows.map((a) => [a.week, a.engineLossPct]) },
        { name: "R1 mid", cls: "s2", dashed: true, points: rows.map((a) => [a.week, a.r1Mid]) },
      ],
      xMax: 12, yMax: 100, xTicks: [0, 4, 8, 12], yTicks: [0, 50, 100],
      xLabel: (x) => `wk ${x}`, yLabel: (y) => `${Math.round(y)}%`,
      extra: (sx, sy) => rows.filter((a) => a.week > 0).map((a) => `<line class="band" x1="${sx(a.week)}" x2="${sx(a.week)}" y1="${sy(a.r1Low)}" y2="${sy(a.r1High)}"/>`).join(""),
    });
  }).join("");

  const personaCharts = r.personas.map((p) => {
    const rows = r.rows.filter((x) => x.persona === p.id && x.day % 7 === 6);
    const yMax = Math.max(60, ...rows.map((x) => Math.max(x.END, x.STR)));
    return lineChart({
      title: p.label,
      series: [
        { name: "END", cls: "s1", points: rows.map((x) => [Math.floor(x.day / 7) + 1, x.END]) },
        { name: "STR", cls: "s2", points: rows.map((x) => [Math.floor(x.day / 7) + 1, x.STR]) },
      ],
      xMax: 52, yMax: Math.ceil(yMax / 10) * 10, xTicks: [0, 13, 26, 39, 52], yTicks: [0, Math.ceil(yMax / 20) * 10, Math.ceil(yMax / 10) * 10],
      xLabel: (x) => `wk ${x}`, yLabel: (y) => String(Math.round(y)),
    });
  }).join("");

  const hist = ["careless", "random", "casual", "smart"].map((st) => histogram(`${st}: lowest HP reached`, r.battles.filter((b) => b.strategy === st).map((b) => b.minHpFrac), 10)).join("");

  const battleTable = `<table><thead><tr><th>Play style</th><th>Fights</th><th>Legendary</th><th>Valiant</th><th>Narrow</th><th>Median lowest HP</th><th>Fell to ≤10% HP</th><th>Saved at 1 HP</th><th>Nick of time</th><th>Hit turn cap</th><th>Mean turns</th></tr></thead><tbody>${Object.entries(s.battle).map(([k, v]) => `<tr><td>${k}</td><td>${v.n}</td><td>${v.legendary}%</td><td>${v.valiant}%</td><td>${v.narrow}%</td><td>${v.medianMinHpPct}%</td><td>${v.minHpAtOrBelow10Pct}%</td><td>${v.reached1Hp}%</td><td>${v.nickOfTime}%</td><td>${v.turnCap}%</td><td>${v.meanTurns}</td></tr>`).join("")}</tbody></table>`;
  const personaTable = `<table><thead><tr><th>Persona</th><th>STR</th><th>END</th><th>AGI</th><th>VIT</th><th>Quests</th><th>Bosses won</th><th>Skill ranks</th></tr></thead><tbody>${r.personas.map((p) => { const v = s.personas[p.id]!; return `<tr><td>${esc(p.label)}</td><td>${v.finalSTR}</td><td>${v.finalEND}</td><td>${v.finalAGI}</td><td>${v.finalVIT}</td><td>${v.questsDone}</td><td>${v.bossesWon}</td><td>${v.skillRanks}</td></tr>`; }).join("")}</tbody></table>`;
  const atrophyTable = `<table><thead><tr><th>Capacity</th>${[1, 2, 4, 8, 12].map((w) => `<th>wk ${w}: engine / R1 (low-high)</th>`).join("")}</tr></thead><tbody>${["aerobic", "muscular_strength", "muscular_endurance", "mobility"].map((c) => `<tr><td>${c}</td>${[1, 2, 4, 8, 12].map((w) => { const a = r.atrophy.find((x) => x.capacity === c && x.week === w)!; return `<td>${a.engineLossPct}% / ${a.r1Mid}% (${a.r1Low}-${a.r1High})</td>`; }).join("")}</tr>`).join("")}</tbody></table>`;

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Me RPG Balance Report</title>
<style>
.viz-root{color-scheme:light;--surface-1:#fcfcfb;--surface-2:#f3f2ef;--text-primary:#0b0b0b;--text-secondary:#52514e;--text-muted:#7a7975;--grid:#e6e5e1;--axis:#bdbcb7;--s1:#2a78d6;--s2:#eb6834;--g1:#86b6ef;--g2:#2a78d6;--g3:#104281;--g-ink1:#0b0b0b;--g-ink2:#ffffff;--good:#0ca30c;--bad:#d03b3b}
@media (prefers-color-scheme:dark){:root:where(:not([data-theme="light"])) .viz-root{color-scheme:dark;--surface-1:#1a1a19;--surface-2:#242422;--text-primary:#ffffff;--text-secondary:#c3c2b7;--text-muted:#9a998f;--grid:#2e2e2b;--axis:#4a4a46;--s1:#3987e5;--s2:#d95926;--g1:#184f95;--g2:#3987e5;--g3:#9ec5f4;--g-ink1:#ffffff;--g-ink2:#0b0b0b}}
:root[data-theme="dark"] .viz-root{color-scheme:dark;--surface-1:#1a1a19;--surface-2:#242422;--text-primary:#ffffff;--text-secondary:#c3c2b7;--text-muted:#9a998f;--grid:#2e2e2b;--axis:#4a4a46;--s1:#3987e5;--s2:#d95926;--g1:#184f95;--g2:#3987e5;--g3:#9ec5f4;--g-ink1:#ffffff;--g-ink2:#0b0b0b}
body{margin:0;background:#fcfcfb}@media (prefers-color-scheme:dark){body{background:#1a1a19}}
.viz-root{background:var(--surface-1);color:var(--text-primary);font:14px/1.45 system-ui,-apple-system,Segoe UI,sans-serif;padding:24px 16px;max-width:1100px;margin:0 auto}
h1{font-size:22px;margin:0 0 4px}h2{font-size:17px;margin:32px 0 6px}p.lede,p.note{color:var(--text-secondary);margin:4px 0 12px;max-width:75ch}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}
.tile{background:var(--surface-2);border-radius:10px;padding:12px 14px}.tlabel{color:var(--text-secondary);font-size:12px}.tvalue{font-size:26px;font-weight:600;margin:2px 0}.tnote{font-size:12px;color:var(--text-muted)}.tnote.good::first-letter{color:var(--good)}.tnote.bad::first-letter{color:var(--bad)}
.grid4{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}
figure.chart{margin:0;background:var(--surface-2);border-radius:10px;padding:10px 10px 4px}figure.wide{grid-column:1/-1}
figcaption{font-weight:600;font-size:13px;margin:0 0 4px}svg{width:100%;height:auto;display:block;overflow:visible}
.legend{display:flex;gap:12px;flex-wrap:wrap;font-size:12px;color:var(--text-secondary);margin-bottom:4px}.key{display:inline-flex;align-items:center;gap:5px}
.sw{display:inline-block;width:14px;height:3px;border-radius:2px}.sw.s1{background:var(--s1)}.sw.s2{background:var(--s2)}.sw.dashed{background:repeating-linear-gradient(90deg,var(--s2) 0 4px,transparent 4px 7px)}
.sw.g1,.sw.g2,.sw.g3{height:10px;width:10px}.sw.g1{background:var(--g1)}.sw.g2{background:var(--g2)}.sw.g3{background:var(--g3)}
.grid{stroke:var(--grid);stroke-width:1}.axis{stroke:var(--axis);stroke-width:1}.tick{fill:var(--text-muted);font-size:9px}
.line{fill:none;stroke-width:2;stroke-linejoin:round;stroke-linecap:round}.line.s1{stroke:var(--s1)}.line.s2{stroke:var(--s2)}.line.dashed{stroke-dasharray:4 3}
.band{stroke:var(--s2);stroke-width:2;opacity:.35;stroke-linecap:round}.bar.s1{fill:var(--s1)}
.hit{fill:transparent;cursor:crosshair}.hit:hover{fill:var(--text-muted);fill-opacity:.12}
.gbrow{display:grid;grid-template-columns:80px 1fr;align-items:center;gap:8px;margin:6px 0}.gblabel{font-size:12px;color:var(--text-secondary)}
.seg.g1{fill:var(--g1)}.seg.g2{fill:var(--g2)}.seg.g3{fill:var(--g3)}.seglabel{font-size:11px;font-weight:600;pointer-events:none}.seglabel.g1{fill:var(--g-ink1)}.seglabel.g2,.seglabel.g3{fill:var(--g-ink2)}
table{border-collapse:collapse;width:100%;font-size:12.5px;margin:8px 0}th,td{text-align:left;padding:5px 8px;border-bottom:1px solid var(--grid)}th{color:var(--text-secondary);font-weight:600}
.scroll{overflow-x:auto}#tip{position:fixed;pointer-events:none;background:var(--text-primary);color:var(--surface-1);font-size:12px;padding:4px 8px;border-radius:6px;opacity:0;transition:opacity .08s;z-index:9}
code{font-size:12px;background:var(--surface-2);padding:1px 4px;border-radius:4px}
</style></head><body><div class="viz-root">
<h1>Me RPG Balance Report</h1>
<p class="lede">Deterministic simulation through the real engine. Parameters <code>${esc(r.params.version)}</code>. Eight synthetic players over 52 weeks, a 12-week-train-then-stop atrophy test against R1, and ${Object.values(s.battle).reduce((a, b) => a + b.n, 0)} Monte Carlo boss fights.</p>
<div class="tiles">
${tile("Spike-cap violations", String(s.checks.spikeCapViolations), s.checks.spikeCapViolations === 0, `${s.checks.questsOffered} quests checked`)}
${tile("Rest penalties", String(s.checks.restPenaltyDays), s.checks.restPenaltyDays === 0, "stat drops inside a grace window")}
${tile("Atrophy vs R1", `±${s.atrophyMaxDeviationFromR1Mid} pts`, s.atrophyOutsideR1Band === 0, `${s.atrophyOutsideR1Band} points outside R1 range`)}
${tile("Fights lost", "0", true, "guaranteed by design")}
</div>

<h2>Atrophy: engine vs R1 detraining research</h2>
<p class="note">Percent of training gain lost after stopping completely. Solid line: engine. Dashed: R1 mid value, with the vertical band showing R1's low–high range.</p>
<div class="grid4">${atrophyCharts}</div>
<div class="scroll">${atrophyTable}</div>

<h2>Personas: displayed stats across a year</h2>
<p class="note">Weekly END and STR for each synthetic player. Look for: diligent players climbing, the injured player held flat by Sanctuary, and the maintainer holding steady on two bounties a week.</p>
<div class="grid4">${personaCharts}</div>
<div class="scroll">${personaTable}</div>

<h2>Boss battles</h2>
<p class="note">The hero always wins, but should often feel close to losing: careless play should scrape narrow wins near 1 HP, and smart play should earn legendary ones. Nick-of-time wins come only after turn ${r.params.battle.nickOfTimeFromTurn}.</p>
<div class="grid4">${gradeBars(s.battle, "Victory grade by play style (every fight is won)")}${hist}</div>
<div class="scroll">${battleTable}</div>

<h2>Class parity</h2>
<p class="note">Specialists who trained only their own style for 26 weeks (Ranger: cardio; Berserker: lifting; Warrior: circuits, bodyweight work and rowing), then fought. No style should come out ahead. Largest gap in legendary rate between classes: <b>${s.classParityMaxGapLegendaryPts} points</b>.</p>
<div class="grid4">${gradeBars(s.classParity, "Victory grade by class and play style")}</div>
<div class="scroll"><table><thead><tr><th>Class / play style</th><th>Fights</th><th>Class level</th><th>Tree skills</th><th>Legendary</th><th>Median lowest HP</th><th>Saved at 1 HP</th><th>Nick of time</th><th>Mean turns</th></tr></thead><tbody>${Object.entries(s.classParity).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${v.n}</td><td>${v.meanClassLevel}</td><td>${v.meanTreeSkills}</td><td>${v.legendary}%</td><td>${v.medianMinHpPct}%</td><td>${v.reached1Hp}%</td><td>${v.nickOfTime}%</td><td>${v.meanTurns}</td></tr>`).join("")}</tbody></table></div>
<p class="note">Battle tuning: ${Object.entries(r.params.battle).map(([k, v]) => `<code>${k}=${v}</code>`).join(" ")}</p>
</div><div id="tip"></div>
<script>
const tip=document.getElementById("tip");
document.addEventListener("mousemove",e=>{const t=e.target.closest&&e.target.closest("[data-tip]");if(!t){tip.style.opacity=0;return}tip.textContent=t.getAttribute("data-tip");tip.style.opacity=1;const x=Math.min(e.clientX+12,innerWidth-tip.offsetWidth-8);tip.style.left=x+"px";tip.style.top=(e.clientY+14)+"px"});
</script></body></html>`;
}
