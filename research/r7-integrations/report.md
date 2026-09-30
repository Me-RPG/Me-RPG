# R7 — Integration Landscape for Me RPG
**Status:** 0.1.0-unreviewed · **Research date:** 2026-09-28

> **Caveats.** Everything here comes from official docs fetched on 2026-09-28 unless marked otherwise. Some pages were read through an automated summariser, so treat quotes as close paraphrases and re-read the source before any legal decision. Anything not confirmed is marked UNVERIFIED. This is not legal advice.

## 1. Strava
- **Access**
  - New apps start at an athlete capacity of 1. You can self-upgrade to 10; going further needs review, and more access is "not guaranteed." (https://developers.strava.com/docs/rate-limits/, https://developers.strava.com/docs/getting-started/)
  - Tiers (API Policy §3.3, effective 2026-06-01): **Standard** covers 10 users, or up to 9,999 after review. **Extended Access** covers 10,000+ and is approved case by case. (https://www.strava.com/legal/api_policy)
  - The getting-started page says "A Strava subscription is a prerequisite for creating an app."
  - Standard Tier requires that the developer or specified end users keep an active subscription. It took effect 2026-06-01 for new developers and 2026-06-30 for existing ones; Extended Access is exempt. (https://tryterra.co/blog/strava-api-changes-2026, https://communityhub.strava.com/insider-journal-9/an-update-to-our-developer-program-13428)
  - Third parties put the price at about $11.99/month. UNVERIFIED.
  - Per Terra (UNVERIFIED on Strava's own site): club endpoints were removed 2026-09-01, Explore Segments is limited to Extended Access, a new base URL `api-v3.strava.com` arrives 2027-01-04, and the migration deadline is 2027-06-01.
- **Auth:** OAuth2 with scopes. Access tokens last about 6 hours, and a refresh token renews them. The client secret must be kept server-side, in a Supabase Edge Function.
- **Data:** activities, streams (heart rate, altitude, latlng), the athlete's routes, and segments (https://developers.strava.com/docs/reference/; not re-fetched).
- **Webhooks** (https://developers.strava.com/docs/webhooks/)
  - One subscription per app.
  - Objects: activity and athlete. Events: create, update and delete.
  - Your endpoint must return 200 within 2 seconds.
  - Deauthorization arrives as an update with `authorized:false`.
- **Rate limits:** 200 per 15 min and 2,000 per day overall (reads: 100 and 1,000) by default. At the 10-athlete tier: 400 and 4,000 overall (reads: 200 and 2,000).
- **Restrictions:**
  - Only the owning athlete may see their data (Agreement §2.3, Policy §6.1; this has applied since 2024-11-11 per https://press.strava.com/articles/updates-to-stravas-api-agreement). The summariser garbled §6.1's wording, so re-read it.
  - No AI Application use, including derived data, embeddings and RAG (Policy §5.3).
  - No analytics or insights (§5.4).
  - A 7-day cache limit (§6.2).
  - Delete within 30 days of disconnect and certify it in writing (§7.4).
  - Nothing competitive with Strava (§5.2).
- **Branding** (https://developers.strava.com/guidelines/): use the "Connect with Strava" button and "Powered by Strava" or "Compatible with Strava". Links must say "View on Strava" (bold, underlined or #FC5200). Strava cannot appear in our app's name or icon.
- **React Native:** no SDK. Use `expo-auth-session` 57.0.13 (2026-09-24) or `react-native-app-auth` 8.4.1 (2026-07-06).

## 2. Apple HealthKit
- **Access:** no approval; you add an entitlement. Background delivery needs `com.apple.developer.healthkit.background-delivery` and uses `HKObserverQuery` with `enableBackgroundDelivery`. Some types update at most hourly on iOS. (https://developer.apple.com/documentation/healthkit/hkhealthstore/enablebackgrounddelivery(for:frequency:withcompletion:))
- **App Store rules** (https://developer.apple.com/app-store/review/guidelines/; the page shows no date):
  - 5.1.3(i): no use for advertising, marketing or data mining beyond health management or research, and only with permission. You must disclose which data you collect.
  - 5.1.3(ii): no false data, and no personal health information in iCloud.
  - 2.5.1: HealthKit is for health and fitness only and must be mentioned in the app description.
  - 5.1.2(i): tell users about sharing with third-party AI and get explicit permission.
- **Data:** workouts, heart rate, energy, distance, and `HKWorkoutRoute` with altitude.
- **React Native:**
  - **@kingstinct/react-native-healthkit** 16.0.0 (2026-09-18): repo pushed 2026-09-28, 715 stars. Built on Nitro, with an Expo config plugin that has a background option and `getWorkoutRoutes()`. (https://github.com/kingstinct/react-native-healthkit)
  - **react-native-health** 1.19.0 (2024-10-15): features frozen pending a Swift rewrite, 157 open issues, and background use needs AppDelegate edits. (https://github.com/agencyenterprise/react-native-health)
  - A config plugin and dev client are required; neither works in Expo Go. I found no official Expo HealthKit module (the docs URL returned 404).
- **Branding:** Apple Health marketing guidelines. UNVERIFIED.

## 3. Google Health Connect
- **Play Console health declaration** (https://support.google.com/googleplay/android-developer/answer/12991134)
  - You justify each permission.
  - Allowed uses include fitness and "health-integrated games".
  - Banned: selling data, ads, sharing with third parties without consent, headless apps, and children-only apps.
  - You need a privacy policy.
  - Approval takes up to about 7 days, plus 5–7 business days for whitelisting (library README).
- **Reading data** (https://developer.android.com/health-and-fitness/health-connect/read-data, updated 2026-09-24)
  - A 30-day history limit applies unless you request `READ_HEALTH_DATA_HISTORY`.
  - Background reads need `READ_HEALTH_DATA_IN_BACKGROUND` and run through WorkManager.
  - Quotas exist but are not published.
- **Routes** (https://developer.android.com/health-and-fitness/health-connect/features/exercise-routes, updated 2026-09-23)
  - Need `READ_EXERCISE_ROUTES`.
  - Routes from other apps may need consent per session and cannot be read in the background.
- **Push:** none.
- **Google Fit** (https://developer.android.com/health-and-fitness/health-connect/migration/fit/faq, updated 2026-08-21): supported "until the end of 2026", with no signups since 2024-05-01.
- **React Native:** react-native-health-connect 4.1.3 (2026-08-06), with the Expo plugin built in from v4. Needs compileSdk 36 and minSdk 26. (https://github.com/matinzd/react-native-health-connect)

## 4. Garmin Connect Developer Program
- **Access**
  - Enterprise only. Applications are reviewed in about 2 business days, and integration takes 1–4 weeks.
  - No fees, though some metrics may need a licence fee or a minimum device order. (https://developer.garmin.com/gc-developer-program/program-faq/)
  - APIs: Health, Activity, Women's Health, Training and Courses (https://developer.garmin.com/gc-developer-program/overview/).
- **Auth:** OAuth 2.0 PKCE (https://developerportal.garmin.com/sites/default/files/OAuth2PKCE_1.pdf). Tokens reportedly last about 3 months (UNVERIFIED).
- **Data:** the Activity API provides FIT, GPX and TCX files with GPS, heart rate and elevation. Delivery is push or ping/pull, with backfill and an evaluation environment. (https://developer.garmin.com/gc-developer-program/activity-api/)
- **Rate limits:** UNVERIFIED.
- **Agreement:** only the China variant was readable (FRM-0952 Rev. B, https://www8.garmin.com/en-US/GARMINCONNECTDEVELOPERPROGRAMAGREEMENT/GARMINCONNECTDEVELOPERPROGRAMAGREEMENT_EN.pdf).
  - §6.4: attribution on any display to third parties.
  - An AI Transparency Statement with opt-in consent if data is used for AI.
  - Whether the global agreement matches is UNVERIFIED.
- **Brand guidelines** (https://developer.garmin.com/brand-guidelines/api-brand-guidelines/): attribution on title screens, secondary screens, exports, derived data (including ML and AI inputs) and social posts.
- **React Native:** cloud-to-cloud with expo-auth-session. Avoid `react-native-garmin-connect` (0.3.0, 2024, unofficial).

## 5. Fitbit → Google Health API
- **Fitbit:** a banner says "deprecating the legacy Fitbit Web API in September 2026" (https://dev.fitbit.com/build/reference/web-api/). Do not build on it.
- **Google Health API** (https://developers.google.com/health, https://developers.google.com/health/migration, updated 2026-09-28)
  - Google OAuth with `googlehealth*` scopes.
  - Users must re-consent, and one user should never be linked through both APIs at once ("dual-linking").
  - Notify-only webhooks.
  - Data (https://developers.google.com/health/data-types): exercise, heart rate, HRV, resting heart rate, altitude and floors. **No GPS/route type found.**
  - Terms, quotas and OAuth verification: UNVERIFIED (the policies page returned 404).
  - Legacy Fitbit allowed 150 requests/hour/user (secondary source, https://openwearables.io/blog/fitbit-web-api-shutdown-2026-migration-guide, 2026-08-12).

## 6. Mapy.com
- **Pricing** (https://developer.mapy.com/pricing/)
  - Basic: 250k free credits a month.
  - Extended: 10M free a month. It requires a public, free app using only Mapy data, with attribution, a catalogue listing and a yearly affidavit.
  - Overage costs 1.60 CZK per 1k credits, with volume tiers down to 0.2 CZK.
  - Costs per call: tile 1, geocode, route and elevation 4 each, and a 10×10 matrix 40.
- **Tiles:** basic, outdoor, aerial, winter and names-overlay.
- **Routing:** `foot_hiking` (added 2025-09-23, https://developer.mapy.com/planning-routes-along-hiking-trails/), up to 15 waypoints, GeoJSON or polyline output. (https://developer.mapy.com/rest-api-mapy-cz/function/routing/)
- **Elevation:** up to 256 points per request, using lidar for Central Europe (https://developer.mapy.com/rest-api-mapy-cz/function/elevation-api/).
- **No endpoint lists nearby trails.**
- **Terms** (https://developer.mapy.com/terms-and-conditions/, effective 2025-06-01)
  - No caching or storing of results (4.6.2).
  - No scraping.
  - **No combining with other map data (2.5.2).**
  - Keep the API key secure.
- **Attribution** (https://developer.mapy.com/rest-api-mapy-cz/atribution/)
  - A clickable logo: at least 30 px on a map, or at least 20 px when using data only.
  - The text "Seznam.cz a.s. and others", linked to https://api.mapy.com/copyright.
- **React Native:** no SDK. Use react-native-maps or MapLibre with REST calls.

## 7. OpenStreetMap
- **Overpass** (https://wiki.openstreetmap.org/wiki/Overpass_API, edited 2026-09-28; https://dev.overpass-api.de/overpass-doc/en/preface/commons.html)
  - Keep under 10k queries and 1 GB a day, and about 100× less for apps with ongoing use.
  - "Commercial use should use self-hosted or paid Overpass servers."
  - Send a User-Agent and cache results.
  - After a 429, wait 30 seconds.
- **Hiking routes** (https://wiki.openstreetmap.org/wiki/Tag:route%3Dhiking)
  - Tagged `type=route` + `route=hiking|foot`, with `network=iwn|nwn|rwn|lwn`.
  - Useful tags: `name`, `ref`, `osmc:symbol`, `distance`, `ascent`. Difficulty (`sac_scale`) sits on the ways.
  - Example query: `relation["type"="route"]["route"~"^(hiking|foot)$"](around:10000,LAT,LON); out tags bb;`
- **ODbL** (https://osmfoundation.org/wiki/Licence/Attribution_Guidelines, updated 2026-09-10)
  - Show "© OpenStreetMap contributors", linked to /copyright.
  - It may collapse after 5 seconds, or go on a splash screen if there is also a licence link in the app.
  - Share-alike applies to publicly distributed extracts.
- **Elevation**
  - OpenTopoData (https://www.opentopodata.org/): 100 locations per request, 1 call per second, 1,000 calls per day; can be self-hosted.
  - Open-Elevation (https://open-elevation.com/): 1,000 requests/month free, paid plans €5.99–59.99/month.
  - Copernicus GLO-30/90 (https://registry.opendata.aws/copernicus-dem/; licence at https://docs.sentinel-hub.com/api/latest/static/files/data/dem/resources/license/License-COPDEM-30.pdf): free, may be redistributed. Required notice: "© DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA; all rights reserved."

## 8. AllTrails
- **No public API.** It uses DataDome bot protection.
- **Terms** (https://www.alltrails.com/terms, updated 2025-12-17) forbid:
  - automated queries and scraping or mining data;
  - commercial use without written consent;
  - republishing content.
- **Partnerships are bespoke deals:** Garmin, COROS (2026-06-12), a ChatGPT app (2025-11-20, https://www.alltrails.com/press/introducing-alltrails-in-chatgpt) and Claude. The affiliate page returned 403.
- **Conclusion: not viable. Never scrape it.**

## 9. Alternatives
- **Komoot:** partner-only, for device makers (https://support.komoot.com/hc/en-us/articles/10331570510618-komoot-API).
- **Outdooractive:** a B2B Data API needing an API key and a project key, with provider approval. Terms (2023-08-14, https://corporate.outdooractive.com/en/api-terms): refresh content every 24 h, noindex pages, show a logo and author credits. Pricing is not published.
- **Hiking Project:** the API has been dead since 2020, and onX declines requests (https://www.hikingproject.com/data).
- **US NPS:** a free key, 1,000 requests/hour, endpoints for parks, thingstodo, places and alerts. No trail geometry. (https://www.nps.gov/subjects/developer/guides.htm)

## Comparison table
| Platform | Available | Auth | Push | Limits | Key restriction | RN library |
|---|---|---|---|---|---|---|
| Strava | Yes; 1 → 10 → 9,999 athletes; paid subscription | OAuth2 | Webhook | 200/2k; 400/4k | Owner-only display, no AI, 7-day cache | expo-auth-session |
| HealthKit | Yes | On-device | Background delivery | n/a | 5.1.3 | @kingstinct 16.0.0 |
| Health Connect | Yes, after Play declaration | On-device | None | Undisclosed | 30-day history, route consent | r-n-health-connect 4.1.3 |
| Garmin | Enterprise application | OAuth2 PKCE | Push or pull | UNVERIFIED | Attribution everywhere | Cloud |
| Fitbit | No (Sept 2026) | — | — | — | — | — |
| Google Health API | Yes | Google OAuth | Notify webhooks | UNVERIFIED | Terms UNVERIFIED | Cloud |
| Mapy.com | Yes, API key | Key | n/a | Credits | No caching, no mixing | MapLibre + REST |
| OSM Overpass | Public instances non-commercial | None | n/a | <10k/day | ODbL | Server |
| AllTrails | No | — | — | — | Scraping banned | — |
| Komoot | No | — | — | — | — | — |
| Outdooractive | B2B | Keys | n/a | ? | 24 h refresh, noindex | REST |
| Hiking Project | No | — | — | — | — | — |
| NPS | Yes | Key | n/a | 1,000/h | No trails | REST |

## Recommended integration order & constraints we must design around
**Order**
1. HealthKit and Health Connect as the primary workout sources. File the Play declaration early.
2. OSM trails through a server-side Overpass cache (geohash tiles in Supabase), with self-hosted Copernicus or OpenTopoData elevation, plus NPS alerts and points of interest.
3. Mapy.com only on screens that use Mapy data alone.
4. Garmin, once we are a registered business.
5. Google Health API.
6. Strava last, as an owner-only, non-AI, 7-day-cache feature, and only after legal review.

**Constraints**
- Record the source and source ID on every imported row. This lets us purge on disconnect, enforce Strava's 7-day limit, and show attribution.
- No Strava-derived stats in leaderboards, guilds or PvP.
- No LLM features may touch Strava data. Other health data needs AI disclosure and consent (Apple 5.1.2(i), Garmin's AI Transparency Statement).
- No health data in iCloud, and none used for ads.
- Health Connect:
  - request the history permission;
  - fetch routes only in the foreground;
  - sync through WorkManager.
- Supabase webhook endpoints must answer Strava within 2 s and queue the work.
- One basemap family per screen, because Mapy data cannot be mixed with other maps.
- Handle ODbL share-alike correctly for the trail cache.
- Never call public Overpass directly from phones.
- Show the Copernicus notice wherever DEM-derived data is displayed.
- A "Data sources & licences" screen.
- No AllTrails, Komoot or Hiking Project data, and no scraping.

**Open items (UNVERIFIED):**
- Strava §6.1 exact text, and whether derived XP counts as Strava Data
- Garmin's global agreement and rate limits
- Google Health API terms, OAuth verification and quotas
- Mapy §2.5.2 in full
- Apple Health branding guidelines
