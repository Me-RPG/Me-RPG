# R5: Low-Intrusion Fitness Assessment for Me RPG Onboarding

**Status:** 0.1.0-unreviewed research draft (2026-09-28). This is not legal or medical advice. A clinician (for example an ACSM-certified clinical exercise physiologist or a sports-medicine physician) and legal counsel must review every safety rule and every piece of user-facing text before launch.
**Companion file:** `params.json` in this folder. It uses the same section names.

**Confidence legend:**
- **High:** a primary source I retrieved and read (peer-reviewed abstract or full text, or the official document).
- **Medium:** a reputable secondary source, a primary source I only partly verified, or well-established knowledge I did not re-verify this session.
- **Low:** my own derivation or design judgement, or a value I could not verify. Treat these as placeholders.

## 0. Executive answer
1. **Safety screen.** The PAR-Q+ is the international standard, but its owners allow free use only for individuals, professionals, non-commercial research and not-for-profits. A for-profit app needs written permission or a commercial licence, and the form may not be altered. Me RPG has two options: (A) license the PAR-Q+ and embed it unmodified, or (B) ship a self-written, clinician-reviewed screen based on the published ACSM 2015 logic (current activity, known cardiovascular/metabolic/renal disease, signs or symptoms, desired intensity) plus the generic "delay" conditions. I recommend (B) for v1. A positive answer never blocks the game. It (i) recommends talking to a health professional, (ii) limits the player to light-to-moderate "Gentle Path" quests and hides maximal Trials, and (iii) lets the player confirm clearance later. The app never diagnoses. **Confidence: high** on licensing and ACSM facts; **medium** on the product policy.
2. **Shortest validated self-report.** Very short instruments exist: Milton's single item, the 2-item Exercise Vital Sign and the 2-item Stanford Brief Activity Survey. For fitness estimation, the best single question is a paraphrased **NASA/JSC Physical Activity Rating (PA-R, 0–7)**, because it plugs straight into Jackson 1990. All self-reports are weak. IPAQ-SF correlates about 0.3 with accelerometers and overestimates activity by about 84% on average. Use them as starting priors, not as truth. **High.**
3. **Non-exercise VO2max.** Every validated adult model I found needs a body-size term (BMI, waist, %fat or weight). Jackson 1990 has R≈0.78 and SEE≈5.6–5.7. Wier 2006 has SEE≈4.9. Nes 2011 (HUNT) uses waist and resting HR, with SEE≈5.1–5.7. Jurca 2005 also needs BMI. **None works without body size as published.** Two workarounds keep body data out of our hands. One substitutes an average BMI for the player's age and sex, taken from the FRIEND cohort (about 24–29 kg/m²); this raises the error to about 7 mL·kg⁻¹·min⁻¹. The other is the Uth heart-rate ratio method, which needs only age and resting HR. Use both if resting HR is available from a wearable. **High** on the models; **low** on the imputation error, which is my own calculation.
4. **At-home Trials.**
   - Cooper 12-minute run/walk (distance only, no weight).
   - 1-mile walk (Rockport needs weight, so substitute an average or use time bands).
   - 6-minute walk.
   - Push-up test (CSEP/ACSM norms).
   - 30-second chair stand (Senior Fitness Test).
   - Sit-to-rise test (Brito/Araújo, scored 0–10).
   - Sit-and-reach (CSEP norms).
   - Talk test, used to set intensity rather than as a score.
   - Wall-sit and plank have no robust adult norms, so score them against the player's own best.
5. **Imported history.** Prefer the device's own VO2max estimate. Apple computes it from the weight in the user's own profile, so no weight reaches us. Otherwise fit pace against heart rate on steady, flat stretches and extrapolate to age-predicted maximum heart rate (the Firstbeat approach), or use best efforts. Endurance and strength tiers come from 28-day volume, frequency and longest session. Don't use the acute:chronic workload ratio as an injury predictor.
6. **Limitations.** Coarse chips only: body area, impact tolerance, pregnancy or postpartum, mobility aid or wheelchair, balance. No diagnoses and no free text.
7. **Flow.** Eight screens or fewer: safety → age band → sex for norms (optional) → activity level → strength days → functional check → limitations → goal. Device import and Trials are optional side quests.

## 1. Minimal safety screen (Q1)

### 1.1 What PAR-Q+ contains
Source: the official PAR-Q+ 2025 PDF (© 2025 PAR-Q+ Collaboration, form dated 01-11-2024), read in full. **High.** Summary in my own words, since the form's wording is copyrighted:
- **Page 1 has seven yes/no questions:**
  1. doctor-diagnosed heart condition or high blood pressure;
  2. chest pain at rest, in daily life or during activity;
  3. dizziness-related loss of balance, or loss of consciousness, in the past 12 months (over-breathing excluded);
  4. any other chronic condition;
  5. prescription medication for a chronic condition;
  6. a bone, joint or soft-tissue problem in the past 12 months that activity could worsen;
  7. a doctor's advice to exercise only under medical supervision.
- **All "no":** cleared. The player should start slowly and follow the WHO guidelines. People **over 45 who are not used to vigorous or maximal exercise** should consult a qualified exercise professional before exercising at that intensity.
- **Any "yes":** complete pages 2–3, which ask condition-specific follow-ups. Topics: arthritis, osteoporosis or back problems; cancer; heart disease; high blood pressure; metabolic disease; mental health; respiratory disease; spinal cord injury; stroke; other conditions. Any "yes" there refers the person to the ePARmed-X+ and/or a qualified exercise professional.
- **Delay becoming more active if:** you have a temporary illness; you are pregnant (see a health practitioner or complete the ePARmed-X+); or your health changes.
- **Validity:** clearance lasts a **maximum of 12 months** and becomes invalid if the person's condition changes.
- **Printed conditions:** photocopying is allowed, but **the entire questionnaire must be used and no changes are permitted**. The form includes a liability disclaimer.
- **Required citation:** Warburton, Jamnik, Bredin, Gledhill, on behalf of the PAR-Q+ Collaboration, *Health & Fitness Journal of Canada* 4(2):3–23, 2011.

### 1.2 PAR-Q+ licensing
Source: eparmedx.com Terms and Conditions page. **High** on what the terms say; **medium** on how they would be interpreted.
- The PAR-Q+ Collaboration owns the copyright.
- Free use covers participants and professionals doing screening, non-commercial research, and not-for-profits.
- **Commercial entities need the Collaboration's express written approval.** For-profit organisations need a commercial licence, or an application in progress, even to link to the site.
- The forms may not be changed in any way.
- **Implication:** we cannot paraphrase, shorten or gamify the PAR-Q+ and still call it the PAR-Q+, and we cannot embed it without a licence. The two options:
  - **(A) License it** and embed the full, unmodified form. This is the most defensible, but it costs 7+ questions of friction.
  - **(B) Self-written screen (recommended for v1).** Build it from the ACSM logic, do not call it the PAR-Q+, and do not link eparmedx.com unless licensed.

### 1.3 ACSM 2015 algorithm
Source: Riebe et al., MSSE 2015;47(11):2473–9. **High** for the three factors, which are in the abstract; **medium-high** for the branch details, which come from the paper's widely reproduced figure.
- **Factors:** current activity; signs or symptoms and/or known cardiovascular, metabolic or renal disease; desired intensity. Risk-factor profiling was removed.
- **"Regular exercise"** means at least 30 minutes of moderate activity on at least 3 days a week for at least 3 months.
- **Not regularly exercising:**
  - no disease and no symptoms → no clearance needed; start light-to-moderate;
  - known disease without symptoms, or any symptoms → medical clearance recommended.
- **Regularly exercising:**
  - no disease or symptoms → continue at moderate or vigorous intensity;
  - known disease without symptoms → continue moderate; get clearance before vigorous;
  - symptoms → stop and seek clearance.
- **Rationale in the abstract:** the old guidance produced excessive referrals; cardiac events are usually preceded by warning signs; and risk falls as fitness rises.

### 1.4 Recommended Me RPG screen (self-written, paraphrased)
One multi-select screen: "Does any of these apply right now?" **Low**; needs clinician review.
- **S1:** a doctor has told me I have a heart, blood-vessel, lung, kidney or metabolic condition.
- **S2:** recent chest pain or pressure, fainting, unusual breathlessness, or dizziness with exertion.
- **S3:** told to exercise only under supervision, or to limit activity.
- **S4:** currently unwell, or recovering from surgery or a recent injury.
- **S5:** pregnant or recently gave birth.
- **None of these.**

The activity-level answer (Q4) supplies the ACSM "currently active" factor. Age ≥45 combined with a low activity answer locks vigorous Trials, following the PAR-Q+ caveat.

| Condition | State | Allowed | Message |
|---|---|---|---|
| S2 | pause_and_refer | very light only; no Trials | see a clinician before increasing activity; stop and seek care if symptoms occur |
| S4 | rest_state | rest content; ask again in 3–7 days | wait until better |
| S1 or S3 | gentle_path | light-to-moderate (talk test: full sentences); no maximal Trials; aerobic tier capped at 2 | get clearance before vigorous; player can confirm clearance to unlock |
| S5 | prenatal_path | moderate, low-impact; no contact, fall-risk, prolonged lying on the back, or maximal efforts | talk to your prenatal provider (ACOG CO 804; Mottola 2018) |
| age ≥45 and PA-R ≤3 | vigorous_locked | moderate; vigorous Trials need an opt-in | PAR-Q+ caveat, paraphrased |
| None | standard | all, within the R3 progression limits | — |

**Handling a positive answer (medium confidence; not legal advice):**
- It is proportionate to recommend clearance, limit intensity and let the player confirm clearance. Both PAR-Q+ and ACSM take this approach.
- Do not refuse service. Both sources say inactivity is the bigger risk.
- Never diagnose.
- Store only derived flags and the screen date. Never store free text.
- Screen answers are likely regulated health data: consumer health data under Washington's My Health My Data Act, and special-category data under the GDPR. Get explicit consent, encrypt the data, and allow deletion.
- Re-screen every 12 months, or whenever the player's health changes.
- Include a persistent "I feel unwell" control that ends the quest and shows stop-and-seek-care text.

## 2. Shortest validated self-report and band mapping (Q2)
| Instrument | Items | Evidence | Licence | Fit |
|---|---|---|---|---|
| Milton single-item | 1 | test-retest r 0.72–0.82; r=0.53 against GPAQ; κ=0.63 for meeting guidelines (high) | not checked | answers "meets guidelines?" only |
| Exercise Vital Sign | 2 | face and discriminant validity in 1.79M Kaiser patients (Coleman 2012) (high) | published, widely reused | gives minutes per week |
| Stanford Brief Activity Survey | 2 | sensitivity 0.73 and specificity 0.61 for ≥150 min/week; test-retest r_s 0.62; tested mainly in people aged 60–69 (high) | **unconfirmed** | limited to older adults |
| Godin-Shephard LTPAQ | 3 | score = 9×strenuous + 5×moderate + 3×mild; ≥24 counts as active; r=0.35 with VO2max percentile in 1985 (high) | HFJC article is CC BY-NC-ND 4.0, so commercial use is **uncertain** | good for ranking people |
| IPAQ-SF | 7 | reliability about 0.8; criterion correlation about 0.30; overestimates by 36–173% (high) | **CC BY 4.0**: commercial use allowed with attribution (high) | too long; its VO2max equation (R²=0.43, n=80 students) is narrow |
| **NASA/JSC PA-R 0–7** | 1 | the activity term in Jackson 1990 (high) | origin unclear; paraphrase anyway | **best single item** |
| HUNT activity index (frequency × intensity × duration) | 3 | weights 0/0/1/2.5/5 × 1/2/3 × 0.1/0.38/0.75/1.0, per Nauman 2012 (medium) | — | only useful with the Nes waist model |

**PA-R levels (paraphrased; medium):**
- **0:** avoids walking or exertion.
- **1:** light activity only.
- **2:** 10–60 min/week of moderate recreation.
- **3:** more than 1 h/week of moderate recreation.
- **4:** vigorous activity under 30 min/week.
- **5:** vigorous 30–60 min/week.
- **6:** vigorous 1–3 h/week.
- **7:** vigorous more than 3 h/week.

**Recommendation:** ask the PA-R item plus a strength-days item (0/1/2/3+; the WHO guideline is 2 or more days a week).

**Mapping:** aerobic goes through §3 and then FRIEND percentiles by age and sex. Percentile bands: below 25 → tier 1, 25–50 → 2, 50–75 → 3, 75–90 → 4, 90 and above → 5. The other capacities use the rule tables in params.json. **Low.**

## 3. Non-exercise VO2max models (Q3)
Coefficients were verified against Peterman 2020 (JAHA, Table 1) and the original abstracts.

| Model | Inputs | Equation (mL·kg⁻¹·min⁻¹) | Fit | SEE | Conf. |
|---|---|---|---|---|---|
| Jackson 1990 (BMI) | age, sex (M=1), PA-R, BMI | 56.363 + 1.921·PA-R − 0.381·age − 0.754·BMI + 10.987·sex | R 0.78 | 5.6–5.7 | High |
| Jackson 1990 (%fat) | + %fat | 50.513 + 1.589·PA-R − 0.289·age − 0.552·%fat + 5.863·sex | R 0.81 | 5.3 | High |
| Wier 2006 (BMI) | PASS 0–10, BMI | 57.402 − 0.372·age + 8.596·sex + 1.396·PASS − 0.683·BMI | R 0.80 | 4.9 | High |
| Wier 2006 (waist) | waist | 59.416 − 0.327·age + 11.488·sex + 1.297·PASS − 0.266·WC | R 0.81 | 4.8–4.9 | High |
| Nes 2011, men | age, waist, resting HR, HUNT index | 100.27 − 0.296·age − 0.369·WC − 0.155·RHR + 0.226·PAI | R² 0.61 | 5.70 | High (index scoring medium) |
| Nes 2011, women | same | 74.736 − 0.247·age − 0.259·WC − 0.114·RHR + 0.198·PAI | R² 0.56 | 5.14 | High |
| Jurca 2005 | BMI, resting HR, 5-level activity | output in METs (multiply by 3.5) | R² 0.58–0.65 | about 5–7 | High |
| Uth HR ratio | age, resting HR | factor × (HRmax ÷ resting HR); factor = 15.3 (men), 14.5 (women) | — | 2.7 with measured HRmax, 4.7 with age-predicted (trained men, n=36) | High, narrow sample |
| Tanaka 2001 | age | HRmax = 208 − 0.7·age | r −0.90 | — | High |

Nes 2014 showed that the HUNT fitness estimate predicts mortality. The BMI variant's coefficients are **unverified** (they came only from a web-search summary).

**Without weight or BMI:**
- As published, none of these models works.
- **Workaround A (default; low confidence):** substitute the average BMI for the player's age band and sex, computed from FRIEND 2015 mean heights and weights.
  - men: 25.6, 25.8, 27.0, 27.8, 27.7, 27.2 (ages 20s → 70s);
  - women: 24.0, 26.1, 27.4, 28.8, 29.2, 28.5.

  The BMI spread within each band is about 5–6, which adds about 3.8–4.7 to the error. The total error is then about 6.9 (men) to 7.4 (women), roughly two FRIEND percentile bands. People with high BMI are overestimated, so the prescribed tier uses the estimate minus half its error.
- **Workaround B:** the Uth method, using resting HR from a wearable only. Wearable estimates based on resting data overestimate on average (+2.17, limits of agreement −13 to +17; Molina-Garcia 2022). Use an error of about 8 and never unlock vigorous content on this alone.
- A "body build" question is rejected as intrusive.
- If both estimates exist, combine them weighted by inverse variance.

**Inputs:**
- **Required:** age band, PA-R.
- **Optional:** sex (unknown → use 0.5 and average the norms); resting HR from a device; device VO2max.
- **Never collected:** BMI, weight, waist, %fat.

**Caveats:**
- Accuracy is worse below 30 and above 50 (Wier 2006).
- These equations detect the direction of change correctly only about 56% of the time (median of 27 equations; ICC 0.06–0.63; Peterman 2020). **Don't re-ask the questionnaire to track progress.**
- Jackson's sample was 90% male.
- The FRIEND 2022 update is 1.5–4.6 lower and more representative of the US population; consider switching to it.

## 4. Optional Trials (Q4)
General rules:
- All Trials are optional.
- All are locked in pause_and_refer. Maximal Trials are locked in gentle_path and prenatal_path, and need an opt-in if vigorous_locked applies.
- Each has a warm-up, "stop if…" text and a talk-test pre-check.

| Trial | Capacity | Scoring and norms | Weight? | Tier | Conf. |
|---|---|---|---|---|---|
| Cooper 12-min ("Messenger's Run") | aerobic | VO2max = (distance in m − 504.9) ÷ 44.73, then FRIEND percentile | No | maximal | Medium (equation from secondary sources) |
| 1-mile walk ("Pilgrim's Mile") | aerobic | Kline 1987: r 0.92–0.93, SEE 0.33–0.36 L/min; relative version 132.853 − 0.0769·wt(lb) − 0.3877·age + 6.315·sex − 3.2649·time(min) − 0.1565·HR; weight substituted from FRIEND means | substituted | moderate-vigorous | High / Medium |
| 6-min walk ("Watchtower Patrol") | functional aerobic | median 576 m (men) and 494 m (women), ages 40–80 (Enright 1998); full reference equations need height and weight, so use ratio-to-median bands plus the player's own change | No | moderate | High (medians) |
| Push-up ("Shield Wall") | upper-body endurance | CSEP/ACSM. Verified: men 20–29 good 22–28, excellent ≥36; women 20–29 (knees) good 15–20, excellent ≥30; men 30–39 good 17–21, excellent ≥30; women 30–39 good 13–19, excellent ≥27. Other ages unverified. More than 40 push-ups was associated with IRR 0.04 for CVD events in male firefighters (Yang 2019) | No | moderate-vigorous | Medium |
| 30-s chair stand ("Rise of the Squire") | lower-body strength | reliability ICC 0.84–0.92; r 0.71–0.78 with leg press (Jones 1999); normal ranges for ages 60+ unverified (Rikli & Jones) | No | moderate | High / Low |
| Sit-to-rise ("Kneel and Rise") | mobility and strength | 0–10 score; categories 0–3, 3.5–5.5, 6–7.5, 8–10; lowest vs highest category HR 5.44 for mortality (Brito 2014) | No | light-moderate; locked by lower-body, back, balance, aid and pregnancy chips | High |
| Sit-and-reach ("Archer's Reach") | flexibility | CSEP box (feet at 26 cm; home score = cm past toes + 26). Ages 20–29: men excellent ≥40, needs improvement ≤24; women excellent ≥41, needs improvement ≤27. Other ages unverified | No | light | Medium / Low |
| Wall-sit ("Gatekeeper's Stand") | lower-body endurance | no robust norms; scored against own best | No | moderate | Low |
| Talk test ("Bard's Breath") | intensity calibration | the point where speech becomes uncertain is about the ventilatory threshold (Persinger 2004) | No | any | High |

## 5. Inferring capacity from 4–12 weeks of imported workouts (Q5)

**Evidence:**
- **Consumer wearables** (INTERLIVE meta-analysis of 14 studies): exercise-based estimates had a bias of −0.09 with limits of agreement ±9.8; resting-based estimates had a bias of +2.17. **High.**
- **Apple Watch:** estimates from outdoor walks, runs and hikes on grades under 5%, using the user's profile age, sex, weight and height (Apple docs; medium-high).
  - Lambe 2025 (n=30): underestimated by 6.07; MAPE 13.3%.
  - Lambe 2026 (n=40, Series 10): underestimated by 6.25; MAE 6.79; only 14% placed in the correct FRIEND band.
  - Both high confidence.
- **Firstbeat:** fits heart rate against speed-derived VO2 and extrapolates. Error is about 5% when true HRmax is known and 7–9% when HRmax is off by 15 bpm (vendor white paper; medium).
- **Strava "Fitness":** an impulse-response model of Relative Effort or power-based training load. It measures training load, not VO2max (Strava support; high).

**Rules (low-medium confidence):**
1. **Eligibility.** At least 4 weeks and 6 sessions. Weight recent weeks more (28-day moving average). If there is a gap of more than 14 days, apply the R1 detraining decay.
2. **Aerobic, in priority order:**
   - (a) device VO2max: median of the latest 3, error about 7 (possibly add +3 for Apple, under review);
   - (b) pace-to-HR regression:
     - use steady segments of at least 5 minutes on flat ground (grade under 2%);
     - convert speed to VO2 with the ACSM metabolic equations, which need no weight (walking: 0.1v + 1.8v·grade + 3.5; running: 0.2v + 0.9v·grade + 3.5; v in m/min);
     - fit VO2 against HR and extrapolate to the higher of Tanaka's prediction or the highest observed HR;
     - require at least 3 segments, a spread of at least 15% of heart-rate reserve, and r ≥ 0.7; error about 6;
   - (c) best efforts: best 12-minute distance → Cooper; best run of 3 km or more → race-pace estimate (Daniels; medium); error about 5;
   - (d) otherwise the questionnaire estimate.
3. **Endurance tiers** from chronic weekly moderate-to-vigorous minutes: under 60 → 1; 60–149 → 2; 150–299 → 3; 300–449 → 4; 450+ → 5. The WHO 150/300 anchors are high confidence; the cut-offs are design. First long quest is capped at 1.1–1.25 × the longest session in the last 28 days.
4. **Strength tiers** from sessions per week: under 0.25 → 1; under 1 → 2; 1–2 → 3; 2 or more sustained for 8+ weeks → 4. Tier 5 needs a Trial. Track a self-relative estimated one-rep-max trend using Epley's formula; don't compute relative strength, which needs body mass.
5. **Mobility:** add +0.5 tier if the player logs 2 or more yoga/mobility sessions a week; otherwise rely on the onboarding answers and Trials.
6. **Progression guard (see R3).** Week-1 volume stays at or below about 110% of chronic volume.
   - Nielsen 2014: novice runners increasing weekly distance by more than 30% had more distance-related injuries (HR 1.59, borderline).
   - Buist 2008: a plan built on the 10% rule did not reduce injuries.
   - Impellizzeri 2020: the acute:chronic workload ratio has no causal support.
7. **Confidence label** shown to the player: rough, solid or sharp.

## 6. Goals and limitations (Q6)
**Limitation chips** (multi-select; stored as tags only; editable at any time):
- **upper body** → no push-up or overhead quests;
- **lower body** → low-impact and chair-supported; no wall-sit, sit-to-rise or Cooper Trial;
- **back or core** → no loaded bending; no sit-to-rise or sit-and-reach Trial;
- **prefer low-impact;**
- **pregnant or postpartum** → prenatal_path (ACOG CO 804; Mottola 2018; medium);
- **mobility aid** → seated and supported quests;
- **wheelchair** → seated and upper-body aerobic quests; step goals converted to push or time goals;
- **balance concern** → supported variants;
- **none.**

**Goals (up to 2):** stamina, strength, mobility, steady habit, energy and stress, training for an event (optional date). No weight-loss framing.

## 7. Recommended onboarding flow & initial-capacity algorithm

### 7.1 Flow (8 screens, about 90 seconds)
| # | id | Type | Feeds |
|---|---|---|---|
| 1 | safety | multi S1–S5 + none | safety state, Trial locks |
| 2 | age_band | 18–29 … 70+ (under 18 goes to a separate guardian flow) | model, norms, 45+ gate |
| 3 | sex_for_norms | female / male / prefer not to say | model sex term, norms |
| 4 | activity_level | PA-R 0–7 | aerobic model, "currently active" flag, endurance |
| 5 | strength_days | 0 / 1 / 2 / 3+ | strength |
| 6 | functional_check | walk 30 min; climb 2 flights; get up from the floor without hands; touch toes; hold a plank for 30 s; none | endurance, strength, mobility |
| 7 | limitations | chips (§6) | content filters |
| 8 | goals | pick up to 2 | quest mix |
| opt | import | Apple Health / Health Connect / Strava / Garmin | §5 overrides; resting HR |
| opt | trials | week-1 side quests | §4 overrides |

### 7.2 Algorithm
```
state = safety_rule(...)
age = band midpoint; sex = {M:1, F:0, unknown:0.5}; bmi = FRIEND_mean_BMI[sex][band]
est = 56.363 + 1.921*PA_R - 0.381*age - 0.754*bmi + 10.987*sex; se = 7.0/7.4/7.2
if device resting HR: est_u = PF[sex]*(208-0.7*age)/RHR, se_u = 8 -> combine by inverse variance
if device VO2max / history / Trial has a smaller SE: replace
clamp 12..70; display tier = band(FRIEND_pct(est)); prescribed tier = band(FRIEND_pct(est - 0.5*se))
gentle/prenatal: prescribed <= 2; pause_and_refer: 1; rest_state: rest quests only
strength / endurance / mobility tiers from the params.json rule tables; history overrides; limitation filters
after 2 weeks: >=3 of the last 5 quests "too hard" -> -1 tier; >=4 of 5 "too easy" -> +1 tier (capped by the safety state)
```
**Worked examples:**
- Man, 30–39, PA-R 3 → estimate 40.3 → about the 40th percentile → tier 2.
- Woman, 30–39, PA-R 3 → estimate 29.1 → about the 45th percentile → tier 2.

**Confidence: low overall.** A calibration study is needed, comparing onboarding estimates with Trial results and wearable VO2max.

### 7.3 Why this is low-intrusion
- No weight, height, waist, body fat or location.
- Age is a band; sex is optional and used only for norms.
- No diagnoses and no free text; screen answers become flags.
- Resting HR and VO2max come only from device linking the player chooses.

## 8. Open issues
1. Decide between licensing the PAR-Q+ and the self-written screen; get clinician sign-off on the text and the state rules.
2. Confirm licences for the Stanford Brief Activity Survey, the Godin questionnaire and the PA-R wording.
3. Obtain primary CSEP and Senior Fitness Test norm tables to replace the unverified values.
4. Verify Nes 2011's activity-index scoring and the BMI-variant coefficients (not needed for v1).
5. Consider switching to FRIEND 2022.
6. Validate the Uth method in untrained adults.
7. Cross-check against R1, R3, R4 and R8.

## 9. References
1. PAR-Q+ Collaboration. PAR-Q+ 2025 (form dated 01-11-2024). https://eparmedx.com/wp-content/uploads/2025/01/PARQPlus2025Fillable.pdf
2. PAR-Q+ Collaboration. Terms and Conditions. https://eparmedx.com/?page_id=746
3. Warburton DER, Jamnik VK, Bredin SSD, Gledhill N. PAR-Q+ and ePARmed-X+. Health Fitness J Can. 2011;4(2):3–23.
4. Warburton DE, et al. Evidence-based risk assessment… Consensus Document 2011. Appl Physiol Nutr Metab. 2011;36(S1):S266–98. doi:10.1139/h11-062
5. Jamnik VK, et al. Enhancing the effectiveness of clearance for physical activity participation. Appl Physiol Nutr Metab. 2011;36(S1):S3–13. doi:10.1139/h11-044
6. Riebe D, et al. Updating ACSM's recommendations for exercise preparticipation health screening. Med Sci Sports Exerc. 2015;47(11):2473–9. doi:10.1249/MSS.0000000000000664
7. Jackson AS, et al. Prediction of functional aerobic capacity without exercise testing. Med Sci Sports Exerc. 1990;22(6):863–70. doi:10.1249/00005768-199012000-00021
8. Wier LT, et al. Nonexercise models for estimating VO2max with waist girth, percent fat, or BMI. Med Sci Sports Exerc. 2006;38(3):555–61.
9. Nes BM, et al. Estimating VO2peak from a nonexercise prediction model: the HUNT Study. Med Sci Sports Exerc. 2011;43(11):2024–30. doi:10.1249/MSS.0b013e31821d3f6f
10. Nes BM, et al. A simple nonexercise model of CRF predicts long-term mortality. Med Sci Sports Exerc. 2014;46(6):1159–65.
11. Nauman J, et al. Resting heart rate and peak oxygen uptake (HUNT). PLoS ONE. 2012;7(9):e45021.
12. Peterman JE, et al. Accuracy of nonexercise prediction equations… BALL ST cohort. J Am Heart Assoc. 2020;9:e015117. doi:10.1161/JAHA.119.015117 (PMC7428991)
13. Uth N, et al. Estimation of VO2max from the ratio between HRmax and HRrest. Eur J Appl Physiol. 2004;91(1):111–5.
14. Uth N. Gender difference in the proportionality factor… Int J Sports Med. 2005;26(9):763–7.
15. Tanaka H, Monahan KD, Seals DR. Age-predicted maximal heart rate revisited. J Am Coll Cardiol. 2001;37(1):153–6.
16. Kaminsky LA, Arena R, Myers J. Reference standards for CRF… FRIEND. Mayo Clin Proc. 2015;90(11):1515–23. (PMC4919021)
17. Kaminsky LA, et al. Updated reference standards for CRF (FRIEND). Mayo Clin Proc. 2022;97(2):285–93.
18. Schembre SM, Riebe DA. Non-exercise estimation of VO2max using the IPAQ. Meas Phys Educ Exerc Sci. 2011;15(3):168–81.
19. Craig CL, et al. IPAQ: 12-country reliability and validity. Med Sci Sports Exerc. 2003;35(8):1381–95.
20. Lee PH, et al. Validity of the IPAQ-SF: a systematic review. Int J Behav Nutr Phys Act. 2011;8:115.
21. IPAQ FAQ / licence (CC BY 4.0). https://sites.google.com/view/ipaq/faq
22. Godin G, Shephard RJ. A simple method to assess exercise behavior in the community. Can J Appl Sport Sci. 1985;10(3):141–6.
23. Godin G. The Godin-Shephard LTPAQ. Health Fitness J Can. 2011;4(1):18–22. doi:10.14288/hfjc.v4i1.82
24. Amireault S, Godin G. Godin-Shephard LTPAQ classification validity. Percept Mot Skills. 2015. PMID 25799030.
25. Taylor-Piliae RE, et al. Validation of a new brief physical activity survey… Am J Epidemiol. 2006;164(6):598–606.
26. Taylor-Piliae RE, et al. Validation of the Stanford Brief Activity Survey. J Phys Act Health. 2010;7(1):87–94.
27. Milton K, Bull FC, Bauman A. Single-item physical activity measure. Br J Sports Med. 2011;45(3):203–8.
28. Coleman KJ, et al. Initial validation of an exercise "vital sign". Med Sci Sports Exerc. 2012;44(11):2071–6.
29. Cooper KH. A means of assessing maximal oxygen intake. JAMA. 1968;203(3):201–4.
30. Kline GM, et al. Estimation of VO2max from a one-mile track walk… Med Sci Sports Exerc. 1987;19(3):253–9.
31. Enright PL, Sherrill DL. Reference equations for the six-minute walk. Am J Respir Crit Care Med. 1998;158(5):1384–7.
32. Yang J, et al. Push-up capacity and future CVD events. JAMA Netw Open. 2019;2(2):e188341.
33. Jones CJ, Rikli RE, Beam WC. 30-s chair-stand test. Res Q Exerc Sport. 1999;70(2):113–9.
34. Rikli RE, Jones CJ. Criterion-referenced fitness standards… Gerontologist. 2013;53(2):255–67.
35. Brito LB, et al. Sit and rise from the floor… all-cause mortality. Eur J Prev Cardiol. 2014;21(7):892–8.
36. Persinger R, et al. Consistency of the talk test. Med Sci Sports Exerc. 2004;36(9):1632–6.
37. CSEP. CSEP-PATH Resource Manual (norms; not retrieved directly).
38. Molina-Garcia P, et al. VO2max by consumer wearables: meta-analysis (INTERLIVE). Sports Med. 2022;52(7):1577–97.
39. Lambe R, et al. Accuracy of Apple Watch VO2 max. PLoS ONE. 2025;20(5):e0323741.
40. Lambe R, et al. Apple Watch Series 10 VO2 max. Mayo Clin Proc Digit Health. 2026;4(2):100357.
41. Apple Support: Track your cardio fitness levels. https://support.apple.com/en-us/108790 ; Apple white paper (May 2021).
42. Firstbeat. Automated Fitness Level (VO2max) Estimation… (white paper, 2017).
43. Strava Support: How Fitness & Freshness is calculated. https://support.strava.com/hc/en-us/articles/216918477-Fitness-Freshness
44. Foster C, et al. A new approach to monitoring exercise training. J Strength Cond Res. 2001;15(1):109–15.
45. Nielsen RØ, et al. Excessive progression in weekly running distance… J Orthop Sports Phys Ther. 2014;44(10):739–47.
46. Buist I, et al. No effect of a graded training program… Am J Sports Med. 2008;36(1):33–9.
47. Impellizzeri FM, et al. ACWR: conceptual issues and fundamental pitfalls. Int J Sports Physiol Perform. 2020;15(6):907–13.
48. Gabbett TJ. The training-injury prevention paradox. Br J Sports Med. 2016;50(5):273–80.
49. Bull FC, et al. WHO 2020 guidelines on physical activity. Br J Sports Med. 2020;54(24):1451–62 (not re-retrieved).
50. ACOG Committee Opinion 804. Obstet Gynecol. 2020;135(4):e178–88 (not re-retrieved).
51. Mottola MF, et al. 2019 Canadian guideline for physical activity throughout pregnancy. Br J Sports Med. 2018;52(21):1339–46 (not re-retrieved).
52. ACSM's Guidelines for Exercise Testing and Prescription, 11th ed., 2021 (not retrieved).
53. Topend Sports. Non-exercise fitness test. https://www.topendsports.com/testing/tests/non-exercise.htm (secondary; PA-R wording only).
