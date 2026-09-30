# R3: Safe Progression Rates for Me RPG Questlines

**Status:** v0.1.0-unreviewed. Research synthesis for engine design, not medical advice. A qualified exercise professional should review it before the numbers ship.
**Date:** 2026-09-28
**Companion file:** `params.json` (machine-readable caps with low/mid/high and sources)

## How to read this

Each claim has a confidence tag:
- **High**: consistent guidance from a major position stand or consensus, or several good prospective studies agreeing.
- **Moderate**: one large prospective cohort, or a position-stand recommendation resting on limited (category B/C) evidence.
- **Low**: small studies, conflicting evidence, expert opinion, or my extrapolation to a new modality such as hiking.

Citations are numbered [n] and listed in full at the end. I checked every citation against PubMed/NCBI records or the publisher/repository full text. Where a number comes from a secondary source, the report says so.

---

## Executive summary

1. **The "10% rule" is a reasonable default, but it is not proven.** The only RCT (Buist 2008, n=532 novices) found the same injury rate with a 10%-rule program as with a faster standard program (20.8% vs 20.3%) [1]. Observational data put the risk threshold somewhere around 20–30% per week for novices [2][3]. A systematic review concluded the 10% rule "is not justified" as a universal rule [4]. *Confidence: moderate.*
2. **Single-session spikes matter more than weekly totals.** In 5,205 runners (588,071 sessions), injury rate rose when a session was more than 10% longer than the longest run in the previous 30 days: HRR 1.64 for a 10–30% spike and 2.28 for a spike above 100%. ACWR and week-to-week ratios did **not** predict injury [5]. *Confidence: moderate (observational, but large and objective GPS data).*
3. **The ACWR "sweet spot" (0.8–1.3) should not be treated as a validated control law.** It came from team-sport data [6]. Critics have shown mathematical coupling, statistical artefacts, and no predictive advantage over acute load alone, and have called for it to be dismissed [7][8][9][10]. At most, use it as a soft secondary guardrail. *Confidence: high that it is not validated; low for any specific band.*
4. **Resistance load:** add 2–10% load once the user beats the target reps by 1–2 on two consecutive sessions. Use the low end for small-muscle exercises and the high end for large-muscle exercises (ACSM 2009, evidence category B) [11]. *Confidence: moderate–high.*
5. **Aerobic starters:** add 5–10 min per session every 1–2 weeks for the first 4–6 weeks, then progress frequency and intensity over months (ACSM *Guidelines*, via secondary source) [12][13]. *Confidence: moderate.*
6. **Recovery rules:** at least one full rest day per week [14]. Avoid monotony, meaning every day at the same load [14][15]. Leave about 48 h before training the same muscle group again [13]. About 80% of endurance sessions should be easy [16]. *Confidence: moderate–high.*
7. **Deloads and tapers:** coaches typically deload every 4–6 weeks for about 7 days [17][18]. Before a boss battle, the best-supported taper is about 2 weeks with volume cut 41–60% and intensity kept the same [19]. In short plans for novices, a planned mid-block deload may bring no benefit [20]. *Confidence: moderate for tapering; low–moderate for deload timing.*

---

## Q1. Safe weekly increase in endurance volume: novices vs trained

| Finding | Source | Confidence |
|---|---|---|
| Novice runners get injured far more often than recreational runners: pooled 17.8 vs 7.7 injuries per 1000 h. | Videbæk 2015 [21] | High |
| **RCT:** a graded 13-week 10%-rule program had the same injury rate as a standard 8-week program in 532 novices (20.8% vs 20.3%, P=.90). Limiting progression to 10% was **not** protective. | Buist 2008 [1] | Moderate (single RCT; the control arm was not reckless) |
| In 874 GPS-tracked novices, progressing more than 30% (compared with under 10%) was associated with more distance-related injuries: HR 1.59, 95% CI 0.96–2.66, P=.07. There was no overall difference across groups. The authors suggest staying **below 30% per week over a 2-week period**. | Nielsen 2014 [2] | Low–moderate |
| In 261 half-marathon trainees, increasing weekly distance by 20–60% (compared with under 20%) meant more injuries by day 21 (risk difference 22.6%), but not by days 56 or 98. | Damsted 2019 [3] | Low–moderate |
| A systematic review (36 studies, 23,047 runners) found conflicting evidence for all training parameters and said the 10% rule is "not justified". | Fredette 2022 [4] | High (that the evidence conflicts) |
| An earlier systematic review could not identify which training errors cause running injuries. | Nielsen 2012 [22] | High (that evidence is weak) |
| In a large cohort, week-to-week change was not associated with injury; single-session spikes were. | Frandsen 2025 [5] | Moderate |
| Walking has lower injury risk than running. Among walkers, more walking per week was not associated with more injury. | Hootman 2001 [23]; Colbert 2000 [24] | Moderate |
| ACSM: increase session duration by 5–10 min every 1–2 weeks over the first 4–6 weeks, then frequency and intensity "as tolerated" over 4–8 months, adjusting downward if not tolerated. | ACSM *Guidelines* 8th ed. via [12]; Garber 2011 [13] | Moderate |

**Engine interpretation:**
- **Novice runners:** default to about 10% per week. Treat 20% as a hard ceiling. There is no evidence that 10% prevents injury better than roughly 15–20%, but signals appear above 20–30%.
- **Trained runners:** a similar percentage cap. There is no evidence that trained runners tolerate higher percentages.
- **Walkers:** a looser cap, combined with the ACSM absolute rule (+5–10 min per session every 1–2 weeks). Take whichever limit is smaller.
- **Small baselines:** percentages are meaningless near zero, so allow an absolute minimum step (+5 min/session or +0.5 km).

## Q2. Resistance training: load and volume progression by level

| Finding | Source | Confidence |
|---|---|---|
| Increase load **2–10%** once the user does 1–2 reps more than the target on **two consecutive sessions**. Lower percentage for small-muscle exercises, higher for large-muscle exercises. | ACSM 2009 [11] (category B) | Moderate–high |
| Novice strength: 60–70% 1RM for 8–12 reps. Advanced: cycle 80–100% 1RM. | [11] (category A) | High |
| Hypertrophy, novice/intermediate: 70–85% 1RM, 8–12 reps, 1–3 sets. Advanced: 70–100% 1RM, 1–12 reps, 3–6 sets. | [11] | High (novice) / Low (advanced; category C) |
| Local muscular endurance: 40–60% 1RM, ≥15 reps. Power: 0–60% 1RM (lower body) or 30–60% (upper body), fast velocity. | [11] | Moderate |
| Volume: novices start with 1–3 sets per exercise. "A dramatic increase in volume is not recommended." The position stand gives **no numeric weekly cap**. | [11] | Moderate (the numeric cap in params.json is extrapolated) |
| Frequency: 2–3 days/wk for novices, 3–4 for intermediates, 4–5 for advanced. | [11] | High |
| Beginning sedentary or older adults: 40–50% 1RM. About 48 h between sessions for the same muscle group. | Garber 2011 [13] via [25] | Moderate–high |
| Increase reps before load. At the top of the rep range, add about 5% load. | ACSM *Guidelines* via [12] | Moderate |
| Training to failure delays recovery by 24–48 h compared with stopping short at matched volume. | Morán-Navarro 2017 [26] | Moderate (n=10) |
| RIR-based RPE is a validated way to autoregulate effort. | Zourdos 2016 [27] | Moderate |

**Engine note:** use double progression (raise reps first, then load: +2–5% for small lifts, +5–10% for big lifts). Gate effort with reps-in-reserve targets, and do not prescribe sets to failure for novices.

## Q3. Hiking: distance and elevation gain

**There is no direct evidence on safe hiking progression rates. Everything in this section is low confidence and extrapolated.**
- **Walking plus extra load:** walking has low injury risk [23][24]. Energy cost rises with grade, pack weight, speed and terrain [28]. Common load-carriage injuries are blisters, stress fractures, back strain, metatarsalgia and knee pain [28].
- **Descent is the special risk.** In one study, 40 min of downhill walking reduced knee-extensor strength by about 14% at 48 h. A 20-min downhill bout 1–4 weeks earlier cut that damage by 54–61% [29]. So expose users to descent gradually, and always before a big descent quest.
- **Recommended approach:**
  - Track distance and elevation gain as separate variables.
  - Weekly distance: mid about 10%, high about 20%.
  - Weekly elevation gain: mid about 10%, high about 15%.
  - Apply the 30-day single-session spike cap to both the longest hike and the biggest-gain hike (borrowed from running, so extrapolated).
  - Progress pack weight only when distance and gain are stable. Never raise two of the three in the same week (heuristic).

## Q4. Does the acute:chronic workload ratio hold up?

**Origin.** In cricket fast bowlers, acute load above 200% of chronic brought 3.3–4.5× the injury risk [30]. Gabbett 2016 popularized a sweet spot of 0.8–1.3, a danger zone of ≥1.5, and keeping weekly increases under 10% [6].

**Critiques:**
- **Mathematical coupling:** the acute week is part of the chronic average, which creates spurious correlation [7].
- **No causal basis:** there is "no evidence supporting the use of ACWR" in load management; the ratio is inaccurate, ambiguous and inconsistent [8].
- **Statistical artefact:** dividing acute load by random or fixed chronic values reproduces the "ACWR effect". Neither ACWR nor acute load beats an intercept-only model, and the authors call for ACWR to be dismissed [9].
- **Weak origin of the sweet spot:** it was built from pooled, partly unpublished data, and studies disagree on the curve's shape [10].
- **Mixed pro-ACWR evidence:** a Gabbett-co-authored review found most team-sport studies associate high ACWR with more injury, but 14 different binning schemes and heterogeneous methods limit the recommendations [31].
- **Running contradicts it:** in runners, higher ACWR was associated with *lower* injury rates [5].

**Verdict:** ACWR is not validated (*high confidence*). Use it only as a smoothing constraint: 0.8–1.3, never above 1.5, uncoupled, with a 21–28-day chronic window. The primary controls should be the 30-day single-session spike cap and the weekly percentage cap.

## Q5. Session intensity bands

### Aerobic (ACSM classification)

Values are from ACSM *Guidelines* 8th ed. via [12]; Borg RPE values from Garber 2011 [13][25].

| Band | %HRR / %VO2R | %HRmax | RPE CR-10 | RPE Borg 6–20 |
|---|---|---|---|---|
| Light | 20–39 | 50–63 | <5 | ≤11 |
| Moderate | 40–59 | 64–76 | 5–6 | 12–13 |
| Vigorous | 60–84 | 77–93 | ≥7 | 14–17 |

*Confidence: high.* The Garber 2011 edition has slightly different light/vigorous %HRmax edges (roughly 57–63 and 77–95).

- **Distribution:** trained endurance athletes converge on about 80% low-intensity and 20% high-intensity sessions [16] (*moderate for athletes; low as a rule for novices*). Novices should stay light to moderate for the first 4–6 weeks, then add at most 1 vigorous session per week.
- **Load unit:** session-RPE × minutes is a valid, mode-independent load measure [32]. It is the recommended unit for the engine.

### Resistance (by goal)

These bands come from ACSM 2009 [11]. The RIR column is a heuristic mapped from Zourdos [27] and Morán-Navarro [26] (*low–moderate*), not part of the position stand.

| Goal / level | %1RM | Reps | Sets | RIR |
|---|---|---|---|---|
| Novice / general strength | 60–70 | 8–12 | 1–3 | 2–4 |
| Hypertrophy (novice–intermediate) | 70–85 | 8–12 | 1–3 | 1–3 |
| Strength (advanced) | 80–100 | 1–6 | 3–6 | 1–3 |
| Muscular endurance | 40–60 | ≥15 | 2–3 | 2–4 |
| Power | 30–60 | 3–6, fast | 3–5 | ≥3 |
| Beginner sedentary or older | 40–50 | 10–15 | 1 | 3–5 |

## Q6. Red flags the quest generator must avoid

| Red flag | Rule | Source | Confidence |
|---|---|---|---|
| Session spike | A session more than 10% longer than the 30-day longest raises injury rate; doubling is worst. | [5] | Moderate |
| Weekly jump | For novice runners, more than 20–30% week over week (or over a 2-week window). | [2][3] | Low–moderate |
| No rest day | At least 1 passive rest day per week. | [14] | Moderate–high |
| Monotony | Identical daily loads combined with high weekly strain precede illness and injury. Alternate hard and easy days. | [15][14] | Moderate |
| Back-to-back hard days | Put at least one easy or rest day between hard sessions. Same muscle group needs about 48 h, more after failure sets. | [13][26][16] | Moderate |
| Easy days done hard | Athletes often make easy days harder than prescribed. Enforce an easy-day ceiling of RPE ≤4/10. | [14] | Moderate |
| Stacking variables | Do not raise duration, frequency and intensity together. Sequence: duration → frequency or intensity. | [12] | Moderate |
| Novice exposure | Novices face about 2.3× the per-hour injury risk of recreational runners. | [21] | High |
| Warning signs | Performance decline, excess fatigue, mood change, poor sleep or life stress → reduce load or rest. No single biomarker is diagnostic. | [14] | High |

## Q7. Periodization: block length and deload placement

| Finding | Source | Confidence |
|---|---|---|
| Periodized resistance programs produce somewhat larger strength gains than non-periodized ones. | Rhea 2004 [33]; [11] | Moderate |
| Coaches deload every 4–6 weeks for about 7 days (range from one session to 2 weeks). Pre-planned deloads every 4–8 weeks are common. Deloads cut sets, reps or days, may lower intensity or effort, and keep the main lifts. Autoregulated deloads are accepted. | Bell 2023 Delphi [17] | Low–moderate |
| Surveyed athletes deloaded every 5.6 ± 2.3 weeks for 6.4 ± 1.7 days. | Rogerson 2024 [18] | Low |
| A midpoint 1-week deload in a 9-week RCT slightly reduced lower-body strength gains and did not help other outcomes. | Coleman 2024 [20] | Moderate |
| Best-supported taper: 2 weeks, volume cut 41–60% exponentially, intensity and frequency unchanged. | Bosquet 2007 [19] | Moderate–high (competitive athletes) |
| In strength sports, the last session is typically 4 ± 2 days before competition. | Cited in [17] | Low |
| Prevention through periodization and planned recovery is the priority; rest is the only treatment for overreaching. | [14] | High |

**Plan templates** (B = build, D = deload, T = taper/boss week):

| Plan length | Structure |
|---|---|
| 6 weeks | B B B B D (optional for novices) T |
| 8 weeks | B B B D B B B T |
| 10 weeks | B B B D B B B D B T |
| 12 weeks | B B B D B B B D B B T T |

**Boss constraint:** the boss session must be at most 1.1× the longest session in the prior 30 days. Include a rehearsal session at 90% or more of boss distance within 30 days of the boss, before the taper.

---

## Recommended quest-generator caps

The **mid** values are the recommended defaults. Treat **high** values as hard ceilings that are never crossed without an explicit override.

1. **Weekly endurance volume increase** (vs the mean of the previous 2 weeks):
   - Running: novice and trained 10% (hard max 20%).
   - Walking: 15% (hard max 25%), and also no more than +10 min per session per week.
   - Hiking distance: 10% (max 20%). Hiking elevation gain: 10% (max 15%).
   - Always allow a minimum step of +5 min or +0.5 km per session.
2. **Single-session spike cap:** no session above **1.10× the longest comparable session in the last 30 days**. This covers distance, duration and hike elevation gain, **including the boss battle**.
3. **Resistance:** double progression. Add load only after the user beats the target by 1–2 reps on 2 consecutive sessions: +2–5% for small lifts, +5–10% for large lifts. Weekly sets per muscle: at most +10% (max 20%, extrapolated). Novices: 1–3 sets, 60–70% 1RM or RIR 2–4, never to failure.
4. **One progressed variable per week.** Sequence: duration → frequency → intensity.
5. **Hard days:** at most 1 in a row, always followed by an easy or rest day.
   - Novices: at most 1 hard session per week in weeks 1–4, then at most 2.
   - Trained: at most 2–3 per week, with about 80% of endurance sessions easy.
6. **Rest:** at least 1 rest day per week, 2 for novices. At least 48 h between hard sessions for the same muscle group.
7. **Monotony guard:** no more than 3 consecutive days within ±10% of the same session-RPE load (heuristic).
8. **ACWR (secondary guardrail only):** uncoupled, session-RPE based. Target 0.8–1.3, never above 1.5. Never use it to override caps 1–2.
9. **Blocks and deloads:** 3–4 build weeks (mid 4, max 6), then about a 7-day deload at −30 to −50% volume with intensity kept. For novices in plans of 8 weeks or less, the deload may be autoregulated.
10. **Boss taper:** 1–2 weeks. Cut volume 40–60%, keep intensity and frequency. Last hard session 3–5 days before the boss.
11. **Downgrade triggers:** pain, unusual fatigue, poor sleep, mood drop, or a failed quest → repeat the previous week's load. Two flags in a week → insert a deload.

**What should be validated next:** (a) clinician or exercise-physiologist review; (b) monitor adherence and self-reported injuries against these caps; (c) find hiking-specific data.

---

## References

1. Buist I, Bredeweg SW, van Mechelen W, Lemmink KAPM, Pepping GJ, Diercks RL. No effect of a graded training program on the number of running-related injuries in novice runners: a randomized controlled trial. *Am J Sports Med.* 2008;36(1):33–39. doi:10.1177/0363546507307505. https://pubmed.ncbi.nlm.nih.gov/17940147/
2. Nielsen RØ, Parner ET, Nohr EA, Sørensen H, Lind M, Rasmussen S. Excessive progression in weekly running distance and risk of running-related injuries: an association which varies according to type of injury. *J Orthop Sports Phys Ther.* 2014;44(10):739–747. doi:10.2519/jospt.2014.5164. https://www.jospt.org/doi/10.2519/jospt.2014.5164
3. Damsted C, Parner ET, Sørensen H, Malisoux L, Hulme A, Nielsen RØ. The association between changes in weekly running distance and running-related injury: preparing for a half marathon. *J Orthop Sports Phys Ther.* 2019;49(4):230–238. doi:10.2519/jospt.2019.8541. https://www.jospt.org/doi/10.2519/jospt.2019.8541
4. Fredette A, Roy JS, Perreault K, Dupuis F, Napier C, Esculier JF. The association between running injuries and training parameters: a systematic review. *J Athl Train.* 2022;57(7):650–671. doi:10.4085/1062-6050-0195.21. https://pmc.ncbi.nlm.nih.gov/articles/PMC9528699/
5. Schuster Brandt Frandsen J, Hulme A, Parner ET, Møller M, Lindman I, Abrahamson J, et al.; Nielsen RØ. How much running is too much? Identifying high-risk running sessions in a 5200-person cohort study. *Br J Sports Med.* 2025;59(17):1203–1210. doi:10.1136/bjsports-2024-109380. https://findresearcher.sdu.dk/ws/files/295073070/1203.full.pdf
6. Gabbett TJ. The training–injury prevention paradox: should athletes be training smarter and harder? *Br J Sports Med.* 2016;50(5):273–280. doi:10.1136/bjsports-2015-095788. https://pmc.ncbi.nlm.nih.gov/articles/PMC4789704/
7. Lolli L, Batterham AM, Hawkins R, Kelly DM, Strudwick AJ, Thorpe R, Gregson W, Atkinson G. Mathematical coupling causes spurious correlation within the conventional acute-to-chronic workload ratio calculations. *Br J Sports Med.* 2019;53(15):921–922. doi:10.1136/bjsports-2017-098110.
8. Impellizzeri FM, Tenan MS, Kempton T, Novak A, Coutts AJ. Acute:chronic workload ratio: conceptual issues and fundamental pitfalls. *Int J Sports Physiol Perform.* 2020;15(6):907–913. doi:10.1123/ijspp.2019-0864.
9. Impellizzeri FM, Woodcock S, Coutts AJ, Fanchini M, McCall A, Vigotsky AD. What role do chronic workloads play in the acute to chronic workload ratio? Time to dismiss ACWR and its underlying theory. *Sports Med.* 2021;51(3):581–592. doi:10.1007/s40279-020-01378-6.
10. Impellizzeri FM, McCall A, Ward P, Bornn L, Coutts AJ. Training load and its role in injury prevention, part 2: conceptual and methodologic pitfalls. *J Athl Train.* 2020;55(9):893–901. doi:10.4085/1062-6050-501-19. https://pmc.ncbi.nlm.nih.gov/articles/PMC7534938/
11. American College of Sports Medicine (Ratamess NA, Alvar BA, Evetoch TK, Housh TJ, Kibler WB, Kraemer WJ, Triplett NT). Position stand: Progression models in resistance training for healthy adults. *Med Sci Sports Exerc.* 2009;41(3):687–708. doi:10.1249/MSS.0b013e3181915670.
12. Department of Health, Hong Kong SAR. *Exercise Prescription Doctor's Handbook*, Ch. 4 (reproducing ACSM's *Guidelines for Exercise Testing and Prescription*, 8th ed., 2010: Table 4.5 intensity classification and Figure 4.1 progression). https://www.chp.gov.hk/archive/epp/files/DoctorsHanbook_ch4.pdf. **Secondary source**; the primary is Thompson WR, Gordon NF, Pescatello LS (eds), *ACSM's Guidelines for Exercise Testing and Prescription*, 8th ed., LWW 2010, which I did not access directly. Check the 11th/12th editions for changes.
13. Garber CE, Blissmer B, Deschenes MR, Franklin BA, Lamonte MJ, Lee IM, Nieman DC, Swain DP; ACSM. Quantity and quality of exercise for developing and maintaining cardiorespiratory, musculoskeletal, and neuromotor fitness in apparently healthy adults: guidance for prescribing exercise. *Med Sci Sports Exerc.* 2011;43(7):1334–1359. doi:10.1249/MSS.0b013e318213fefb.
14. Meeusen R, Duclos M, Foster C, Fry A, Gleeson M, Nieman D, Raglin J, Rietjens G, Steinacker J, Urhausen A. Prevention, diagnosis, and treatment of the overtraining syndrome: joint consensus statement of the ECSS and ACSM. *Med Sci Sports Exerc.* 2013;45(1):186–205. doi:10.1249/MSS.0b013e318279a10a.
15. Foster C. Monitoring training in athletes with reference to overtraining syndrome. *Med Sci Sports Exerc.* 1998;30(7):1164–1168. doi:10.1097/00005768-199807000-00023.
16. Seiler S. What is best practice for training intensity and duration distribution in endurance athletes? *Int J Sports Physiol Perform.* 2010;5(3):276–291. doi:10.1123/ijspp.5.3.276.
17. Bell L, Strafford BW, Coleman M, Androulakis Korakakis P, Nolan D. Integrating deloading into strength and physique sports training programmes: an international Delphi consensus approach. *Sports Med Open.* 2023;9:87. doi:10.1186/s40798-023-00633-0.
18. Rogerson D, Nolan D, Androulakis Korakakis P, Immonen V, Wolf M, Bell L. Deloading practices in strength and physique sports: a cross-sectional survey. *Sports Med Open.* 2024;10:26. doi:10.1186/s40798-024-00691-y.
19. Bosquet L, Montpetit J, Arvisais D, Mujika I. Effects of tapering on performance: a meta-analysis. *Med Sci Sports Exerc.* 2007;39(8):1358–1365. doi:10.1249/mss.0b013e31806010e0.
20. Coleman M, Burke R, Augustin F, et al. Gaining more from doing less? The effects of a one-week deload period during supervised resistance training on muscular adaptations. *PeerJ.* 2024;12:e16777. https://peerj.com/articles/16777/
21. Videbæk S, Bueno AM, Nielsen RO, Rasmussen S. Incidence of running-related injuries per 1000 h of running in different types of runners: a systematic review and meta-analysis. *Sports Med.* 2015;45(7):1017–1026. doi:10.1007/s40279-015-0333-8.
22. Nielsen RO, Buist I, Sørensen H, Lind M, Rasmussen S. Training errors and running related injuries: a systematic review. *Int J Sports Phys Ther.* 2012;7(1):58–75. PMID 22389869.
23. Hootman JM, Macera CA, Ainsworth BE, Martin M, Addy CL, Blair SN. Association among physical activity level, cardiorespiratory fitness, and risk of musculoskeletal injury. *Am J Epidemiol.* 2001;154(3):251–258. doi:10.1093/aje/154.3.251.
24. Colbert LH, Hootman JM, Macera CA. Physical activity-related injuries in walkers and runners in the Aerobics Center Longitudinal Study. *Clin J Sport Med.* 2000;10(4):259–263. doi:10.1097/00042752-200010000-00006.
25. Kravitz L. From 1998 to 2011: ACSM publishes updated exercise guidelines. UNM. https://www.unm.edu/~lkravitz/Article%20folder/ACSMGuidelinesUNM.pdf (**secondary summary** of [13])
26. Morán-Navarro R, Pérez CE, Mora-Rodríguez R, de la Cruz-Sánchez E, González-Badillo JJ, Sánchez-Medina L, Pallarés JG. Time course of recovery following resistance training leading or not to failure. *Eur J Appl Physiol.* 2017;117:2387–2399. doi:10.1007/s00421-017-3725-7.
27. Zourdos MC, Klemp A, Dolan C, et al. Novel resistance training-specific rating of perceived exertion scale measuring repetitions in reserve. *J Strength Cond Res.* 2016;30(1):267–275. doi:10.1519/JSC.0000000000001049.
28. Knapik JJ, Reynolds KL, Harman E. Soldier load carriage: historical, physiological, biomechanical, and medical aspects. *Mil Med.* 2004;169(1):45–56. doi:10.7205/milmed.169.1.45.
29. Maeo S, Ochi Y, Yamamoto M, Kanehisa H, Nosaka K. Effect of a prior bout of preconditioning exercise on muscle damage from downhill walking. *Appl Physiol Nutr Metab.* 2015;40(3):274–279. doi:10.1139/apnm-2014-0390.
30. Hulin BT, Gabbett TJ, Blanch P, Chapman P, Bailey D, Orchard JW. Spikes in acute workload are associated with increased injury risk in elite cricket fast bowlers. *Br J Sports Med.* 2014;48(8):708–712. doi:10.1136/bjsports-2013-092524.
31. Andrade R, Wik EH, Rebelo-Marques A, Blanch P, Whiteley R, Espregueira-Mendes J, Gabbett TJ. Is the acute:chronic workload ratio (ACWR) associated with risk of time-loss injury in professional team sports? A systematic review. *Sports Med.* 2020;50(9):1613–1635. doi:10.1007/s40279-020-01308-6.
32. Foster C, Florhaug JA, Franklin J, Gottschall L, Hrovatin LA, Parker S, Doleshal P, Dodge C. A new approach to monitoring exercise training. *J Strength Cond Res.* 2001;15(1):109–115. PMID 11708692.
33. Rhea MR, Alderman BL. A meta-analysis of periodized versus nonperiodized strength and power training programs. *Res Q Exerc Sport.* 2004;75(4):413–422. doi:10.1080/02701367.2004.10609174.
