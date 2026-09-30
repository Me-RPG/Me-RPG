# R4: Activity Normalization for the Me RPG Load Engine
Status: 0.1.0-unreviewed. Research compiled 2026-09-28. Companion file: params.json (same folder).

Confidence scale:
- **High:** taken directly from a primary or authoritative source.
- **Medium:** well established, but with known error bands or read from secondary summaries.
- **Low:** a Me RPG design choice or expert judgment with no direct published validation.

## 1. MET values (2024 Adult Compendium). Confidence: High
Source: Herrmann SD, Willis EA, Ainsworth BE, et al. J Sport Health Sci 2024;13(1):6-12, doi:10.1016/j.jshs.2023.10.010. Covers adults aged 19–59; 1 MET = 3.5 ml/kg/min. The update extracted 2,356 values from 701 papers, added 303 activities and revised 176.

**Walking and hiking (17)**
- Level walking:
  - 17152: 2.8 (2.0–2.4 mph)
  - 17170: 3.0 (2.5 mph)
  - 17190: 3.8 (2.8–3.4 mph)
  - 17200: 4.8 (3.5–3.9 mph)
  - 17220: 5.5 (4.0–4.4 mph)
  - 17230: 7.0 (4.5–4.9 mph)
  - 17231: 8.5 (5.0–5.5 mph)
- Race walking 17110: 6.5. Nordic walking 17302/17304/17305: 4.3/5.3/8.5.
- Hiking:
  - 17081 slow, no load: 3.8
  - 17082 normal pace, varied terrain: 5.3
  - 17080 cross-country: 6.0
  - 17010 backpacking: 7.0
  - 17012 daypack: 7.8
- Climbing hills with no load:
  - 17034 (1–5% grade): 5.3
  - 17035 (6–10%): 7.0
  - 17036 (11–20%): 8.8
  - 17039 (30–40%): 15.5
- Climbing hills with a load:
  - 17045 (10–20 lb, 5–10%): 6.5
  - 17050 (21–40 lb): 7.5
  - 17060 (20+ lb, 5–20%): 10.0
- Stairs 17133/17131/17134: 4.5/6.8/9.3.

**Running (12)**
- 12028: 6.5 (4 mph)
- 12030: 8.5 (5 mph)
- 12050: 9.3 (6 mph)
- 12060: 10.5 (6.7 mph)
- 12070: 11.0 (7 mph)
- 12080: 11.8 (7.5 mph)
- 12090: 12.0 (8 mph)
- 12100: 12.5 (8.6 mph)
- 12110: 13.0 (9 mph)
- 12120: 14.8 (10 mph)
- 12132: 18.5 (12 mph)
- 12135: 23.0 (14 mph)
- Other entries: jogging 12020: 7.5; self-selected 12145: 10.5; cross-country 12140: 9.3; uphill 5% 12255/12260: 10.3/13.3; stairs 12170: 15.0.

**Cycling (01)**
- By speed:
  - 01010 (<10 mph): 4.0
  - 01020 (10–11.9 mph): 6.8
  - 01030 (12–13.9 mph): 8.0
  - 01040 (14–15.9 mph): 10.0
  - 01050 (16–19 mph): 12.0
  - 01060 (>20 mph): 16.8
- General 01014: 7.0. Mountain 01009/01003 (uphill): 8.5/14.0.
- Stationary: 01200 general 6.8; 01210–01232 by power, 3.5–10.3; spin class 01270: 9.0.
- E-bike 01088/01084/01080: 4.0/6.0/6.8.

**Water and rowing (18, 02)**
- Swimming:
  - Freestyle 18240 slow/18290 medium/18230 fast: 5.8/8.0/9.8
  - Backstroke 18250: 9.5; breaststroke 18260: 10.3; butterfly 18270: 13.8
  - Leisurely 18310: 6.0; open water 18285: 10.5
- Rowing ergometer 02071/02070/02072/02073/02074: 5.0/7.3/7.5/11.0/14.0. Crew competition 18080: 12.0.
- Kayak 18100: 5.0. SUP 18224: 6.5. Canoe/kayak competition 18060: 12.5.

**Conditioning (02)**
- Resistance: 02054 (8–15 reps): 3.5; 02052 (squat/deadlift): 5.0; 02050 (vigorous/powerlifting): 6.0; 02055 (circuit supersets): 5.8.
- Calisthenics 02024/02022/02020: 2.8/3.8/7.5. Body-weight 02056/02057: 3.0/6.5.
- Circuit 02034/02035/02040: 3.5/5.0/7.5; 02032: 6.0. Kettlebell swings 02058: 9.8.
- HIIT 02210/02214: 7.0/11.0.
- Elliptical 02048/02049: 5.0/9.0. Stair treadmill 02065: 9.3. Aerobics 02000: 7.3.
- Yoga: hatha 02150: 2.3; vinyasa 02185: 2.7; power 02160: 4.0; hatha high intensity 02153: 8.0 (outlier).
- Pilates 02103/02105: 1.8/2.8. Stretching 02101: 2.3. Tai chi 15670: 3.3.
- There is no CrossFit entry; map it to 02040.

**Sports (15)**
- Soccer 15610/15605: 7.0/9.5; walking football 15615: 3.5.
- Basketball 15055/15040/15070/15072: 7.5/8.0/5.0/9.3.
- Tennis 15675/15690/15680/15685: 6.8/8.0/6.0/4.5.
- Climbing: 15533: 8.0; 15537: 5.8; 15535: 7.3; bouldering 15534: 8.8; speed climbing 15536: 10.5.
- Martial arts 15430: 10.3. Boxing 15100/15120/15110: 12.3/7.8/5.8.
- Squash 15650: 12.0. Racquetball 15530: 7.0. Badminton 15030: 5.5. Table tennis 15660: 4.0.
- Volleyball 15710/15711: 4.0/6.0.
- Football 15210, hockey 15360, lacrosse 15460: 8.0; rugby 15560: 8.3.
- Softball 15620: 5.0. Golf 15255: 4.5.
- No pickleball or padel entry was found (medium confidence).

**Winter and dance**
- Downhill ski/snowboard 19150/19160/19170: 4.3/6.3/8.0 (active time only).
- Cross-country ski 19090/19100: 8.5/11.3; skate ski 19135: 13.3. Snowshoe 19190/19192: 5.3/10.0. Ice skating 19030: 7.0.
- Dance 03040/03010/03029: 3.0/5.0/7.3.

Caveat (High): these are standardized population values, not individual measurements. Use the Wheelchair and Older Adult Compendiums (2024, medium confidence) for those populations.

## 2. Grade and elevation
**ACSM metabolic equations (High)**
- Walking: VO2 = 0.1S + 1.8·S·G + 3.5 (S in m/min, G as a fraction; valid about 1.9–3.7 mph).
- Running: VO2 = 0.2S + 0.9·S·G + 3.5.
- Leg cycling: VO2 = 1.8·(W·6.12)/kg + 7.

**Using elevation gain alone (Medium)**
- S·G is vertical velocity, so integrating the vertical term over a session gives 1.8 ml/kg per metre climbed walking, and 0.9 ml/kg per metre running.
- Divided by 3.5, that is +0.514 MET-min/m walking and +0.257 running.
- Formula: MET_eff = MET_level + k·gain_m/D_min.
- Naismith check (Low): 600 m × 0.514 ≈ 308 MET-min, roughly 1 h at 5.3 MET.

**Limits**
- Minetti 2002 (J Appl Physiol 93:1039) measured walking cost at 1.64 J/kg/m on the level, 17.3 at +45% and 0.81 at −10%. It is nonlinear above about 15%; above that, efficiency approaches concentric muscle work.
- Descent is ignored.
- Treat gain under 10 m/km as GPS noise (Low).

**Pandolf 1977 (J Appl Physiol 43:577) (High formula, Medium accuracy)**
- M = 1.5W + 2.0(W+L)(L/W)² + η(W+L)(1.5V² + 0.35VG).
- η: 1.0 paved, 1.1 dirt road, 1.2 light brush, 1.5 heavy brush, 1.8 swamp, 2.1 sand.
- Under-predicts at heavy loads by about 12–33%.
- Use it only as the ratio M(W,L)/M(W,0) when pack mass is known.

## 3. TRIMP (High)
- **Banister (1991; Morton 1990):** D·ΔHR·a·e^(b·ΔHR), with ΔHR = (HRex−HRrest)/(HRmax−HRrest). Men a = 0.64, b = 1.92; women a = 0.86, b = 1.67. Needs duration, HR, HRrest, HRmax and sex.
- **Edwards (1993):** sum of minutes in each %HRmax zone × weight: 50–60 ×1, 60–70 ×2, 70–80 ×3, 80–90 ×4, 90–100 ×5.
- **Lucia (2003, MSSE 35:872):** minutes below VT1 ×1, VT1–VT2 ×2, above VT2 ×3. Needs lab thresholds.
- Average HR under-counts intervals because e^x is convex, so integrate per sample when HR samples exist.
- Defaults: HRmax = 208 − 0.7·age (Tanaka 2001, JACC 37:153), HRrest = 65 (Low).

## 4. Session-RPE
**Method (High):** sRPE = CR-10 × minutes (Foster 2001, JSCR 15:109). Foster's modified CR-10 scale: 0 rest, 3 moderate, 5 hard, 7 very hard, 10 maximal. Collect about 30 minutes after the session.

**Validity (High, Haddad 2017, Front Neurosci 11:612):**
- Against Banister: r = .52–.95
- Against Edwards: r = .57–.97
- Against Lucia: r = .59–.94
- Resistance training: about .25–.34; plyometric: about .31

The low resistance-training values reflect HR missing that load, not a failure of sRPE.

**Mapping to TRIMP (Low–Medium, my design):** there is no published conversion. I use x = min(1, 0.2 + 0.1·CR10), anchored to ACSM (Garber 2011, MSSE 43:1334):
- Moderate: 40–59% HRR ≈ Borg 12–13 ≈ CR10 3–4, giving x = .5–.6
- Vigorous: 60–89% HRR ≈ Borg 14–17 ≈ CR10 5–7, giving x = .7–.9

Store raw sRPE alongside TL.

## 5. Fallback with only type and duration
- Relative intensity: x = (MET_mid − 1)/(MET_max − 1), using %VO2R ≈ %HRR (Swain & Leutholtz 1997, MSSE 29:410).
- MET_max defaults to 10 (VO2max ≈ 35; Low). Personalize from HealthKit vo2Max or Health Connect Vo2MaxRecord.
- Then apply the Banister curve.
- Examples: 60 min hike ≈ 46 TL; 60 min run at 9.3 MET ≈ 208 TL.
- Exception: rpe_default types (resistance, calisthenics, circuit, HIIT, climbing, pilates, yoga, stretching, tai chi) use a default CR-10 value, because MET under-rates them. A 60-minute lift at RPE 5 ≈ 103 TL, versus about 40 TL via MET.
- Tag these estimates low confidence and prompt the user for a one-tap RPE.
- Game-design option: fix MET_max at 10 for everyone if rewards should be absolute rather than relative to fitness.

## 6. Capacity split (Low; expert judgment framed on the ACSM fitness domains)
Principles:
- Aerobic share follows sustained whole-body oxidative demand.
- Strength is credited only for high relative loads.
- Endurance covers repeated submaximal local contractions.
- Mobility covers large-range or flexibility work.

Splits (aerobic/strength/endurance/mobility):
- walk: .85/0/.10/.05
- hike: .70/.05/.20/.05
- hike_loaded: .55/.15/.25/.05
- stair_climb: .60/.10/.30/0
- run: .85/0/.15/0
- trail_run: .70/.05/.20/.05
- cycle_road: .80/0/.20/0
- cycle_mountain: .65/.05/.25/.05
- swim: .75/.05/.15/.05
- rowing: .65/.10/.25/0
- paddle: .60/.05/.30/.05
- resistance_training: .10/.70/.15/.05
- calisthenics: .15/.40/.40/.05
- circuit_training: .40/.25/.30/.05
- hiit: .55/.15/.30/0
- yoga: .05/.10/.20/.65
- pilates: .05/.15/.35/.45
- stretching_mobility: 0/0/0/1
- tai_chi: .10/.05/.15/.70
- dance: .60/0/.20/.20
- team_field_sport: .60/.15/.20/.05
- combat_sport: .50/.20/.20/.10
- climbing: .20/.35/.35/.10
- alpine_ski_snowboard: .40/.15/.40/.05
- nordic_ski: .80/0/.20/0
- other_workout: .50/.20/.20/.10
- The remaining types are in params.json.

Modifiers (renormalize to 1.0 afterwards):
- Grade: move min(.15, 1.5·gain/distance) from aerobic to endurance.
- Pack mass: move min(.10, .5·L/W) to strength.
- Resistance RPE: RPE 8+ shifts toward strength; RPE 4 or below shifts toward endurance.
- Sessions over 90 min shift strength toward endurance.

## 7. Provider types (High; mapping choices Medium)
**Strava** sport_type (56 values, from developers.strava.com/swagger/sport_type.json): AlpineSki, BackcountrySki, Badminton, Basketball, Canoeing, Cricket, Crossfit, Dance, EBikeRide, Elliptical, EMountainBikeRide, Golf, GravelRide, Handcycle, HighIntensityIntervalTraining, Hike, IceSkate, InlineSkate, Kayaking, Kitesurf, MountainBikeRide, NordicSki, Padel, PhysicalTherapy, Pickleball, Pilates, Racquetball, Ride, RockClimbing, RollerSki, Rowing, Run, Sail, Skateboard, Snowboard, Snowshoe, Soccer, Squash, StairStepper, StandUpPaddling, Surfing, Swim, TableTennis, Tennis, TrailRun, Velomobile, VirtualRide, VirtualRow, VirtualRun, Volleyball, Walk, WeightTraining, Wheelchair, Windsurf, Workout, Yoga.
- The legacy `type` field is a 37-value subset.
- Useful fields: distance, moving_time, elapsed_time, total_elevation_gain, average_heartrate, max_heartrate, has_heartrate, average_watts, weighted_average_watts, kilojoules.
- Avoid suffer_score (proprietary).

**HealthKit** HKWorkoutActivityType: americanFootball, archery, australianFootball, badminton, barre, baseball, basketball, bowling, boxing, cardioDance, climbing, cooldown, coreTraining, cricket, crossCountrySkiing, crossTraining, curling, cycling, dance, danceInspiredTraining, discSports, downhillSkiing, elliptical, equestrianSports, fencing, fishing, fitnessGaming, flexibility, functionalStrengthTraining, golf, gymnastics, handCycling, handball, highIntensityIntervalTraining, hiking, hockey, hunting, jumpRope, kickboxing, lacrosse, martialArts, mindAndBody, mixedCardio, mixedMetabolicCardioTraining, other, paddleSports, pickleball, pilates, play, preparationAndRecovery, racquetball, rowing, rugby, running, sailing, skatingSports, snowSports, snowboarding, soccer, socialDance, softball, squash, stairClimbing, stairs, stepTraining, surfingSports, swimBikeRun, swimming, tableTennis, taiChi, tennis, trackAndField, traditionalStrengthTraining, transition, underwaterDiving, volleyball, walking, waterFitness, waterPolo, waterSports, wheelchairRunPace, wheelchairWalkPace, wrestling, yoga.
- Some cases are deprecated (dance, danceInspiredTraining, mixedMetabolicCardioTraining; medium confidence) but still appear in older data.
- Use HKMetadataKeyIndoorWorkout to route indoor cycling to stationary.
- Split swimBikeRun into its activity segments.

**Health Connect** EXERCISE_TYPE_* (from androidx source): 0 OTHER_WORKOUT, 2 BADMINTON, 4 BASEBALL, 5 BASKETBALL, 8 BIKING, 9 BIKING_STATIONARY, 10 BOOT_CAMP, 11 BOXING, 13 CALISTHENICS, 14 CRICKET, 16 DANCING, 25 ELLIPTICAL, 26 EXERCISE_CLASS, 27 FENCING, 28 FOOTBALL_AMERICAN, 29 FOOTBALL_AUSTRALIAN, 31 FRISBEE_DISC, 32 GOLF, 33 GUIDED_BREATHING, 34 GYMNASTICS, 35 HANDBALL, 36 HIIT, 37 HIKING, 38 ICE_HOCKEY, 39 ICE_SKATING, 44 MARTIAL_ARTS, 46 PADDLING, 47 PARAGLIDING, 48 PILATES, 50 RACQUETBALL, 51 ROCK_CLIMBING, 52 ROLLER_HOCKEY, 53 ROWING, 54 ROWING_MACHINE, 55 RUGBY, 56 RUNNING, 57 RUNNING_TREADMILL, 58 SAILING, 59 SCUBA_DIVING, 60 SKATING, 61 SKIING, 62 SNOWBOARDING, 63 SNOWSHOEING, 64 SOCCER, 65 SOFTBALL, 66 SQUASH, 68 STAIR_CLIMBING, 69 STAIR_CLIMBING_MACHINE, 70 STRENGTH_TRAINING, 71 STRETCHING, 72 SURFING, 73 SWIMMING_OPEN_WATER, 74 SWIMMING_POOL, 75 TABLE_TENNIS, 76 TENNIS, 78 VOLLEYBALL, 79 WALKING, 80 WATER_POLO, 81 WEIGHTLIFTING, 82 WHEELCHAIR, 83 YOGA.
- Treat unknown integers as other_workout.

The full mappings for all three providers are in params.json.

## Recommended normalization pipeline
1. **Canonicalize.** Map provider type to canonical id via provider_type_map, applying the indoor flag and intensity hints. Excluded types get TL = 0 but are still logged.
2. **Duration.** Use moving_time, else active duration, else elapsed time. Clamp to 3–360 min.
3. **Intensity x**, first available wins:
   1. Per-sample HR (if hr_valid and coverage is at least 50%)
   2. Average HR
   3. User RPE
   4. Power tables or the ACSM cycling equation
   5. Speed lookup plus grade term: k = .514 walk, .257 run, .25 cycle (low confidence for cycle)
   6. Type default (default_rpe_cr10 or met.mid)
4. **Pack load.** Multiply by the Pandolf ratio if pack mass is known.
5. **Compute load.** TL = D·x·a·e^(bx). Also store sRPE, the intensity source and a confidence tag.
6. **Split.** Apply capacity_split plus modifiers, renormalize, and multiply by TL.
7. **Guardrails.** Cap TL at 600 per session and count at most 6 sessions per day. Flag implausible speeds. De-duplicate sessions that overlap across providers, keeping the one with the richest data.
8. **Calibrate.** Log TL, sRPE, HR availability and type so the RPE mapping, MET_max and splits can be fitted to real data before 1.0.

## References
1. Herrmann SD et al. 2024 Adult Compendium of Physical Activities. J Sport Health Sci 2024;13(1):6-12. doi:10.1016/j.jshs.2023.10.010. https://pubmed.ncbi.nlm.nih.gov/38242596/ ; https://pacompendium.com/adult-compendium/ (accessed 2026-09-28)
2. Banister EW. Modeling elite athletic performance. In: Physiological Testing of the High-Performance Athlete, 2nd ed. Human Kinetics 1991:403-424.
3. Morton RH, Fitz-Clarke JR, Banister EW. J Appl Physiol 1990;69:1171-1177.
4. Edwards S. The Heart Rate Monitor Book. Fleet Feet Press 1993.
5. Lucia A et al. Med Sci Sports Exerc 2003;35:872-878.
6. Foster C et al. A new approach to monitoring exercise training. J Strength Cond Res 2001;15:109-115. https://pubmed.ncbi.nlm.nih.gov/11708692/
7. Haddad M et al. Session-RPE method for training load monitoring. Front Neurosci 2017;11:612.
8. ACSM's Guidelines for Exercise Testing and Prescription, metabolic equations. https://www.depts.ttu.edu/ksm/_documents/grad/acsm_comps/6c-23-2013_HFI_Metabolic_Calculations.pdf
9. Garber CE et al. ACSM position stand. Med Sci Sports Exerc 2011;43:1334-1359.
10. Swain DP, Leutholtz BC. Med Sci Sports Exerc 1997;29:410-414.
11. Tanaka H, Monahan KD, Seals DR. J Am Coll Cardiol 2001;37:153-156.
12. Pandolf KB, Givoni B, Goldman RF. J Appl Physiol 1977;43:577-581. https://en.wikipedia.org/wiki/Pandolf_equation
13. Minetti AE et al. J Appl Physiol 2002;93:1039-1046. https://pubmed.ncbi.nlm.nih.gov/12183501/
14. Strava API reference. https://developers.strava.com/docs/reference/ ; https://developers.strava.com/swagger/sport_type.json ; https://developers.strava.com/swagger/activity_type.json
15. Apple HKWorkoutActivityType. https://developer.apple.com/documentation/healthkit/hkworkoutactivitytype
16. Health Connect ExerciseSessionRecord. https://developer.android.com/reference/kotlin/androidx/health/connect/client/records/ExerciseSessionRecord (androidx-main source)
