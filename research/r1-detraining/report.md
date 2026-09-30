# R1 — Detraining Physiology: Evidence Review for the Me RPG Capacity Engine

Version: 0.1.0-unreviewed · Compiled 2026-09-28 · Status: research draft, not yet peer-checked by a human

## Scope and method

This review covers how the four hidden capacities (aerobic, muscular_strength, muscular_endurance, mobility) decline when a player stops training, and how fast they come back. Sources were found with web search. Many full texts could not be opened (NCBI/PMC, Wiley, Springer and APS journals blocked automated access), so several numbers below come from abstracts, from secondary reviews that cite the primary study, or from search-engine summaries of those papers. The confidence tags take this into account:

- **High**: consistent across a meta-analysis or several primary studies, and the number was seen in an abstract or review text.
- **Medium**: one or two primary studies, or a number seen only through a secondary review.
- **Low**: sparse evidence, animal data, extrapolation, or a number that is my own modelling choice.

**Key definition used throughout.** Detraining is modelled as loss of the *training-induced gain* (G = trained value − untrained baseline), not loss of total capacity. The untrained baseline is kept by everyday living and never decays in the engine. Unless a figure is labelled "% of total", "% of gain" means percent of G.

---

## Q1. Aerobic capacity (VO2max): time course

### Trained athletes (years of endurance training)

| Inactivity | VO2max change (% of total) | Source | Confidence |
|---|---|---|---|
| ~1 wk | Small or not detectable in VO2max. Plasma volume and oxidative enzymes are already falling (citrate synthase about −5% at 6 d; GLUT4 about −17% at 6 d) | Coyle 1984; Vukovich 1996 (via Frontiers 2023 review) | Medium |
| 12–14 d | −4 to −7% (−7% at 12 d in Coyle; −4.7% at 14 d in runners, Houmard 1992; −3.7% at 15 d, Chen 2022) | Coyle 1984; Frontiers 2023 review | High |
| 21 d | about −4 to −7%. Max cardiac output −8% (Coyle) | Coyle 1984; Martin 1986 | High |
| 4 wk | −4 to −14% is typical; range −6 to −20% (one table showed −25.5% to +2.4%) | Mujika & Padilla 2000a; Bosquet & Mujika 2012 | High |
| 5 wk | −10% (kayakers) | García-Pallarés 2009 (via Frontiers 2023) | Medium |
| 8 wk | −13 to −20%. Stroke volume −14%, citrate synthase −40% | Coyle 1984/1985; Martin 1986 | High |
| 12 wk | Plateau at about −16% (stable from about day 56) | Coyle 1984 | High |

The trained advantage is only partly lost. After 84 days, Coyle's athletes still had higher VO2max than sedentary controls (50.8 vs 43.3 ml·kg⁻¹·min⁻¹). They lost about 60% of their advantage over untrained people and kept about 40%. Mujika & Padilla (2000b) reach the same conclusion: athletes' VO2max "declines markedly but remains above control values", while *recently acquired* gains are completely lost. **Confidence: high** for the qualitative claim, **medium** for the 40% figure (one small n=7 study, and some of the athletes' advantage may be genetic rather than trained).

Zheng et al. (2022) meta-analysis (21 studies): both short-term (<4 wk) and long-term (>4 wk) cessation lower VO2max, and the long-term loss is larger. Beyond about 30 days there was **no further significant change**, which supports decay toward a plateau. Athletes with higher VO2max, and people under 20, lost more in the long term. **Confidence: high** (I read the abstract but not the pooled effect sizes).

### Untrained / recently trained people

- Recently acquired VO2max gains are **completely reversed** by long-term (>4 wk) detraining. Capillarisation and oxidative enzymes also return fully to baseline (Mujika & Padilla 2000b). **Confidence: high** (qualitative).
- Previously sedentary adults trained for 13 weeks, then stopped for 4 weeks. VO2max, body fat, blood pressure, HDL and triglycerides all worsened significantly within those 4 weeks (Nolan et al. 2018). **Confidence: medium** (small n; I did not see the exact % of gain lost).
- In rats, VO2max gains from 4 weeks of training were no longer significantly different from controls after 4 weeks of detraining (Waring et al. 2015). **Confidence: low** (animal model).
- In practice: in someone who trained for weeks to a few months, most of the aerobic gain is gone by 4–8 weeks and almost all by 8–12 weeks.

**Mechanisms (why the shape is fast then plateauing):** blood and plasma volume drop quickly (−9% and −12% at 2–4 wk), so stroke volume falls. Mitochondrial proteins have a half-life of about 1 week, so oxidative enzymes fall quickly too. Central cardiac structure and capillaries change more slowly and partly persist in long-trained athletes. **Confidence: medium–high.**

---

## Q2. Maximal strength and hypertrophy: time course and grace window

### Grace window

- "Strength performance in general is readily retained for up to 4 weeks of inactivity." The exceptions are highly trained athletes' eccentric force and sport-specific power, which may fall sooner (Mujika & Padilla 2000a). **High.**
- Bosquet et al. (2013) meta-analysis (103 studies): losses are dose-dependent on cessation length. Effects are trivial over the first ~3–4 weeks and become significant after about 3 weeks. Overall SMDs: maximal force −0.46, submaximal strength −0.62, power −0.20. **High** for the direction and moderators; **medium** for the exact 3-week threshold, which I saw only in secondary summaries.
- In elite football-code athletes, strength and power were maintained for about 3 weeks. After that, strength fell about 2% of total per week and power 0.1–0.6% per week (McMaster et al. 2013). **Medium–high.**
- After 3 weeks off in the middle of a training block, there was no significant loss of muscle CSA or 1RM (Ogasawara et al. 2013). **High.**
- Power athletes lost about 6% of type II fibre area after 14 days off, with little change in strength (Hortobágyi et al. 1993, via secondary summaries). **Medium.**
- **Implication:** strength should have a grace window of about 2–4 weeks before any decay. Ordinary rest days, deload weeks and 1–2 week holidays should cost nothing. **High.**

### Strength after the grace window (untrained → newly trained)

- Young adults, 9 wk training then 31 wk detraining: 1RM gain +34%, and only 8% of 1RM lost by week 31, so about one-third of the gain was lost. Older adults (65–75): gain +28%, 14% of 1RM lost, about two-thirds of the gain. Both age groups kept strength equally for the first 12 weeks. Older adults declined faster from week 12 to 31 (Lemmer et al. 2000). **Medium–high.**
- Women with 20 wk training then 30–32 wk detraining: strength fell but **not to pretraining levels**, and fibre CSA changed relatively little (Staron et al. 1991). **High.**
- Young adults, 10 wk training then 20 wk detraining: CSA and muscle thickness returned to baseline, but **about 60% of the strength gain remained** (Psilander et al. 2019). **High.**
- Older men (58–70), 12 wk training then 12 wk detraining: strength gains were largely kept. About 14% was lost against a 36% gain, so less than half of the gain was lost (Blocquiaux et al. 2020). **Medium** (the exact reference base of the 14% is ambiguous in the summaries I could read).
- Strength is better preserved than muscle size during a 10-week break (Halonen et al. 2024). **High.**
- A systematic review (Encarnação et al., 2022, MDPI) found the high-quality evidence too thin to say precisely how long strength gains last. This is a caveat on all the numbers here. **High** (that uncertainty exists).

### Hypertrophy

Muscle size decays faster than strength. Size is roughly back to baseline by about 20 weeks in novices (Psilander 2019), while much of the neural and skill component of strength persists. In older adults, muscle size fell significantly after 31–52 weeks off (d = −1.11). After 12–24 weeks the effect was not yet significant (d = −0.60, CI crosses 0) (Grgic 2022 meta-analysis). **Medium–high.**

### Suggested strength curve (% of gain lost; mid parameters grace 21 d, τ 120 d, floor 0.30)

wk1 0 · wk2 0 · wk4 ~4% · wk8 ~18% · wk12 ~29%. This is consistent with Blocquiaux (<50% of gain lost at 12 wk) and Psilander (~56% kept at 20 wk). Lemmer's young cohort kept more than this curve predicts, so the mid curve is mildly conservative. **Confidence: medium** (model fit, not a measured curve).

---

## Q3. Muscular endurance and flexibility/mobility

### Muscular endurance (repetitions, local fatigue resistance)

- Bosquet 2013: submaximal strength / strength endurance showed a **larger** loss (SMD −0.62) than maximal force (−0.46). **High** (direction).
- Local oxidative capacity drops quickly. Citrate synthase falls −5% at 6 d, −29% at 10 d and −40% at 56 d, and mitochondrial protein half-life is about 1 week (Coyle 1984; McCoy 1994; via Frontiers 2023). These are the main substrates of local muscular endurance. **Medium–high.**
- Two weeks of detraining reduced muscular fitness as well as cardiopulmonary function in endurance athletes (Chen et al. 2022). **Medium** (I saw only the title and abstract-level summary).
- **Model:** decay sits between aerobic and max strength. Grace about 10 d, τ about 42 d. **Confidence: low–medium.** I found no meta-analysis giving a week-by-week rep-to-failure curve.

### Flexibility / mobility

- Inactive students stretched their hamstrings for 6 weeks (2×30 s, 5 d/wk), then stopped for 4 weeks. **Knee ROM gain was not retained at 4 weeks.** A second 6-week stretching block did not produce faster gains than the first, so there was no "memory" (Willy et al. 2001). **Medium** (one small study, n=18, but it is the canonical reference).
- Stretching-induced ROM gains are thought to be largely increased stretch tolerance rather than structural change, which fits rapid reversal. **Low–medium** (this is general literature consensus; I did not confirm it with a specific source this session).
- **Model:** short grace (about 7 d), fast τ (about 10 d), floor near 0, retraining multiplier about 1.0. **Confidence: low.** The evidence base is thin.

---

## Q4. Retained floor (portion of gains kept long-term)

| Capacity | Floor (fraction of gain kept at long-term plateau) | Evidence | Confidence |
|---|---|---|---|
| Aerobic, recently trained | ~0 | Mujika & Padilla 2000b ("completely lost") | High |
| Aerobic, long-trained athlete | ~0.3–0.5 | Coyle 1984 (still above controls at 84 d); Mujika & Padilla 2000b; Zheng 2022 plateau | Medium |
| Max strength | ~0.3–0.6 over 20–32 wk | Staron 1991; Psilander 2019 (~60% at 20 wk); Lemmer 2000; Blocquiaux 2020 | Medium |
| Muscle size | ~0 by ~20–50 wk in novices | Psilander 2019; Grgic 2022 | Medium |
| Muscular endurance | low (~0–0.3) | Inferred from oxidative-enzyme reversal | Low |
| Mobility | ~0 | Willy 2001 | Low–medium |

Caveat: no study followed people long enough (years) to show that a floor is truly permanent. A "floor" here means the level at the end of the longest observed detraining window. It is a modelling convenience, not a proven asymptote. **Confidence in permanence: low.**

---

## Q5. Retraining speed ("muscle memory")

- **Strength/size, humans.** Staron 1991: 6 weeks of retraining after 30–32 weeks off restored fast-fibre CSA and strength quickly compared with the original 20-week programme. Halonen 2024: after a 10-week break, pre-break strength and size were regained in **about 5 weeks** (the original gain took 10). At 30 weeks the break group matched a group that trained continuously for 20 weeks. Blocquiaux 2020 (older men): rapid return of 1RM to post-training levels. Ogasawara 2013: 3-week-off / 6-week-on cycles matched continuous training over 24 weeks. The implied lost-gain regain rate is roughly **2× (range 1.5–3×)** the original rate. **Confidence: medium–high.**
- **Counter-evidence.** Psilander 2019 found that the retraining response in the previously trained leg was *not* different from the untrained control leg (after 20 wk off, 10 wk initial training). A secondary analysis questions whether myonuclear retention mediates memory in humans ("Muscle memory not mediated by myonuclear number?", J Appl Physiol 2019). So the multiplier's lower bound should be 1.0. **High** (that the effect is inconsistent).
- **Mechanisms.** In mice, myonuclei gained through overload were retained during long denervation atrophy (Bruusgaard et al. 2010; animal data, **medium** for relevance to humans). Human muscle keeps an epigenetic (DNA hypomethylation) signature of prior hypertrophy that amplifies the response to later loading (Seaborne et al. 2018; **medium**). Neural and motor-learning effects persist (Psilander 2019; **high**).
- **Aerobic.** No good human retraining-multiplier data was found. Recovery after 20 days of bed rest ranged from a few days to 55 days, and trained people needed longer in absolute terms (Girardi et al. 2020, citing bed-rest studies). A modest multiplier (~1.5) is a reasonable guess because structural cardiac changes partly persist. **Confidence: low.**
- **Mobility.** Willy 2001 found no faster regain (multiplier ≈ 1.0). **Low–medium.**

**Engine note:** apply the multiplier only to the *lost* portion (between current value and previous peak). Normal gain rates apply above the old peak.

---

## Q6. Effects of age and training age

**Age**
- **Strength:** larger loss with cessation in people over 65 (Bosquet 2013; **high**). Young and old keep strength equally for about 12 weeks, then older adults decline faster (Lemmer 2000; **medium–high**). Older adults still regain strength rapidly on retraining (Blocquiaux 2020; **medium**). Suggestion: for 65+, keep the same grace window but shorten τ by about 0.6×, and leave the retraining multiplier roughly unchanged.
- **Muscle size in older adults:** falls significantly after 31–52 weeks off (Grgic 2022; **medium–high**).
- **Aerobic:** Zheng 2022 found *younger* (<20) athletes lost more VO2max long-term than adults. There is little direct detraining data in older adults, so the age modifier is set near 1.0 with wide bounds. **Low.**
- **Muscular endurance and mobility:** no age-specific detraining data found. Mobility baseline declines with age anyway. **Low.**

**Training age / training status**
- Higher training status means a larger *absolute* VO2max drop but a larger retained floor. Recently trained people lose all their aerobic gains; long-trained athletes stay above controls (Mujika & Padilla 2000b; Zheng 2022; Coyle 1984). **High** (qualitative).
- Bosquet 2013 found larger strength and power losses in *inactive* people than in recreational athletes. **High.** Highly trained athletes may lose eccentric strength and sport-specific power sooner (Mujika & Padilla 2000a). **Medium.**
- Engine suggestion: scale `retained_floor_frac` up with cumulative training age, for example floor = base + 0.1 per year trained, capped at the "high" value. **Low** (this is a design choice).

**Reduced training vs. cessation (important for "never penalise rest")**
- Endurance performance is maintained for up to 15 weeks with 2 sessions/week, and strength for up to 32 weeks with 1 session/week and 1 set per exercise, *provided intensity is kept* (Spiering, Mujika et al. 2021). **Medium–high.** The engine should count reduced-but-nonzero training as maintenance, not detraining.

---

## Q7. Mathematical model and τ values

- The curves have a **lag/plateau, then roughly exponential approach to a new level**. VO2max falls fastest in the first 2–4 weeks and then plateaus at about 8 weeks (Coyle 1984; Zheng 2022). Strength shows a clear flat grace period and then a slow decline (Mujika & Padilla 2000a; Bosquet 2013; McMaster 2013). A simple **"grace + exponential decay to a floor"** model captures this with three parameters per capacity:

  `G(t) = G0 × [ floor + (1 − floor) × exp(−max(0, t − grace)/τ) ]`

  Here t is the number of consecutive days below the maintenance dose. **Confidence: medium.** This is a phenomenological fit; no paper fits this exact form across all four capacities.

- **Banister impulse-response (fitness–fatigue) model.** The standard defaults are fitness τ₁ ≈ 42 d and fatigue τ₂ ≈ 7 d (Banister 1975; Morton, Fitz-Clarke & Banister 1990; Busso 1994). These τ values vary widely between individuals, and the Banister model has known limitations. τ₁ is best read as the decay of *performance readiness from recent training impulses*. It is not a clean detraining constant, and pure Banister has no grace period or floor. **Confidence: medium** for the defaults, **low** for using them directly as detraining constants.
- **Fit to the aerobic data.** For 7% of 62 at 12 d and a plateau of −16% by day 56, the loss reaches ~44% of its asymptote in about 12 days, giving **τ ≈ 20 d** with little grace. That is shorter than Banister's 42 d, which makes sense because Banister τ₁ covers overall fitness rather than acute plasma-volume loss. Suggested aerobic τ: **21 d (14–35)**. **Medium.**
- **Strength:** τ ≈ **120 d (60–240)** after a 21-day grace. **Medium–low.**
- **Muscular endurance:** τ ≈ **42 d (28–70)**, which happens to match Banister τ₁. **Low.**
- **Mobility:** τ ≈ **10 d (7–21)**. **Low.**
- A two-compartment model (a fast "metabolic/volume" pool plus a slow "structural/neural" pool) would fit better, but it adds parameters without data to calibrate them. Deferred.

---

## Recommended engine parameters

The machine-readable version is in `params.json`. "Low/mid/high" there are numeric bounds on each parameter. For `pct_loss_by_week`, "low" is the slow-decay scenario and "high" the fast-decay scenario, in % of training-induced gain.

| Capacity | grace_days | τ (days) | floor | retraining × | % of gain lost wk1/2/4/8/12 (mid) |
|---|---|---|---|---|---|
| aerobic | 7 (4–10) | 21 (14–35) | 0.15 (0–0.4) | 1.5 (1.0–2.0) | 0 / 24 / 54 / 77 / 83 |
| muscular_strength | 21 (14–28) | 120 (60–240) | 0.30 (0.1–0.5) | 2.0 (1.0–3.0) | 0 / 0 / 4 / 18 / 29 |
| muscular_endurance | 10 (7–14) | 42 (28–70) | 0.15 (0–0.3) | 1.5 (1.0–2.0) | 0 / 8 / 30 / 57 / 70 |
| mobility | 7 (3–14) | 10 (7–21) | 0.05 (0–0.2) | 1.0 (1.0–1.2) | 0 / 48 / 83 / 94 / 95 |

### Rationale and design rules

1. **Rest is never penalised.** The grace counter counts only *consecutive* days below a maintenance dose. Any qualifying session resets it. The shortest grace is 7 days, so normal 1–3 rest days, a weekend, or a one-week holiday never cause decay. The strength grace of 21 days means a deload or a 2-week break costs nothing, which matches Ogasawara 2013, Mujika & Padilla 2000a and McMaster 2013.
2. **Maintenance dose.** Reduced training is not detraining. As a default: aerobic and endurance decay is paused by ≥2 sessions/week at maintained intensity; strength decay is paused by ≥1 session/week (Spiering 2021). Mobility decay is paused by ≥2–3 mobility sessions/week. This last figure is an extrapolation, **low** confidence.
3. **Decay applies to the gain only,** never to the untrained baseline. The game should never push a player below where they started.
4. **Floors scale with training age.** A new player's aerobic floor is near 0. A multi-year player's floor rises toward 0.4 (Coyle 1984; Mujika & Padilla 2000b).
5. **Retraining multiplier applies only up to the previous peak.** The strength multiplier is 2× (Halonen 2024; Staron 1991), but 1.0 is a defensible lower bound (Psilander 2019).
6. **Age ≥65:** multiply strength τ by about 0.6 and endurance τ by about 0.8. The aerobic modifier stays near 1.0 (weak data). Under 20: aerobic τ about 0.85 (Zheng 2022).
7. **Deterministic implementation.** Use the closed-form equation above, computed from days since the last qualifying session. This keeps results reproducible and avoids day-by-day accumulation drift.

### Biggest uncertainties to resolve before v1.0

- Mobility and muscular-endurance curves are based on very few studies.
- The aerobic retraining multiplier has essentially no direct human data.
- Whether floors are permanent over years is unknown.
- Several numbers were read from secondary summaries rather than full texts. A human should verify the Bosquet 2013 duration-moderator table, the Coyle 1984 full text, and Zheng 2022's pooled SMDs.

---

## References

Items marked † were accessed only through abstracts or secondary summaries in this session. Items marked ‡ have details (authors, volume, pages) that I could not verify this session and that need checking.

1. Mujika I, Padilla S. Detraining: loss of training-induced physiological and performance adaptations. Part I: Short term insufficient training stimulus. *Sports Med.* 2000;30(2):79–87. https://doi.org/10.2165/00007256-200030020-00002 †
2. Mujika I, Padilla S. Detraining: loss of training-induced physiological and performance adaptations. Part II: Long term insufficient training stimulus. *Sports Med.* 2000;30(3):145–154. https://doi.org/10.2165/00007256-200030030-00001 † (PMID 10999420)
3. Bosquet L, Berryman N, Dupuy O, Mekary S, Arvisais D, Bherer L, Mujika I. Effect of training cessation on muscular performance: a meta-analysis. *Scand J Med Sci Sports.* 2013;23(3):e140–e149. https://doi.org/10.1111/sms.12047 †
4. Bosquet L, Mujika I. Detraining. In: Mujika I (ed.), *Endurance Training: Science and Practice*. 2012. https://www.researchgate.net/publication/236590070_Detraining † ‡ (book chapter; publisher details not verified)
5. Zheng J, et al. Effects of short- and long-term detraining on maximal oxygen uptake in athletes: a systematic review and meta-analysis. *BioMed Res Int.* 2022;2022:2130993. https://doi.org/10.1155/2022/2130993 † (co-authors ‡)
6. Cardiorespiratory and metabolic consequences of detraining in endurance athletes. *Front Physiol.* 2023/2024;14:1334766. https://doi.org/10.3389/fphys.2023.1334766 (authors ‡ — not captured in this session; used as the source for the Houmard 1992, Martin 1986, García-Pallarés 2009, McCoy 1994, Vukovich 1996 and Chen 2022 numbers)
7. Coyle EF, Martin WH, Sinacore DR, Joyner MJ, Hagberg JM, Holloszy JO. Time course of loss of adaptations after stopping prolonged intense endurance training. *J Appl Physiol.* 1984;57(6):1857–1864. https://doi.org/10.1152/jappl.1984.57.6.1857 †
8. McMaster DT, Gill N, Cronin J, McGuigan M. The development, retention and decay rates of strength and power in elite rugby union, rugby league and American football: a systematic review. *Sports Med.* 2013;43(5):367–384. https://doi.org/10.1007/s40279-013-0031-3 †
9. Staron RS, Leonardi MJ, Karapondo DL, Malicky ES, Falkel JE, Hagerman FC, Hikida RS. Strength and skeletal muscle adaptations in heavy-resistance-trained women after detraining and retraining. *J Appl Physiol.* 1991;70(2):631–640. https://doi.org/10.1152/jappl.1991.70.2.631 †
10. Bruusgaard JC, Johansen IB, Egner IM, Rana ZA, Gundersen K. Myonuclei acquired by overload exercise precede hypertrophy and are not lost on detraining. *PNAS.* 2010;107(34):15111–15116. https://doi.org/10.1073/pnas.0913935107 †
11. Psilander N, Eftestøl E, Cumming KT, et al. Effects of training, detraining, and retraining on strength, hypertrophy, and myonuclear number in human skeletal muscle. *J Appl Physiol.* 2019. https://doi.org/10.1152/japplphysiol.00917.2018 † (volume/pages and co-author list ‡)
12. "Muscle memory" not mediated by myonuclear number? Secondary analysis of human detraining data. *J Appl Physiol.* 2019. https://doi.org/10.1152/japplphysiol.00506.2019 † (authors ‡; PMID 31513448)
13. Seaborne RA, Strauss J, Cocks M, et al. Human skeletal muscle possesses an epigenetic memory of hypertrophy. *Sci Rep.* 2018;8:1898. https://doi.org/10.1038/s41598-018-20287-3 †
14. Halonen EJ, et al. Does taking a break matter—adaptations in muscle strength and size between continuous and periodic resistance training. *Scand J Med Sci Sports.* 2024. https://doi.org/10.1111/sms.14739 † (co-authors ‡)
15. Ogasawara R, Yasuda T, Ishii N, Abe T. Comparison of muscle hypertrophy following 6-month of continuous and periodic strength training. *Eur J Appl Physiol.* 2013;113:975–985. https://doi.org/10.1007/s00421-012-2511-9 † (author list ‡)
16. Blocquiaux S, et al. The effect of resistance training, detraining and retraining on muscle strength and power, myofibre size, satellite cells and myonuclei in older men. *Exp Gerontol.* 2020. https://www.sciencedirect.com/science/article/pii/S0531556519307806 (PMID 32017951) † (volume/DOI ‡)
17. Lemmer JT, Hurlbut DE, Martel GF, et al. Age and gender responses to strength training and detraining. *Med Sci Sports Exerc.* 2000;32(8):1505–1512. https://journals.lww.com/acsm-msse/fulltext/2000/08000/age_and_gender_responses_to_strength_training_and.21.aspx †
18. Grgic J. Use it or lose it? A meta-analysis on the effects of resistance training cessation (detraining) on muscle size in older adults. *Int J Environ Res Public Health.* 2022;19:14048. https://vuir.vu.edu.au/44557/ (DOI likely 10.3390/ijerph192214048 ‡)
19. Encarnação IGA, Viana RB, et al. Effects of detraining on muscle strength and hypertrophy induced by resistance training: a systematic review. MDPI (ISSN 2813-0413), 2022;1(1):1. https://www.mdpi.com/2813-0413/1/1/1 † (journal name and authors ‡)
20. Hortobágyi T, Houmard JA, Stevenson JR, Fraser DD, Johns RA, Israel RG. The effects of detraining on power athletes. *Med Sci Sports Exerc.* 1993;25(8):929–935. † (via secondary summaries only; DOI not verified)
21. Willy RW, Kyle BA, Moore SA, Chleboun GS. Effect of cessation and resumption of static hamstring muscle stretching on joint range of motion. *J Orthop Sports Phys Ther.* 2001;31(3):138–144. https://doi.org/10.2519/jospt.2001.31.3.138 † (author list ‡)
22. Girardi M, Casolo A, Nuccio S, Gattoni C, Capelli C. Detraining effects prevention: a new rising challenge for athletes. *Front Physiol.* 2020;11:588784. https://doi.org/10.3389/fphys.2020.588784
23. Spiering BA, Mujika I, Sharp MA, Foulis SA. Maintaining physical performance: the minimal dose of exercise needed to preserve endurance and strength over time. *J Strength Cond Res.* 2021;35(5):1449–1458. https://doi.org/10.1519/JSC.0000000000003964 †
24. Nolan PB, et al. The effect of detraining after a period of training on cardiometabolic health in previously sedentary individuals. *Int J Environ Res Public Health.* 2018;15(10):2303. https://doi.org/10.3390/ijerph15102303 †
25. Waring CD, et al. Cardiac adaptations from 4 weeks of intensity-controlled vigorous exercise are lost after a similar period of detraining. *Physiol Rep.* 2015. https://doi.org/10.14814/phy2.12302 † (rat study)
26. Chen YT, et al. Two weeks of detraining reduces cardiopulmonary function and muscular fitness in endurance athletes. *Eur J Sport Sci.* 2022. https://doi.org/10.1080/17461391.2021.1880647 † (authors ‡)
27. Banister EW, Calvert TW, Savage MV, Bach T. A systems model of training for athletic performance. *Aust J Sports Med.* 1975;7:57–61. ‡ (not accessed; cited via secondary sources)
28. Morton RH, Fitz-Clarke JR, Banister EW. Modeling human performance in running. *J Appl Physiol.* 1990;69(3):1171–1177. https://doi.org/10.1152/jappl.1990.69.3.1171 ‡ (not accessed)
29. The Fitness–Fatigue Model: what's in the numbers? *Int J Sports Physiol Perform.* 2022;17(5):810–. https://journals.humankinetics.com/view/journals/ijspp/17/5/article-p810.xml † (authors ‡)
30. Hellard P, et al. Assessing the limitations of the Banister model in monitoring training. https://pmc.ncbi.nlm.nih.gov/articles/PMC1974899/ † (journal/year ‡)
31. American College of Sports Medicine. Position stand: Progression models in resistance training for healthy adults. *Med Sci Sports Exerc.* 2009;41(3):687–708. https://doi.org/10.1249/MSS.0b013e3181915670 (no detraining-specific numbers were used from this source)
32. Garber CE, et al. ACSM position stand: Quantity and quality of exercise for developing and maintaining cardiorespiratory, musculoskeletal, and neuromotor fitness in apparently healthy adults. *Med Sci Sports Exerc.* 2011;43(7):1334–1359. https://doi.org/10.1249/MSS.0b013e318213fefb (general context only; reversibility content not verified this session)
33. Phillips SM (chair), et al. ACSM position stand: Resistance training prescription for muscle function, hypertrophy, and physical performance in healthy adults: an overview of reviews. *Med Sci Sports Exerc.* April 2026. https://acsm.org/science-spotlight-acsm-releases-new-position-stand-on-resistance-training/ (the announcement does not address detraining; the full text was not reviewed)

The ACSM position stands supply general context but give **no detraining time constants**. The quantitative parameters rest on the reviews and primary studies above.
