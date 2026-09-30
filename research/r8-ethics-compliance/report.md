# R8: Ethical Gamification and Compliance (HealthRPG)

**Status:** 0.1.0-unreviewed research draft. Compiled 2026-09-28.

> **NOT LEGAL ADVICE.** This is a product-research summary prepared from public sources to help frame questions for qualified counsel. It is not legal, regulatory, or medical advice. Laws, platform policies, and guidance change often. A licensed attorney (US privacy/FTC and EU data-protection counsel) and, for any health-adjacent claims, a regulatory specialist must review everything here before launch.

**Confidence scale used per claim:**
- **High:** verified against primary text (statute, regulator page, platform policy) or a peer-reviewed primary source during this research.
- **Medium:** from reputable secondary sources (law-firm alerts, reviews) or a primary source only partly read. The substance is likely right, but details need checking.
- **Low:** inference, extrapolation, or thin sourcing. Treat as a hypothesis.

Citations are numbered [n] and listed at the end with URLs.

## 0. Executive summary
1. Gamification increases physical activity by a small-to-moderate amount, and the effect shrinks after the intervention ends. The best-documented harms are broken-streak demotivation, reduced enjoyment from quantification, punishment backlash, and associations between tracking (especially calorie tracking) and disordered eating and compulsive exercise. Most of the harm evidence is cross-sectional.
2. HealthRPG can stay a general wellness product (FDA) and non-medical software (EU MDR) if its intended purpose, marketing, and in-app copy stay on fitness and a healthy lifestyle, never name diseases, and avoid diagnostic thresholds or treatment framing.
3. The biggest legal exposure is privacy, not device regulation. Workout data is health data under GDPR Art. 9 when it is used to assess fitness, and it is almost certainly "consumer health data" under Washington's MHMDA, which carries a private right of action. The FTC's Health Breach Notification Rule likely covers the app as a PHR vendor because it draws from several sources (HealthKit, Health Connect, Strava, and user entry).
4. The platforms add hard rules. There can be no advertising, marketing, or data-mining use of HealthKit or Health Connect data. Apple forbids storing personal health information in iCloud. In-app account deletion is required on iOS, and Google requires a web deletion link. Google also requires a Health apps declaration and an accurate Data safety form. Strava allows its data to be shown only to the user it belongs to.
5. The recommended launch age is 16+ in all regions (medium confidence).

## 1. Harms of gamified fitness, and what the research says

### 1.1 Effectiveness baseline
- A meta-analysis of RCTs found a small-to-moderate increase in physical activity (Hedges g ~0.42). The effect partly persisted after the intervention but was much smaller (~0.15). Gamified interventions also beat equivalent non-gamified ones. (High; abstract and secondary summaries) [1]
- STEP UP RCT (n=602 adults with overweight or obesity, 24 weeks): the support arm added +689 steps/day over control, collaboration +637, and competition +920. During the 12-week follow-up, competition (+569) and support (+428) stayed significant, but collaboration did not. (High) [2]
- STEP UP used loss framing: participants got 70 points each Monday and lost 10 for each missed goal. A secondary analysis found loss aversion applied to earned points, not to points simply given. (High / Medium) [2][3]
- Pokémon GO: steps rose after install (~11 extra minutes of walking/day), but the increase was no longer observed after about 6 weeks. (High) [4]
- Zombies, Run! (qualitative, n=30): narrative motivated longer sessions and long-term use. (Medium) [5]
- **Implication (Medium):** Game layers help, but novelty fades, and narrative and relatedness look more durable. Positive-only reinforcement is an ethical and SDT-based choice, not a proven efficacy win over loss framing.

### 1.2 Streak anxiety and loss aversion
- Highlighting intact streaks increases later engagement, and highlighting broken streaks reduces it. This held even when a glitch broke the streak. (High) [6][7]
- The abstinence-violation ("what-the-hell") effect means a single lapse can spiral into quitting. (Medium) [7]
- Loss aversion motivates in the short term [2][3], but it recruits introjected (guilt and shame) regulation rather than autonomous motivation. (Medium) [8][9]

### 1.3 Reduced enjoyment
- Etkin (JCR 2016), six experiments: measurement increases how much of an activity people do but reduces their enjoyment of it. (High) [10]
- SDT: autonomy, competence, and relatedness predict adherence. Gamification-induced satisfaction of those needs drives intrinsic motivation in mHealth. (High for the theory; Medium for its application to apps) [8][9][11]

### 1.4 Punishment and shame mechanics
- Habitica: users were "punished" during busy periods and gamed the system. How inappropriate users felt the rewards were predicted their loss of motivation. (Medium-High) [12]
- Stat atrophy is a punishment mechanic by default. Design it as floored, pausable detraining.

### 1.5 Compulsive exercise and overtraining
- ECSS/ACSM consensus: functional overreaching leads to non-functional overreaching, which leads to overtraining syndrome. The cause is excessive overload plus inadequate recovery. (High) [13]
- Users of fitness and diet apps report more compulsive exercise and disordered eating. The evidence is cross-sectional, and causality is not established. (Medium) [14][15]

### 1.6 Eating-disorder triggers
- Simpson & Mazzeo 2017 (n=493): calorie tracking was associated with eating concern and restraint, and fitness tracking uniquely predicted ED symptoms. (High) [16]
- Levinson 2017: 73% of ED patients who used MyFitnessPal felt it contributed to their disorder. (High) [16]
- A 2024 systematic review found associations but made no causal inference. (Medium) [15]
- **Implication:** No rewards for calories, weight, or body shape. No calories by default. Never tie a boss win to weight.

### 1.7 Researcher design guidance
- Satisfy autonomy, competence, and relatedness. Favor cooperative play. (Medium-High) [8][9][11]
- Fresh-start effect: goal pursuit rises after temporal landmarks. (High) [17]
- Do not highlight broken streaks. (High) [6]
- If any loss framing is used, apply it only to earned, game-internal currency. (Medium) [3]

## 2. Design guardrails (evidence-based practice)
- **2.1 Positive-only reinforcement:** Never subtract earned progress. Use flexible weekly consistency, grace days, freezes, and unloseable best records. Keep copy warm and ban shame language. (Medium) [6][8][12]
- **2.2 Atrophy:** gradual detraining with a floor. No decay during declared rest, illness, injury, pregnancy, or vacation (Sanctuary mode). Faster regain on return. (Low-Medium)
- **2.3 Lapses:** welcome-back quests sized to current ability. Fresh-start anchoring. No broken-streak pushes, with narrative reframing instead. (Medium) [6][17]
- **2.4 Rest and overtraining:** rest days earn rewards. Daily and weekly XP caps. XP weighted toward consistency rather than volume or calories. Non-rewarding warnings on load spikes. No pushes for double sessions or late-night workouts. (Medium; thresholds need sports-science review) [13][14]
- **2.5 ED-safe defaults:** no calories, weight, or BMI in the loop. Any weight tracking is opt-in, private, unrewarded, and unranked. Avatar shape is decoupled from stats. Offer a hide-numbers mode and ED resources. (Medium) [14][15][16]
- **2.6 Inclusive design:**
  - Disabilities and chronic conditions: be active according to ability and consult a professional, per WHO 2020. Offer adaptive quests (seated, wheelchair, low-impact) and a user-set baseline. (High/Medium) [18]
  - Older adults: activity per functional ability, plus balance and strength work. (High) [18]
  - Pregnancy/postpartum: ACOG CO 804 says exercise is safe in uncomplicated pregnancy, with warning signs to stop (bleeding, dizziness, chest pain, calf pain or swelling, and others). Offer a mode with suspended decay and no intensity pressure. (High/Medium) [19]
  - Illness and injury: Sanctuary pause. Never train through pain.
  - Accessibility: dynamic type, screen readers, color-blind safety.

## 3. Regulatory: staying a wellness product
### 3.1 FDA
- Revised final General Wellness guidance issued January 6, 2026, superseding the 2019 version (docket FDA-2014-N-1039). (High) [20][21][22][23]
- Two-factor test: intended only for general wellness, and low risk. (High) [21][22]
- Two claim categories: (a) general health or fitness with no disease reference; (b) healthy lifestyle reducing the risk of well-understood chronic diseases. (High) [23]
- New in 2026: non-invasive estimates of physiologic parameters are allowed. HCP-consult prompts are allowed if they do not name diseases, flag values as abnormal, give thresholds, or direct management. (Medium-High) [22][23]
- HealthRPG fits category (a). Avoid category (b). (Medium)
- Apple 1.4.1 scrutinizes accuracy claims and expects doctor reminders. (High) [24]

### 3.2 EU MDR
- MDR Recital 19: lifestyle and well-being software is not a medical device. (High) [25]
- MDCG 2019-11 turns on intended purpose and medical purpose under Art. 2(1). (High) [26][27][28]
- Rev.1 (17 June 2025) adds wellness examples under Annex XVI, clarifies modular software, and introduces MDAI terminology. (Medium) [26][27]
- Risk triggers: rehab, condition management, fall prevention for patients, and "detects overtraining syndrome." (Medium)

### 3.3 Claims to avoid
See `prohibited_claims` in params.json. FTC Act §5 also requires substantiation for health claims. (Medium; general principle)

## 4. Privacy law
### 4.1 GDPR
- Art. 9: health data is special-category data. Explicit consent under Art. 9(2)(a) is the practical basis. (High) [29]
- Fitness data becomes health data when used to assess fitness or when combined with other metrics, and inferences count. Assume Art. 9 applies. (Medium-High) [30][31]
- Also required: an Art. 6 basis, Arts. 13-15, 17, 20, Art. 7 consent conditions, an Art. 35 DPIA, an Art. 27 representative, Art. 28 DPAs, a Chapter V transfer mechanism, and possibly an EU Supabase region. ePrivacy consent applies to SDKs. (Medium)

### 4.2 CCPA/CPRA
- Sensitive PI includes health data and precise geolocation (radius of 1,850 ft or less), with a right to limit. (High) [32][33]
- Applies only above thresholds. (Medium)
- CPPA regulations (effective Jan 1, 2026) require risk assessments for sensitive PI, with the first attestation due by April 1, 2028. (Medium-High) [34]

### 4.3 WA, NV, CT, NY
- **WA MHMDA** (effective March 31, 2024; small businesses by June 30, 2024): a broad definition of consumer health data; opt-in consent to collect; separate consent to share; signed authorization to sell; a 2,000 ft geofence ban; a Consumer Health Data Privacy Policy; no threshold; private right of action. (High/Medium) [35][36][37][38]
- **NV SB 370** (effective March 31, 2024): separate consents; written authorization to sell; a 1,750 ft geofence ban; no private right of action. (High) [39][40]
- **CT** (effective July 1, 2023): consumer-health-data controller duties apply regardless of thresholds; consent to sell; processor contracts; geofence limits. (Medium-High) [41][42]
- **NY** Health Information Privacy Act: vetoed Dec 19, 2025 and reintroduced in 2026. Monitor it. (High) [43][44]
- Practical approach: one high-water-mark consent model for all users, with no sale ever.

### 4.4 FTC HBNR
- Final rule April 26, 2024, effective July 29, 2024. Covers health apps. A PHR has the capacity to draw from multiple sources, and the FTC's fitness-app example fits HealthRPG. (High) [45][46][47]
- Breach includes unauthorized disclosure. Notify within 60 days, with FTC notice at the same time for 500+ affected. Email plus text, in-app, or banner notice. (High) [45][46]
- Civil penalty up to $53,088 per violation (2025). (High) [48]

## 5. Platform policies
### 5.1 Apple [24]
- 5.1.1(i): privacy policy covering collection, sharing, retention, and revocation. (High)
- 5.1.1(ii): consent, easy withdrawal, and paid features never dependent on data access. (High)
- 5.1.1(v): in-app account deletion. (High)
- 5.1.1(ix): submit as a legal entity. (High text; Medium applicability)
- 5.1.2(vi): no HealthKit data for marketing, ads, or data mining. (High)
- 5.1.3(i): no health or fitness data to third parties for ads or data mining. Disclose the specific health data collected. (High)
- 5.1.3(ii): no false HealthKit writes and no personal health information in iCloud. Avoid CloudKit and iCloud KV sync; consider excluding caches from backup. (High rule; Low-Medium backup precaution)
- 5.1.4 Kids and 1.4.1 accuracy. (High)
- New 13+/16+/18+ ratings and questionnaire, due by Jan 31, 2026. (High) [49][50]

### 5.2 Google Play
- Health apps declaration required. (High) [51][52]
- Health Connect data is personal and sensitive. "Health-integrated games" is a permitted use. Prohibited: ads, sale, brokers, insurance or credit use, and apps that solely target children. Request only the minimum permissions. Privacy policy in the Console and in the app. Encryption. (High) [51][53]
- April 2026 update: Android 16 granular permissions. (Medium) [54]
- Accurate Data safety form. Account deletion in the app plus a web URL. (High) [55][56][57]

### 5.3 Strava
- Since Nov 11, 2024: display data only to the owning user, and no AI or ML training. No leaderboards built on Strava data. (High) [58][59]

## 6. Minors
- COPPA 2025 amendments (effective June 23, 2025; compliance by April 22, 2026): separate VPC for third-party disclosure, a security program, and a retention policy. (High) [60][61]
- GDPR Art. 8: the default is 16, and member states may set 13-16 (for example 13 in DK, IE, SE, PL; 14 in AT, ES; 15 in FR; 16 in DE, NL). (Medium-High) [62][63]
- Health Connect bars apps that solely target children. Apple Kids rules apply. (High) [24][49][53]
- TX/UT/LA app-store laws: Texas's law took effect after the Fifth Circuit stayed the injunction. (Medium) [64][65]
- The EU Digital Fairness Act (around Q4 2026) targets addictive design and gamified rewards, especially for minors. (Medium) [66][67]
- **Recommendation (Medium):** 16+ globally with a neutral age screen and a 16+ rating. Revisit 13+ in the US later with counsel.

## 7. Required in-app
1. Neutral age gate at 16+. Block younger users and do not retain their data.
2. Health and safety disclaimer at onboarding and in Settings: not medical advice; consult a physician first (especially if pregnant or living with a chronic, cardiac, or injury condition); stop if you feel pain, dizziness, or chest pain; does not diagnose or treat.
3. Optional PAR-Q+-style readiness self-check that stores nothing unnecessary.
4. Layered consent: the privacy notice; separate explicit consent for health data; per-source OS permissions and Strava OAuth; separate, unticked consent for any sharing (default none); coarse location with a manual alternative; EU SDK consent with no health data sent to SDKs; withdrawal in Settings.
5. Privacy policy plus a Consumer Health Data Privacy Policy.
6. Data export (JSON/CSV).
7. Account and data deletion in the app and by web link, cascading to Supabase, backups, and processors. Revoke Strava and HealthKit/Health Connect connections.
8. Wellbeing controls: Sanctuary, pregnancy mode, hide-numbers, quiet hours, ED resources.
9. HBNR in-app notice capability.

## Design guardrails checklist
- [ ] G1: No punishment for missed days beyond floored, pausable detraining. Earned progress is never deleted.
- [ ] G2: No broken-streak callouts. Flexible weekly consistency, grace days, freezes, unloseable bests.
- [ ] G3: Copy review bans shame, guilt, and body-judgment language.
- [ ] G4: Rest days are rewarded quests.
- [ ] G5: Daily and weekly exertion XP caps. XP weighted by consistency.
- [ ] G6: No double-session or late-night incentives. Non-rewarding load-spike warnings.
- [ ] G7: No calories or weight in the core loop.
- [ ] G8: Avatar body is decoupled from stats.
- [ ] G9: Welcome-back quests at current ability, anchored to fresh-start moments.
- [ ] G10: Sanctuary pause.
- [ ] G11: Pregnancy/postpartum mode with ACOG warning signs.
- [ ] G12: Adaptive activities and user-set baseline. Not step-count-only.
- [ ] G13: Competition is opt-in. Cooperative play by default.
- [ ] G14: Quiet hours, no guilt pushes, easy opt-out.
- [ ] G15: Hide-numbers mode and ED/mental-health resources.
- [ ] G16: Accessibility baseline.
- [ ] G17: No dark patterns.
- [ ] G18: Track well-being metrics alongside engagement.

## Compliance checklist (launch blockers vs. later)

**Launch blockers:**
- [ ] L1: Counsel review of this document, policies, terms, and marketing.
- [ ] L2: Wellness-only purpose. Copy audit against prohibited claims.
- [ ] L3: GDPR Art. 9(2)(a) explicit consent, logged.
- [ ] L4: WA/NV/CT consents, no sale, Consumer Health Data Privacy Policy, no geofencing.
- [ ] L5: Privacy policy in the app and stores.
- [ ] L6: In-app deletion (Apple) and web deletion URL (Google).
- [ ] L7: No HealthKit or Health Connect data to ads, analytics, or brokers. SDK audit.
- [ ] L8: No personal health information in iCloud or CloudKit.
- [ ] L9: Google Health apps and Health Connect declarations. Minimum data types.
- [ ] L10: Accurate Apple privacy label and Google Data safety form.
- [ ] L11: 16+ age gate and store ratings.
- [ ] L12: Onboarding disclaimer.
- [ ] L13: Strava data shown only to its owner. No AI training.
- [ ] L14: HBNR response plan and security (encryption, Supabase RLS).
- [ ] L15: Data export.
- [ ] L16: DPAs and transfer mechanism, or EU hosting.
- [ ] L17: DPIA.
- [ ] L18: EU Art. 27 representative if needed.
- [ ] L19: Publish as a legal entity.

**Later:**
- [ ] P1: CCPA/CPRA if thresholds are met (right-to-limit link, risk assessment).
- [ ] P2: Map other state laws.
- [ ] P3: Monitor NY HIPA, EU DFA, and app-store age laws.
- [ ] P4: Evaluate a 13+ US launch.
- [ ] P5: Re-review under FDA if physiologic-estimate features are added.
- [ ] P6: New review for any clinical, rehab, or employer partnership (MDR/FDA, HIPAA BAA).
- [ ] P7: DSA assessment if public UGC is added.
- [ ] P8: Periodic well-being audit of the game economy.

## References
1. Mazéas A, et al. JMIR 2022;24(1):e26779. https://www.jmir.org/2022/1/e26779 ; https://pmc.ncbi.nlm.nih.gov/articles/PMC8767479/
2. Patel MS, et al. STEP UP. JAMA Intern Med 2019. https://jamanetwork.com/journals/jamainternalmedicine/fullarticle/2749761 ; https://pubmed.ncbi.nlm.nih.gov/31498375/
3. Rewley J, et al. Games Health J 2021. https://journals.sagepub.com/doi/abs/10.1089/g4h.2021.0130
4. Howe KB, et al. BMJ 2016. https://pubmed.ncbi.nlm.nih.gov/27965211/
5. Farič N, et al. Games Health J 2021. https://journals.sagepub.com/doi/abs/10.1089/g4h.2021.0060 ; https://discovery.ucl.ac.uk/id/eprint/10139156/
6. Silverman J, Barasch A. JCR 2023;49(6):1095-1117. https://academic.oup.com/jcr/article-abstract/49/6/1095/6623414
7. UDaily 2024. https://www.udel.edu/udaily/2024/march/power-of-streaks-motivation-jackie-silverman/ ; https://www.colorado.edu/business/news/2023/04/20/research-streaks-marketing-tech-barasch
8. SDT and physical activity, Psych Sport Exerc 2025. https://www.sciencedirect.com/science/article/pii/S1469029225000780
9. Frontiers in Psychology 2025. https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2025.1634267/full
10. Etkin J. JCR 2016;42(6):967-984. https://academic.oup.com/jcr/article-abstract/42/6/967/2358309
11. JMIR 2021 gamification SDT SEM. https://pmc.ncbi.nlm.nih.gov/articles/PMC8391751/
12. Diefenbach S, Müssig A. IJHCS 2019;127. https://www.sciencedirect.com/science/article/abs/pii/S1071581918305135 ; https://epub.ub.uni-muenchen.de/77668/
13. Meeusen R, et al. ECSS/ACSM 2013. https://onlinelibrary.wiley.com/doi/10.1080/17461391.2012.730061
14. Psych Sport Exerc 2025, diet/fitness apps and compulsive exercise. https://www.sciencedirect.com/science/article/pii/S1469029225000895
15. Body Image 2024 systematic review. https://www.sciencedirect.com/science/article/pii/S174014452400158X
16. Simpson & Mazzeo 2017. https://www.sciencedirect.com/science/article/abs/pii/S1471015316303646 ; Levinson et al. 2017. https://www.researchgate.net/publication/319194941_My_Fitness_Pal_calorie_tracker_usage_in_the_eating_disorders
17. Dai, Milkman, Riis. Mgmt Sci 2014;60(10):2563-2582. https://pubsonline.informs.org/doi/10.1287/mnsc.2014.1901
18. Bull FC, et al. WHO 2020 guidelines. https://pmc.ncbi.nlm.nih.gov/articles/PMC7719906/
19. ACOG CO 804. https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2020/04/physical-activity-and-exercise-during-pregnancy-and-the-postpartum-period
20. FDA General Wellness guidance page. https://www.fda.gov/regulatory-information/search-fda-guidance-documents/general-wellness-policy-low-risk-devices
21. Troutman. https://www.troutman.com/insights/fdas-2026-guidance-on-general-wellness-devices-policy-for-low-risk-devices/
22. Faegre Drinker. https://www.faegredrinker.com/en/insights/publications/2026/1/key-updates-in-fdas-2026-general-wellness-and-clinical-decision-support-software-guidance
23. King & Spalding. https://www.kslaw.com/news-and-insights/fda-updates-general-wellness-and-clinical-decision-support-guidance-documents
24. Apple App Review Guidelines. https://developer.apple.com/app-store/review/guidelines/ ; https://developer.apple.com/support/offering-account-deletion-in-your-app/
25. MDR 2017/745. https://eur-lex.europa.eu/eli/reg/2017/745/oj
26. MDCG 2019-11 Rev.1. https://health.ec.europa.eu/document/download/b45335c5-1679-4c71-a91c-fc7a4d37f12b_en?filename=md_mdcg_2019_11_guidance_qualification_classification_software_en.pdf
27. Emergo by UL. https://www.emergobyul.com/news/european-revision-primary-software-guidance-mdcg-2019-11-revision-1-small-changes-meaningful
28. OpenRegulatory. https://openregulatory.com/mdcg/mdcg-2019-11
29. GDPR Art. 9. https://gdpr-info.eu/art-9-gdpr/ ; https://eur-lex.europa.eu/eli/reg/2016/679/oj
30. ICO special category data. https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/special-category-data/what-is-special-category-data/
31. GDPR Local wearables. https://gdprlocal.com/gdpr-for-wearable-technology/
32. Cal. Civ. Code 1798.140. https://codes.findlaw.com/ca/civil-code/civ-sect-1798-140/
33. CPRA text. https://www.caprivacy.org/cpra-text/
34. CPPA. https://www.cppa.ca.gov/announcements/2025/20250923.html ; https://www.bhfs.com/insight/risk-assessments-under-the-new-ccpa-regulations-commence-jan-1-2026/
35. WA AG. https://www.atg.wa.gov/protecting-washingtonians-personal-health-data-and-privacy
36. IAPP. https://iapp.org/resources/article/washington-my-health-my-data-act-overview
37. Goodwin. https://www.goodwinlaw.com/en/insights/publications/2024/03/alerts-technology-hltc-my-health-my-data-act-mhmda
38. Stoel Rives. https://www.stoel.com/insights/publications/faq-washington-states-my-health-my-data-act
39. Orrick NV. https://www.orrick.com/en/Insights/2023/07/Nevadas-New-Consumer-Health-Data-Privacy-Law-6-Things-to-Know
40. WilmerHale NV. https://www.wilmerhale.com/en/insights/blogs/wilmerhale-privacy-and-cybersecurity-law/20230614-nevada-legislature-passes-consumer-health-data-privacy-bill
41. Orrick CT. https://www.orrick.com/en/Insights/2023/07/The-Consumer-Health-Data-Amendments--to-the-Connecticut-Data-Privacy-Act
42. CT AG. https://portal.ct.gov/ag/sections/privacy/the-connecticut-data-privacy-act
43. Covington NY veto. https://www.insideprivacy.com/health-privacy/new-york-governor-vetoes-restrictive-health-privacy-law/
44. MoFo NYHIPA 2026. https://www.mofo.com/resources/insights/260316-nyhipa-returns-in-2026-revised-bill
45. FTC blog HBNR. https://www.ftc.gov/business-guidance/blog/2024/04/updated-ftc-health-breach-notification-rule-puts-new-provisions-place-protect-users-health-apps
46. FTC press release. https://www.ftc.gov/news-events/news/press-releases/2024/04/ftc-finalizes-changes-health-breach-notification-rule
47. 16 CFR 318. https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-318 ; https://www.federalregister.gov/documents/2024/05/30/2024-10855/health-breach-notification-rule
48. FTC compliance guide. https://www.ftc.gov/business-guidance/resources/complying-ftcs-health-breach-notification-rule-0 ; https://www.ftc.gov/news-events/news/press-releases/2025/02/ftc-publishes-inflation-adjusted-civil-penalty-amounts-2025
49. Apple age ratings. https://developer.apple.com/news/?id=ks775ehf
50. Apple upcoming requirements. https://developer.apple.com/news/upcoming-requirements/?id=07242025a
51. Play Health Content and Services. https://support.google.com/googleplay/android-developer/answer/16679511?hl=en
52. Publish health app. https://developer.android.com/health-and-fitness/health-connect/publish
53. Android Health Permissions FAQ. https://support.google.com/googleplay/android-developer/answer/12991134?hl=en
54. AppCompliance (secondary). https://appcompliance.io/blog/google-play-health-connect-android-16-declaration/
55. Play Data safety. https://support.google.com/googleplay/android-developer/answer/10787469?hl=en
56. Play account deletion. https://support.google.com/googleplay/android-developer/answer/13327111?hl=en
57. Android Developers Blog 2023. https://android-developers.googleblog.com/2023/04/giving-people-more-control-over-their-data.html
58. Strava press. https://press.strava.com/articles/updates-to-stravas-api-agreement
59. Strava Support. https://support.strava.com/hc/en-us/articles/31798729397773-API-Agreement-Update-How-Data-Appears-on-3rd-Party-Apps
60. COPPA final rule. https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule
61. Hunton COPPA. https://www.hunton.com/privacy-and-cybersecurity-law-blog/coppa-rule-amendment-compliance-deadline-approaches
62. GDPR Art. 8. https://gdpr-info.eu/art-8-gdpr/
63. EuConsent. https://euconsent.eu/digital-age-of-consent-under-the-gdpr/
64. MoFo Texas. https://www.mofo.com/resources/insights/251111-texas-targets-app-stores-with-new-accountability-law
65. Wiley ASAA. https://www.wiley.law/alert-State-App-Store-Accountability-Acts-Introduce-New-Obligations-for-App-Developers
66. EP Legislative Train DFA. https://www.europarl.europa.eu/legislative-train/theme-protecting-our-democracy-upholding-our-values/file-digital-fairness-act
67. EPRS dark patterns 2025. https://www.europarl.europa.eu/RegData/etudes/ATAG/2025/767191/EPRS_ATA(2025)767191_EN.pdf

**Research limitations:** The FDA guidance PDF, the MDCG PDF, and the PMC full text of Mazéas could not be parsed. Those claims rely on landing pages and law-firm summaries. The Habitica, Zombies Run!, and Fitbit literature was reviewed at abstract level. No Fitbit-badge study was verified, so none is cited.
