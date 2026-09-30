# R2: Rest & Recovery Norms for Me RPG

Version 0.1.0-unreviewed. Researched 2026-09-28. Companion file: `params.json`.

Design rule: normal, healthy rest is never penalized, and appropriate recovery is rewarded.

**Confidence levels:**
- **High:** stated directly in a position stand, consensus statement or meta-analysis that I read this session.
- **Medium:** a single RCT, cohort or narrative review, or guideline wording I verified only through a secondary source.
- **Low:** my interpolation, used as a tunable default.

## Q1. Rest days per week
- **ACSM 2009 [S1, S2]:**
  - Novice: lift 2–3 days a week, whole body (category A). That leaves 4–5 days without lifting.
  - Intermediate: 3–4 days (category B). That leaves 3–4 days without lifting.
  - Advanced: 4–6 days on split routines, each muscle 1–2 times a week (category C). That leaves 1–3 days without lifting.
  - 1–2 days a week is an effective maintenance frequency for people who already lift.
  - Confidence: High.
- **ACSM 2026 [S3]:** train all major muscle groups at least twice a week. Training to failure is "not strictly necessary for general health." Going from no training to any regular training gives the biggest benefit. Confidence: High; I saw the summary and citation, not the full text.
- **WHO 2020 [S4]:** 150–300 min a week of moderate or 75–150 min of vigorous aerobic activity, plus strength work on 2 or more days. Some activity is better than none. Confidence: High.
- **ACSM 2011 [S5]:** moderate aerobic exercise 30 min or more on 5 or more days, or vigorous 20 min or more on 3 or more days. Confidence: High.
- **ECSS/ACSM overtraining consensus [S6]:** athletes should have at least one passive rest day each week. Missing it, especially during intensified training, is closely linked to overreaching. Confidence: High.
- **Mixed training:** no authoritative source. My synthesis is to meet both minimums and keep at least 1 full rest day. Confidence: Low.

**Engine table: normal non-training days per week**

| Level | Strength | Endurance | Mixed | Minimum full rest days |
|---|---|---|---|---|
| Beginner | 4–5 | 2–4 | 3–4 | 1 |
| Intermediate | 3–4 | 2–3 | 2–3 | 1 |
| Advanced | 1–3 | 1–2 | 1–2 | 1 |

Confidence: High for strength, Medium for endurance, Low for mixed.

## Q2. Recovery for the same muscle group
- **ACSM:** train each muscle group 2–3 days a week with at least 48 h between sessions for the same group ([S5], via the secondary citation [S7]).
- **NSCA:** at least 1 and no more than 3 days between sessions that stress the same muscles [S8].
- Confidence for both: High that this is the guidance, Medium on exact wording.
- **Training to failure:** sets to failure (3×10 with a 10RM) slowed neuromuscular recovery out to about 48 h. Non-failure protocols recovered much faster between 24 and 48 h (Morán-Navarro 2017 [S9], n=10). Confidence: Medium.
- **Frequency:** training a muscle at least twice a week beats once a week for growth [S10]. Twice a week gave the highest effect size in advanced lifters [S1]. Confidence: High.
- **Eccentric load:** 40 min of loaded downhill walking (−28% grade, 10% of body mass carried) cut strength by about 19%. Strength, CK and soreness had not recovered at 72 h. A short prior exposure cut the damage by 47–66% [S11]. Confidence: Medium.
- **Age:** older adults need a higher maintenance dose [S12, S13] and lose more strength when they stop [S14]. Confidence: Medium.
- **What recovery depends on**, roughly in order: how close sets go to failure, volume, eccentric or novel work, training status, age, and sleep, energy and life stress [S6, S15]. Confidence: Medium.
- **Engine default:** 48 h (range 24–72 h), adjusted by those modifiers. Confidence: Low for the modifier sizes.

## Q3. Deloads
- **Consensus definition (Delphi, [S16]):** "a period of reduced training stress designed to mitigate physiological and psychological fatigue, promote recovery, and enhance preparedness for subsequent training." A deload can lower intensity, volume or proximity to failure, and can be pre-planned, autoregulated or both. Confidence: High that experts agree; the evidence is opinion.
- **Survey of 246 competitive strength and physique athletes [S17]:** a deload lasts 6.4 ± 1.7 days, every 5.6 ± 2.3 weeks. Athletes cut reps and sets, reduced load and stopped further from failure, but kept frequency and exercises the same. Confidence: Medium.
- **Bell 2025, NSCA Strength & Conditioning Journal [S18]:** Confidence: Medium.
  - Timing: every 4–8 weeks if pre-planned, plus reactive lighter days.
  - Length: 5–7 days. Harder blocks may need 2–5 days of full rest first.
  - Volume, cut in one step: low recovery need −25–45%; moderate −40–60%; high −60–90%.
  - Load: about −10% of RM, and/or stop 1–3 more reps short of failure.
  - Frequency: usually unchanged.
- **Coleman 2024 RCT [S19]:** a 1-week full break at the midpoint of 9 weeks did not change hypertrophy, endurance or power, but slightly reduced lower-body strength gains. Confidence: Medium.
- **Endurance taper [S20]:** 2 weeks with volume cut exponentially by 41–60%, keeping intensity. Confidence: High, but tapering aims at peaking before an event, not general recovery.
- **Beginners:** no evidence that they need scheduled deloads. Confidence: Low.

## Q4. Recovery after long endurance efforts
- **After a marathon [S21], n=64:** easy 40-min runs at 48, 96 and 144 h did not worsen CK or LDH (tracked for 8 days). Jump performance at 96 h was better than in the rest group. Confidence: Medium.
- **Marathon markers [S22]:** IL-6 and IL-10 largely resolve within 24–72 h. CK, LDH and myoglobin were still elevated at 72 h. Confidence: Medium.
- **Downhill walking [S11]:** about 19% strength loss, not recovered at 72 h. Descents drive hiking recovery. Confidence: Medium.
- **Overreaching can resolve within about 2 weeks [S6].**
- No guideline formula exists. The folk rule "one easy day per mile raced" has no primary evidence, so I do not cite it.

**Recovery tiers (Low confidence, my interpolation)**

| Tier | Examples | No-penalty recovery window |
|---|---|---|
| Light | under 60 min easy | 0–24 h |
| Moderate | 60–120 min, or a hilly 2–3 h hike | 24–48 h |
| Hard/long | 2–4 h run, or a 4–6 h hike with big descents | 48–72 h; easy activity OK from about 48 h |
| Extreme | marathon, ultra, over 6 h or multi-day trek | 72 h, then 7–14 days of reduced load; easy activity OK from about 48 h |

Multiply windows by 1.25–1.5 for an unfamiliar effort or a user aged 60+.

## Q5. Under-recovery signs a consumer app could detect
- **Definitions [S6]:** Confidence: High.
  - Functional overreaching (FOR): performance recovers in days to about 2 weeks and may rebound higher.
  - Non-functional overreaching (NFOR): recovery takes weeks to months.
  - Overtraining syndrome (OTS): recovery takes months or longer. It is diagnosed only by ruling out other causes.
  - The difference is how long recovery takes, so it can only be judged afterwards.
- **Hallmark sign:** being unable to sustain intense exercise, including failing to complete the planned training load [S6]. Confidence: High.
- **Monotony and strain [S23, S6]:** monotony is the week's mean daily load divided by its standard deviation; strain is weekly load × monotony. Spikes came before illness. Confidence: Medium.
- **Load increases:** novice runners who raised weekly distance by more than 30% had more distance-related injuries than those under 10% [S24]. Confidence: Medium.
- **Acute:chronic workload ratio (ACWR):** statistically flawed [S25], so do not use it as a hard rule.
- **Individual baselines:** use each person's own history [S15].

**Log-only heuristics.** These are listed in params.json. Thresholds are Low confidence unless noted.
1. Performance at matched effort falls 5% or more across 2 or more sessions over 7 or more days and does not rebound after 2 rest days. Escalate at 14 days.
2. Effort (RPE) for an identical workout rises by 1 or more points over 2 consecutive exposures.
3. Weekly load is more than 30% above the prior 2-week average (Medium).
4. Monotony is above 2.0.
5. 7 or more consecutive moderate-or-harder days with no rest (High).
6. 2 or more failed or cut-short sessions in 7 days.
7. 3 or more hard sessions on a muscle group inside its recovery window in 14 days.

These signals should only suggest rest. Never label a user "overtrained."

## Q6. Sleep and active recovery
- **Sleep amount:** 7 or more hours a night for adults aged 18–60 [S26]. Confidence: High.
- **Athlete sleep consensus [S27]:** 7–9 h, individualized. Naps under 30 min help mood and alertness. Banking sleep may help before expected sleep loss. Evidence for extended sleep is promising but uncontrolled. Sleep disturbance is a symptom of overreaching [S6, S27]. Confidence: High.
- **Active recovery:**
  - Easy running from 48 h after a marathon helped recovery [S21].
  - In the Dupuy meta-analysis, massage was the most effective option for soreness and fatigue; active recovery had some effect [S28].
  - Kellmann separates passive, active and pro-active recovery [S15], and a rest day also serves as a mental time-out [S6].
  - Confidence: Medium.
- **Game design:**
  - Sleep input is optional (one tap or a rough bucket) and never subtracts anything.
  - Light movement keeps streaks and earns recovery XP, not training XP.
  - Frame rest as "resting at the inn."

## Q7. Maintenance dose
- **Endurance:** held for up to 15 weeks on 2 or more sessions a week, or 33–66% less volume (13–26 min per session), as long as intensity stays the same. Highly trained athletes should cut frequency by no more than about 20% [S12]. Confidence: High.
- **Strength and size, young adults:** held for up to 32 weeks on 1 session a week with 1 set per exercise at the same relative load. One-ninth of the build dose maintained gains; one-third kept improving them [S12, S13]. Confidence: High.
- **Older adults:** about 2 sessions a week with 2–3 sets per exercise. Strength holds better than size [S12, S13]. Confidence: High.
- **ACSM:** 1–2 days a week maintains strength [S1]. Confidence: High.
- **Detraining:** Confidence: High.
  - Strength is generally kept through 4 weeks of inactivity. VO2max drops quickly in trained athletes but stays above untrained levels [S29].
  - Losses grow with time off and are larger over age 65 and in inactive people [S14].
  - After 32 weeks off, strength was only −7% and still 23% above the pre-training baseline; mass gains were mostly lost by 8 weeks [S13].
- **Health floor:** WHO: 150 min of moderate activity plus 2 strength days [S4].
- **Key point:** intensity is what preserves fitness, so give maintenance credit whenever intensity is kept.

## Recommended engine rules

**A. Rest never decays stats**
1. Rest days per rolling 7 days that never cause decay: beginner 5, intermediate 4, advanced 3.
2. Decay needs both conditions: the rolling 7-day dose is below maintenance, and the grace period has passed. Grace periods: strength and hypertrophy 14 days (range 14–28); aerobic 10 days (range 7–14). After that, decay is slow; the decay curve belongs to R1.
3. A deload week counts as full maintenance and full streak credit.
4. A user-declared "Rest at the Inn" pause freezes decay for up to 14 days.

**B. Muscle recovery**
5. A trained muscle group is "Recovering" for 48 h, adjusted as follows:
   - ×1.5 for sets near failure (0–1 reps in reserve) or 6 or more hard sets;
   - ×1.25 for unfamiliar or eccentric-heavy work, or age 60+;
   - ×0.5 for light sessions (3 or more reps in reserve, 3 sets or fewer).
6. Training a Recovering group still earns normal XP. After 3 or more overlaps in 14 days, show a hint only.

**C. Deloads**
7. Offer an optional 5–7-day "Festival Week" quest every 6 weeks (allowed range 4–8) of consistent training. During it: volume at 0.55 of the prior 4-week average (range 0.40–0.75), load down about 10% or 1–3 more reps in reserve, and frequency unchanged.
8. Offer it early if 2 or more overreaching signals fire.
9. Do not prompt deloads in a beginner's first 8 weeks.
10. Completing a deload grants Well-Rested plus an achievement and never costs stats.

**D. Maintenance per capacity (rolling 7 days)**
11. **Strength:** 1 or more sessions per pattern, 1 or more hard sets, at a load within about 10% of normal. Age 60+: 2 sessions with 2–3 sets.
12. **Hypertrophy:** about one-third of build-phase sets for young adults (one-ninth still largely holds gains). Age 60+: 2 sessions a week with 2–3 sets.
13. **Aerobic:** 2 or more sessions at usual intensity, or 33% or more of usual volume, with sessions of at least 13–26 min.
14. **Health stats:** 150 moderate (or 75 vigorous) minutes plus 2 strength days, with linear partial credit below that.

**E. Overreaching signals**
15. One signal gives a gentle "weary hero" message. Two or more signals, or signal 1 lasting 2 weeks or more, trigger an offer of rest or the deload quest. Never punish; include a "see a clinician if symptoms persist" note.

**F. Well-Rested buff**
16. Granted when any of these holds:
   - (a) a rest or active-recovery day after 3 or more consecutive training days, or after a hard session (RPE 7 or higher, or a hard/long endurance tier or above);
   - (b) a completed deload;
   - (c) optional self-report of 7 or more hours of good sleep on 3 of the last 4 nights. Missing input never removes eligibility.
17. Effect: +10% XP on the next session, lasting up to 72 h or 1 session. It stacks once and is spent by training, so rest cannot be farmed.
18. Light activity on a rest day (RPE 4 or lower, 60 min or less) keeps Well-Rested eligibility and streaks and earns recovery XP.

**G. Long-effort recovery**
19. Apply the Q4 tiers as a "Recovering" status: zero decay is guaranteed and easy activity earns a bonus. Descent-heavy hikes count one tier higher. Unfamiliar efforts or users aged 60+ get ×1.25–1.5.

## Limitations
- I did not read the ACSM 2026 full text. The Garber and NSCA wordings come from secondary sources.
- The deload evidence covers competitive lifters, not beginners.
- Hiking recovery tiers are interpolated.
- The monotony and performance-drop thresholds are conventions.
- Highly trained users may need more to maintain fitness.

## Citations
- [S1] Ratamess NA, et al. ACSM position stand: Progression models in resistance training for healthy adults. Med Sci Sports Exerc. 2009;41(3):687–708. doi:10.1249/MSS.0b013e3181915670. Full text: https://tourniquets.org/wp-content/uploads/PDFs/ACSM-Progression-models-in-resistance-training-for-healthy-adults-2009.pdf
- [S2] Esco MR. Resistance Training for Health and Fitness (ACSM brochure). 2013. https://www.prescriptiontogetactive.com/static/pdfs/resistance-training-ACSM.pdf
- [S3] Phillips SM, Currier BS, D'Souza AC, et al. ACSM Position Stand: Resistance training prescription for muscle function, hypertrophy, and physical performance in healthy adults: an overview of reviews. Med Sci Sports Exerc. 2026;58(4):851–872. doi:10.1249/MSS.0000000000003897. https://acsm.org/resistance-training-guidelines-update-2026/
- [S4] Bull FC, et al. WHO 2020 guidelines on physical activity and sedentary behaviour. Br J Sports Med. 2020;54(24):1451–1462. doi:10.1136/bjsports-2020-102955
- [S5] Garber CE, et al. ACSM position stand: Quantity and quality of exercise. Med Sci Sports Exerc. 2011;43(7):1334–1359. doi:10.1249/MSS.0b013e318213fefb
- [S6] Meeusen R, et al. Prevention, diagnosis, and treatment of the overtraining syndrome: ECSS/ACSM joint consensus. Med Sci Sports Exerc. 2013;45(1):186–205. doi:10.1249/MSS.0b013e318279a10a. Full text: https://www.sportgeneeskunde.com/wp-content/uploads/Meeusen-et-al-2013-Overtraining-Consensus-ECSS-ACSM.pdf
- [S7] Secondary citation of the ACSM 48 h rule: PMC11806282. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11806282/
- [S8] NSCA, Determination of Resistance Training Frequency (from Essentials of Personal Training). https://www.nsca.com/education/articles/kinetic-select/determination-of-resistance-training-frequency/ (returned HTTP 403; wording taken from the search excerpt)
- [S9] Morán-Navarro R, et al. Time course of recovery following resistance training leading or not to failure. Eur J Appl Physiol. 2017;117:2387–2399. doi:10.1007/s00421-017-3725-7
- [S10] Schoenfeld BJ, Ogborn D, Krieger JW. Effects of resistance training frequency on measures of muscle hypertrophy. Sports Med. 2016;46:1689–1697. doi:10.1007/s40279-016-0543-8
- [S11] Maeo S, et al. Prevention of downhill walking-induced muscle damage by non-damaging downhill walking. PLoS One. 2017;12(3):e0173909. doi:10.1371/journal.pone.0173909
- [S12] Spiering BA, Mujika I, Sharp MA, Foulis SA. Maintaining physical performance: the minimal dose of exercise. J Strength Cond Res. 2021;35(5):1449–1458. doi:10.1519/JSC.0000000000003964
- [S13] Bickel CS, Cross JM, Bamman MM. Exercise dosing to retain resistance training adaptations in young and older adults. Med Sci Sports Exerc. 2011;43(7):1177–1187. doi:10.1249/MSS.0b013e318207c15d
- [S14] Bosquet L, et al. Effect of training cessation on muscular performance: a meta-analysis. Scand J Med Sci Sports. 2013;23(3):e140–e149. doi:10.1111/sms.12047
- [S15] Kellmann M, et al. Recovery and performance in sport: consensus statement. Int J Sports Physiol Perform. 2018;13(2):240–245. doi:10.1123/ijspp.2017-0759
- [S16] Bell L, Strafford BW, Coleman M, Androulakis Korakakis P, Nolan D. Integrating deloading into strength and physique sports training programmes: a Delphi consensus. Sports Med Open. 2023;9:87. doi:10.1186/s40798-023-00633-0
- [S17] Rogerson D, Bell L, et al. Deloading practices in strength and physique sports: a cross-sectional survey. Sports Med Open. 2024;10:26. doi:10.1186/s40798-024-00691-y (author order needs verifying)
- [S18] Bell L, Darragh IAJ, Travis SK, Rogerson D, Nolan D. A practical approach to deloading. Strength Cond J. 2025. doi:10.1519/SSC.0000000000000910. Full text: https://doras.dcu.ie/31501/
- [S19] Coleman M, et al. Gaining more from doing less? One-week deload. PeerJ. 2024;12:e16777. doi:10.7717/peerj.16777
- [S20] Bosquet L, Montpetit J, Arvisais D, Mujika I. Effects of tapering on performance: a meta-analysis. Med Sci Sports Exerc. 2007;39(8):1358–1365. https://www.semanticscholar.org/paper/a41517ab5fa06b92568b861e2b1aa32b3003d214
- [S21] Martínez-Navarro I, et al. The week after running a marathon: running vs elliptical vs resting. Eur J Sport Sci. 2021;21(12):1668–1674. doi:10.1080/17461391.2020.1857441
- [S22] de Sousa CAZ, et al. Time course and role of exercise-induced cytokines after a marathon race. Front Physiol. 2021;12:752144. doi:10.3389/fphys.2021.752144
- [S23] Foster C. Monitoring training in athletes with reference to overtraining syndrome. Med Sci Sports Exerc. 1998;30(7):1164–1168. https://www.semanticscholar.org/paper/59629df5a87418e5653956d54bf8630a102544ae
- [S24] Nielsen RØ, et al. Excessive progression in weekly running distance and risk of running-related injuries. J Orthop Sports Phys Ther. 2014;44(10):739–747. doi:10.2519/jospt.2014.5164
- [S25] Impellizzeri FM, et al. Acute:chronic workload ratio: conceptual issues and fundamental pitfalls. Int J Sports Physiol Perform. 2020;15(6):907–913. https://journals.humankinetics.com/view/journals/ijspp/15/6/article-p907.xml
- [S26] Watson NF, et al. Recommended amount of sleep for a healthy adult (AASM/SRS). J Clin Sleep Med. 2015;11(6):591–592. doi:10.5664/jcsm.4758
- [S27] Walsh NP, et al. Sleep and the athlete: 2021 expert consensus. Br J Sports Med. 2021;55(7):356–368. doi:10.1136/bjsports-2020-102025
- [S28] Dupuy O, et al. Evidence-based approach for choosing post-exercise recovery techniques: meta-analysis. Front Physiol. 2018;9:403. doi:10.3389/fphys.2018.00403
- [S29] Mujika I, Padilla S. Detraining, Part I: short term insufficient training stimulus. Sports Med. 2000;30(2):79–87. doi:10.2165/00007256-200030020-00002
