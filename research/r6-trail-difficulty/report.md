# R6: Trail Difficulty (Scoring, Duration, Energy, Fitness Matching and Safety Gating)
Status: 0.1.0-unreviewed. Companion file: params.json.

Confidence levels:
- **High**: read directly from the primary source or the official page.
- **Medium**: a reputable secondary source, or interpretation needed.
- **Low**: a HealthRPG design heuristic or our own derivation.

## 1. Exact formulas

### 1.1 Shenandoah (High, [1])
The park's wording: "Elevation Gain x 2 x distance (in miles). The product's square root is the numerical rating."
- Imperial: S = sqrt(2·gain_ft·mi). Metric: S = 2.0192·sqrt(gain_m·km).
- Bins: Easiest <50; Moderate 50–100; Moderately Strenuous 100–150; Strenuous 150–200; Very Strenuous >200.
- Worked example: 10 mi with 2,200 ft of gain gives 209.8.

The park calls the formula "imperfect". Dark Hollow Falls scores 36.3 but is rated Moderate because it is steep over a short distance.

Limitations (Low): the formula ignores descent, surface, altitude and technique, and flat trails score 0. HealthRPG adds a steepness bump and a duration floor to compensate.

### 1.2 Naismith and its variants
- **Naismith 1892** (High for the rule; Medium for the citation chain, [2]): t_h = km/5 + gain_m/600.
- **Scarf 2007** (High, [3]): 1 m of ascent equals 7.92 m of horizontal distance. Scarf recommends 1:8 for men and 1:10 for women. equiv_km = km + α·gain_km, then t = equiv_km/5.
- **Aitken 1977** (Medium, [2]): 3 mph on paths and 2.5 mph on other terrain (a factor of 0.833), plus 1 h per 2,000 ft of ascent.
- **Langmuir 1984, *Mountaincraft and Leadership*** (Medium, [2]):
  - base: 5 km/h plus 1 h per 600 m of ascent
  - descent at 5–12°: subtract 10 min per 300 m
  - descent steeper than 12°: add 10 min per 300 m
  - groups: 4 km/h plus 1 h per 450 m
- **Tranter** (Medium, [2][4]):
  - Fitness F is the minutes needed to climb 300 m over 800 m. F = 15 is very fit and F = 50 is unfit.
  - A lookup table converts Naismith time to corrected time; for example, 9 h at F = 25 becomes 11.5 h. The full table is in params.json.
  - Blank cells mean "beyond capacity", which can be used as a built-in gate.
  - The table comes from a secondary transcription; the primary source was not accessible.

### 1.3 Tobler (High for the formula; Medium for the source chain, [5])
- v = 6·exp(−3.5·|s + 0.05|) km/h, where s = dh/dx.
- Flat ground gives 5.04 km/h; the maximum is 6 km/h at s = −0.05.
- Multiply by 0.6 off-path and 1.25 on horseback. Original source: Tobler 1993, NCGIA Technical Report 93-1.
- Irmischer & Clarke (2018) fitted a model that beat Tobler and Naismith, predicting route time within about 10% [6].
- Campbell et al. (2019) fitted slope–speed curves from about 30,000 fitness-tracker users, with separate curves for slow, median and fast movers [7].
- Implication (Low): calibrate speed for each player.

### 1.4 Minetti 2002 (High, from the PDF [8])
Cw is the net cost of walking (measured minus resting) in J·kg⁻¹·m⁻¹, for i from −0.45 to 0.45:
- Walking: Cw = 280.5i⁵ − 58.7i⁴ − 76.8i³ + 51.9i² + 19.6i + 2.5 (R² = 0.999)
- Running: Cr = 155.4i⁵ − 30.4i⁴ − 43.3i³ + 46.3i² + 19.5i + 3.6

Details from the paper:
- Energy equivalent: 20.9 kJ per litre of O2.
- Measured costs: minimum level cost 1.64 at about 1 m/s; 17.33 at +0.45; the lowest cost, 0.81, at −0.10; 3.46 at −0.45.
- The optimum gradient for mountain paths is 0.20–0.30.
- Beyond ±0.15, efficiency approaches that of concentric and eccentric muscle work. Steep descents therefore bring a muscular (eccentric) load, which should be tracked separately.
- The subjects were 10 trained runners on a treadmill, so real trails cost more (Medium).

### 1.5 Pandolf and Santee (Medium, [9]; the Santee term is Low)
- Pandolf: M = 1.5W + 2.0(W+L)(L/W)² + η(W+L)(1.5V² + 0.35VG), with G in %.
- Terrain factor η:

| Terrain | η |
|---|---|
| blacktop | 1.0 |
| dirt road | 1.1 |
| light brush | 1.2 |
| heavy brush | 1.5 |
| bog | 1.8 |
| loose sand | 2.1 |
| snow 15 / 25 / 35 cm | 2.5 / 3.3 / 4.1 |

- Santee downhill correction, as secondary sources state it (not verified): CF = η[(G(W+L)V)/3.5 − (W+L)(G+6)²/W + (25 − V²)], subtracted when G < 0.

### 1.6 ACSM walking equation (High, [10])
VO2 = 3.5 + 0.1·S + 1.8·S·G, with S in m/min (valid for about 50–100 m/min) and G as a fraction. It is not valid downhill, so use it only as an uphill check.

### 1.7 METs (High, [11][12])
1 MET = 3.5 mL/kg/min, which is about 1 kcal/kg/h. Values from the 2024 Compendium tracking guide (verified):

| Code | Activity | MET |
|---|---|---|
| 17080 | Hiking, cross country | 6.0 |
| 17081 | Hiking slowly | 3.8 |
| 17082 | Hiking, normal pace | 5.3 |
| 17010 | Backpacking | 7.0 |
| 17012 | Hiking with daypack | 7.8 |
| 17180 | Walking downhill, 2.5 mph | 3.3 |
| 17036 | Hills, 11–20% grade | 8.8 |
| 17039 | Hills, 30–40% grade | 15.5 |

## 2. How SAC scale and surface change effort and risk

### 2.1 Separate the two axes
- **Technical risk** comes from `sac_scale`, `trail_visibility`, snow and ice, and YDS class. It is gated by experience.
- **Physical effort** comes from distance, climb, surface and altitude. It is matched to capacity.
- The sources treat these separately. The OSM wiki describes visibility as distinct from physical difficulty [14]. The SAC warns that T5–T6 routes are often harder than an easy "L" alpine tour, and that T6 is roughly comparable to a "WS" alpine tour [13].

### 2.2 SAC T1–T6 (High, [13][14])

| OSM `sac_scale` | SAC | Terrain | Requirements |
|---|---|---|---|
| hiking | T1 | constructed path; fall risk "largely ruled out" | trainers are fine |
| mountain_hiking | T2 | partly steep; fall risk not ruled out | surefootedness, boots, basic orientation |
| demanding_mountain_hiking | T3 | path not always visible, hands for balance, exposure, scree | good surefootedness, basic alpine experience |
| alpine_hiking | T4 | occasionally pathless, hands needed, steep grass, simple firn or glacier | alpine experience |
| demanding_alpine_hiking | T5 | often pathless, easy climbing, glaciers | ice axe, rope and crampons |
| difficult_alpine_hiking | T6 | mostly pathless, UIAA II, very exposed | extensive alpine experience |

- The SAC grades assume favourable conditions: dry, with good visibility [13].
- Effect on effort (Low): model the SAC grade mainly as a time multiplier, anchored on Tobler's 0.6 off-path factor and Aitken's 0.833, and only secondarily as an energy multiplier.

### 2.3 YDS (High for the definitions, [15])
- Class 1: trail hiking. Class 2: simple scrambling with occasional use of hands. Class 3: scrambling, where a rope could be carried. Class 4: simple climbing where falls could be fatal. Class 5: technical roped climbing.
- The source calls the definitions "somewhat controversial".
- Rough crosswalk to SAC (Low; not an official concordance): YDS 1 ≈ T1–T2, YDS 2 ≈ T3–T4, YDS 3 ≈ T5, YDS 4 ≈ T6.
- YDS 4–5 are never offered.

### 2.4 `trail_visibility` (High, [14])
Values run excellent → good → intermediate → bad → horrible → no, and describe navigation skill needed. This is a risk factor, and "bad" or worse also justifies an off-path speed factor.

### 2.5 `surface` (definitions High [14]; multipliers Low)
- Map each OSM surface onto the Pandolf η scale for energy and onto an Aitken/Tobler-style factor for speed.
- Snow and ice also add risk.
- Pandolf η comes from military load-carriage data, so applying it to hiking is an extrapolation.

## 3. Converting a trail into duration, energy and tier

### 3.1 Duration
1. With an elevation profile, sum d/v over segments. Here v is Tobler's speed, multiplied by the surface and SAC speed factors, and capped by the player's aerobic power.
2. Without a profile, use Naismith plus the Langmuir descent correction.
3. Calibrate for each player using Tranter, the fitness band, and completed Journeys.
4. Add a stop allowance of about 10–25% (design).

### 3.2 Energy
- net J/kg = Σ Cw(i)·d·η·f_SAC
- net MET-min = (J/kg ÷ 20.9) ÷ 3.5
- gross MET-min = net + duration in minutes (the resting 1 MET)
- Clamp the average between 3.3 and 9 MET.

Checks (Low, our calculation):
- 10 km flat: about 342 net or 462 gross MET-min, about 3.9 MET.
- 10 km with 600 m of climb and descent: about 442 net MET-min over 3 h, about 3.5 MET. This is below the Compendium's 6.0, which is why terrain scaling is needed.
- Also report `eccentric_descent_m`, the descent on grades steeper than −0.15, as a muscular-load signal.

### 3.3 Tier (Low; the bins themselves are High)
- S_adj = 2.0192·sqrt((gain/altitude multiplier)·(km/surface speed)).
- Bin S_adj into tiers 1–5.
- Add 1 tier if a sustained grade of 15% or more (range 12–20%) runs over 200 m or more, applied below tier 4.
- The tier is at least the tier implied by duration.
- The risk tier is computed separately and never averaged into the effort tier.

### 3.4 Published criteria elsewhere
- **AllTrails** (Medium, [16]): a baseline rating is computed from distance and elevation gain, then adjusted by a trail team and users. Scrambles, rock fields and orienteering push the rating up. No formula is published.
- **California State Parks** (High, [17]): Easy is 1–2 mi with little gain. Moderate is 2–4 mi with some gain. Challenging is 4 mi or more, or varying terrain.
- **NPS**: each park rates its own trails; there is no service-wide numeric standard (Medium).

## 4. Matching fitness to trail tiers

### 4.1 Evidence
Vecchiato 2025 (High, [18]): 72 participants on an "easy" trail of 8.2 km with 300 m of gain.
- Average VO2 was 41.5 ± 14.3% of VO2peak, with peaks of 74 ± 16%.
- Average HR was 65% of peak, with peaks of 86%.
- Slope was the independent predictor of demand.
- Less-fit and higher-risk participants spent more time at vigorous intensity.

### 4.2 Capacity model (Low)
- Effective VO2max = VO2max × altitude multiplier.
- Sustainable net power: P = (f·VO2max_eff − 3.5)·20.9/60 W/kg.
  - f_avg: 0.5 (range 0.4–0.6).
  - f_peak: 0.75 (range 0.70–0.85).
- Personal speed = min(Tobler speed × player factor, P_sustain / Cw).
- A trail is feasible if:
  - the demand on the steepest 200 m is at most P_peak, and
  - either the average demand is at most f_avg·VO2max_eff or the personal duration is within the band's hour limit, and
  - the tier is at most the band's maximum tier.
- Cross-check: a player with VO2max 40 at 75% effort would take about 20 min on Tranter's test climb (Tranter F about 20). This is plausible.

### 4.3 Altitude
- **Wehrlin & Hallén 2006** (High, [19]): 8 athletes at 300–2,800 m. VO2max fell 6.3% per 1,000 m (range 4.6–7.5%), from 66 to 55. Performance fell 14.5% per 1,000 m. The decline was already present between 300 and 800 m.
- **Fulco 1998** (Medium, [20]): VO2max is reduced from about 580 m upward.
- The "1% per 100 m above 1,500 m" heuristic is at the upper end of this evidence. The mid values used are 6.3% per 1,000 m above 700 m.
- Acute mountain sickness warning at 2,500 m or more (High, [21]).

### 4.4 Band table (Low; design values)

| Band | VO2max | Max tier (mid) |
|---|---|---|
| very_low | <25 | 1 |
| low | 25–32 | 2 |
| moderate | 32–40 | 3 |
| good | 40–48 | 4 |
| high | ≥48 | 5 |

Maximum hours per band are in params.json. Tiers 4–5 also require at least one completed Journey at the tier below.

## 5. Safety gating (warnings only; never say "safe")
NPS guidance [22][23]: plan ahead, leave a trip plan, check the weather, set a turnaround time, carry the Ten Essentials (navigation, sun protection, extra clothing, illumination, first aid, fire, repair tools, food, water, shelter), and know your limits.

1. **Maximum SAC by experience:**

| Experience | Maximum SAC |
|---|---|
| novice | T1 |
| beginner | T2 |
| intermediate | T3, with warning |
| advanced | T4, with acknowledgement |

   T5 and T6 are never offered, because they need ice axe, rope and crampon skills the app cannot verify. When `sac_scale` is missing: footway or paved surface → T1; an untagged path → "unknown", treated as T2 with the message "Difficulty unverified".
2. **Visibility by experience:** novice needs excellent or good; intermediate allows intermediate; "bad" needs advanced; "horrible" and "no" are excluded.
3. **Remoteness:** warn when the route is more than about 5 km from a road or takes more than 4 h, and show the Ten Essentials.
4. **Daylight:** warn if start time + 1.25 × personal duration is after sunset, and suggest a turnaround time.
5. **Season and weather:** raise the risk level by 1 for snow or ice, storms or heavy rain. SAC grades assume dry conditions [13].
6. **Altitude:** show an AMS notice at 2,500 m or more and a stronger one at 3,000 m or more.
7. **Cardiovascular risk:** if self-reported, use the lower f_peak and suggest seeing a clinician before tier 3 and above.

## 6. Open items
- Verify the Santee correction and the Tranter table against primary sources.
- Check whether the Mapy.com API exposes its own difficulty or elevation fields.
- Calibrate the multipliers against players' GPS logs.
- Have an exercise physiologist review the bands and f values.

## Citations
1. NPS Shenandoah, "How to Determine Hiking Difficulty." https://home.nps.gov/shen/planyourvisit/how-to-determine-hiking-difficulty.htm
2. Wikipedia, "Naismith's rule." https://en.wikipedia.org/wiki/Naismith%27s_rule
3. Scarf P. (2007) *J Sports Sci* 25(6):719–726. doi:10.1080/02640410600874906
4. Tranter table transcription. https://gist.github.com/sunsided/fc2113e337d7ea9e76489517bdb862a9
5. Wikipedia, "Tobler's hiking function" (Tobler 1993, NCGIA TR 93-1). https://en.wikipedia.org/wiki/Tobler%27s_hiking_function
6. Irmischer & Clarke (2018) *CaGIS* 45(2):177–186. doi:10.1080/15230406.2017.1292150
7. Campbell, Dennison, Butler, Page (2019) *Applied Geography* 106:93–107. https://research.fs.usda.gov/treesearch/58950
8. Minetti et al. (2002) *J Appl Physiol* 93:1039–1046. doi:10.1152/japplphysiol.01177.2001. PDF: http://runscribe.com/wp-content/uploads/power/Minetti2002.pdf
9. Wikipedia, "Pandolf equation." https://en.wikipedia.org/wiki/Pandolf_equation. Santee term via https://github.com/mattduffy/calories (unverified).
10. TTU ACSM metabolic calculations. https://www.depts.ttu.edu/ksm/_documents/grad/acsm_comps/6c-23-2013_HFI_Metabolic_Calculations.pdf
11. Wikipedia, "Metabolic equivalent of task." https://en.wikipedia.org/wiki/Metabolic_equivalent_of_task
12. Herrmann et al. (2024) 2024 Adult Compendium, *J Sport Health Sci*. https://pubmed.ncbi.nlm.nih.gov/38242596/. Tracking guide: https://pacompendium.com/wp-content/uploads/2024/03/4_2024_adult-compendium-tracking-guide-1-2024.pdf
13. SAC Mountain and Alpine Hiking Scale (2020, EN). https://www.sac-cas.ch/fileadmin/Ausbildung_und_Sicherheit/Sicher_unterwegs/Sicher_unterwegs_Wandern/2020_Berg_Alpinwanderskala_EN.pdf
14. OSM Wiki: https://wiki.openstreetmap.org/wiki/Key:sac_scale ; https://wiki.openstreetmap.org/wiki/Key:trail_visibility ; https://wiki.openstreetmap.org/wiki/Key:surface
15. Wikipedia, "Yosemite Decimal System" (*Freedom of the Hills*, 6th ed.). https://en.wikipedia.org/wiki/Yosemite_Decimal_System
16. AllTrails Help, "Difficulty ratings on AllTrails." https://support.alltrails.com/hc/en-us/articles/16596491196436-Difficulty-ratings-on-AllTrails (403 on fetch; search snippet used)
17. California State Parks, "Trail Difficulty Ratings." https://www.parks.ca.gov/?page_id=24055
18. Vecchiato et al. (2025) *Br Med Bull*. https://pmc.ncbi.nlm.nih.gov/articles/PMC12698341/
19. Wehrlin & Hallén (2006) *Eur J Appl Physiol* 96:404–412. doi:10.1007/s00421-005-0081-9
20. Fulco, Rock, Cymerman (1998) *Aviat Space Environ Med* 69(8):793–801. https://pubmed.ncbi.nlm.nih.gov/9715971/
21. Luks et al. (2019) WMS altitude illness guidelines. https://pubmed.ncbi.nlm.nih.gov/31248818/ (2024 update: doi:10.1016/j.wem.2023.05.013)
22. NPS, "Hike Smart." https://www.nps.gov/articles/hiking-safety.htm
23. NPS, "Ten Essentials." https://www.nps.gov/articles/10essentials.htm

## Recommended trail scoring algorithm
```pseudocode
function scoreTrail(trail, player, ctx):
    segs    = trail.elevationProfile ?? synthesizeSegments(trail.dist_km, trail.gain_m, trail.loss_m)
    surfK   = params.surface_multipliers[trail.surface ?? "unknown"]
    sac     = trail.sac_scale ?? inferSac(trail.highway, trail.surface)
    sacK    = params.sac_scale_table[sac]
    visK    = params.trail_visibility_table[trail.trail_visibility ?? "unknown"]
    altMult = 1 - loss_per_1000m.mid * max(0, trail.max_alt_m - onset_m.mid)/1000

    # 1. Generic physical demand
    for seg in segs:
        i  = clamp(seg.dh/seg.dx, -0.45, 0.45)
        v  = tobler(i) * surfK.speed / sacK.time_mult * visK.speed
        cw = minettiCw(i) * surfK.energy_eta * sacK.energy_mult
        moving_h += seg.dx/1000 / v;  netJ += cw*seg.dx
        if i < -0.15: eccentric_m += -seg.dh
        peak_W = max(peak_W, rolling200m(cw * v/3.6))
    if no profile: moving_h = max(moving_h, naismithLangmuir(trail)*sacK.time_mult/surfK.speed)
    avg_MET  = clamp(((netJ/20.9)/3.5 + moving_h*60) / (moving_h*60), 3.3, 9.0)
    load_MET_min = avg_MET * moving_h * 60
    total_h  = moving_h * (1 + stop_allowance.mid)

    # 2. Effort tier
    S_adj = 2.0192*sqrt((trail.gain_m/altMult) * (trail.dist_km/surfK.speed))
    tier  = binShenandoah(S_adj)
    if maxSustainedGrade(segs,200) >= 0.15 and tier < 4: tier += 1
    tier  = max(tier, tierFromDuration(total_h))

    # 3. Technical risk (separate axis)
    risk = max(sacK.risk_level, visK.risk_level) + seasonRiskAdd(ctx, trail.surface)
    if sac in {T5,T6} or trail.yds_class >= 4 or visK.min_experience == "not_offered": return EXCLUDED

    # 4. Player match
    vo2    = (player.vo2max ?? bandMid(player.band)) * altMult
    f_peak = player.cvRisk ? f_peak.low : f_peak.mid
    P_sus  = (f_avg.mid*vo2 - 3.5)*20.9/60 ;  P_peak = (f_peak*vo2 - 3.5)*20.9/60
    personal_h = Σ seg.dx/1000 / min(v_seg*player.speedFactor, 3.6*P_sus/cw_seg) * (1+stop_allowance.mid)
    fits_capacity   = peak_W <= P_peak and personal_h <= bandMaxHours(vo2)
                      and tier <= fitness_band_to_max_tier[band(vo2)].max_tier.mid
    fits_experience = sacRank(sac) <= maxSac(player.exp) and visRank(vis) <= maxVis(player.exp)

    # 5. Warnings only
    warn if sac=="unknown" ("difficulty unverified"); if max_alt >= 2500 (AMS);
    if ctx.start + 1.25*personal_h > ctx.sunset (daylight/turnaround);
    if remoteness > 5 km or personal_h > 4 (trip plan, Ten Essentials);
    if risk >= 3 (exposed terrain); if !fits_capacity ("likely above current fitness")
    return {offerable: fits_experience, fits_capacity, effort_tier: tier, risk_level: risk,
            est_hours: personal_h, generic_hours: total_h, load_MET_min, eccentric_descent_m: eccentric_m,
            warnings, disclaimer: "Estimates only. Conditions change; you are responsible for your safety."}

minettiCw(i) = 280.5i^5 - 58.7i^4 - 76.8i^3 + 51.9i^2 + 19.6i + 2.5
tobler(s)    = 6*exp(-3.5*|s+0.05|)
naismithLangmuir(t): h = km/5 + gain/600; g = loss/(0.5*km*1000)
    if 0.087<=g<=0.213: h -= loss/300*(10/60) elif g>0.213: h += loss/300*(10/60)
after each Journey: player.speedFactor = EWMA(predicted_moving_h / actual_moving_h)
```
