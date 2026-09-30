/**
 * Story grammar (Tracery-style). `#symbol#` expands to one of the symbol's
 * lines, chosen by the engine's seeded RNG; `{slot}` is filled from real
 * workout data. Stories are fully deterministic and never AI-generated at runtime.
 *
 * Slots: {hero} {antagonist} {setting} {actTitle} {minutes} {climbPhrase}
 *        {routine} {option} {remainingTrials}
 */
export type Grammar = Record<string, string[]>;

export const SHARED_GRAMMAR: Grammar = {
  // One deed per archetype: what the hero did, grounded in the numbers.
  "deed.long_walk": [
    "{hero} set out along the road and kept a steady pace for {minutes} minutes, {climbPhrase}.",
    "For {minutes} minutes {hero} walked, {climbPhrase}, until the road felt like an old friend.",
    "Mile after mile, {minutes} minutes of it, {hero} learned the patience of the long road.",
  ],
  "deed.journey_hike": [
    "The path turned upward. {hero} climbed for {minutes} minutes, {climbPhrase}, breath steady and boots sure.",
    "{hero} spent {minutes} minutes on the trail, {climbPhrase}, and the mountain gave up a little more of its secrets.",
    "Switchback after switchback, {minutes} minutes in all and {climbPhrase}, {hero} pressed on toward the heights.",
  ],
  "deed.steady_foot": [
    "{hero} walked the patrol for {minutes} minutes, eyes open, missing nothing.",
    "A {minutes}-minute round of the watch, {climbPhrase}, and all was quiet for now.",
  ],
  "deed.steady_cross": [
    "{hero} took a different road today: {option}, {minutes} minutes of honest effort.",
    "Not every errand is on foot. {hero} chose to {option} for {minutes} minutes and came back stronger for it.",
  ],
  "deed.tempo_foot": [
    "{hero} gave chase, {minutes} minutes hard enough to burn, and did not let the quarry out of sight.",
    "Heart pounding, {hero} drove on for {minutes} fierce minutes. Speed, it turns out, can be forged too.",
  ],
  "deed.strength_session": [
    "At the forge, {hero} worked through {routine}. Iron, sweat, and {minutes} minutes that left their arms ringing.",
    "{hero} trained {routine} for {minutes} minutes. The old smith watched and, for once, said nothing critical.",
    "Set by set, {hero} finished {routine}. The shield felt lighter afterward.",
  ],
  "deed.conditioning_session": [
    "{hero} took on the gauntlet, choosing to {option}, and kept at it for {minutes} minutes without letting up.",
    "In the barracks yard, {hero} chose to {option} for {minutes} minutes, and kept going when others stopped.",
  ],
  "deed.mobility_session": [
    "At the shrine, {hero} moved slowly through {routine} for {minutes} minutes, and tight places loosened.",
    "{hero} spent {minutes} quiet minutes on {routine}. The monks nodded; a supple body is a hard target.",
  ],

  color: [
    "The wind carried the smell of rain.",
    "Somewhere far off, a bell tolled the hour.",
    "A hawk wheeled overhead, watching.",
    "Evening light turned the fields to copper.",
    "Frost crunched underfoot.",
    "The village children stopped to stare as {hero} passed.",
    "",
  ],

  "closing.early": [
    "It was a beginning, and {remainingTrials} remain before {antagonist}.",
    "{hero} slept well that night, with {remainingTrials} still ahead.",
  ],
  "closing.mid": [
    "The legend grows in the taverns, and {remainingTrials} stand between {hero} and {antagonist}.",
    "{hero} is not who they were when this began, and {remainingTrials} remain.",
  ],
  "closing.late": [
    "Only {remainingTrials} remain, and {antagonist} surely senses what is coming.",
    "The end of the road is in sight, with {remainingTrials} left.",
  ],
  "closing.final": [
    "There is nothing left to prepare. {antagonist} waits, and {hero} is ready.",
  ],

  "bounty.opening": [
    "A notice on the village board caught {hero}'s eye.",
    "The innkeeper slid a folded note across the bar: work for a willing hero.",
  ],
  "bounty.closing": [
    "The bounty was paid in silver and a little more respect.",
    "{hero} collected the reward and a round of thanks from the tavern.",
  ],

  "epilogue.narrow": [
    "It was closer than the songs will admit, but {hero} stood when {antagonist} fell. Luck favours the prepared.",
  ],
  "epilogue.valiant": [
    "{hero} fought with every lesson of the road and forge, and {antagonist} fell before them. The bards are already arguing over the verses.",
  ],
  "epilogue.legendary": [
    "Not once did fortune need to intervene. {hero} met {antagonist} as an equal and ended it cleanly. This one will be sung for a hundred years.",
  ],
};

/** Per-questline grammar: act openings keyed by act, plus the template's narrative beats. */
export const QUESTLINE_GRAMMAR: Record<string, Grammar> = {
  dragon_of_ashpeak: {
    "opening.training": [
      "In {setting}, #beat#",
      "#beat# In the Smith's Yard, the training went on.",
    ],
    "opening.journey": ["On the road to Ashpeak, #beat#", "#beat# The mountain grew larger each day."],
    "opening.confrontation": ["Beneath the Cinder Lair, #beat#", "#beat# The air tasted of smoke."],
    "beat.ash_on_the_wind": ["grey ash drifted over the rooftops, and the old folk muttered the wyrm's name."],
    "beat.the_smiths_offer": ["the smith offered {hero} a blade, if they could prove strong enough to carry it."],
    "beat.forging_the_blade": ["the smith began forging the blade that would face Vorthax."],
    "beat.leaving_emberford": ["{hero} left Emberford behind with the smith's blade on their back."],
    "beat.the_burnt_bridge": ["the bridge over the gorge lay burnt, and the long way round was the only way."],
    "beat.the_hermits_map": ["an old hermit traded a map of the high passes for news of the lowlands."],
    "beat.the_final_ascent": ["the last climb began, black rock and bitter air."],
    "beat.the_lair_mouth": ["the lair mouth glowed like an open furnace."],
  },
  wolves_of_greywood: {
    "opening.training": ["In {setting}, #beat#", "#beat# The Watch of Hollin drilled at dawn."],
    "opening.journey": ["Deep in the Greywood, #beat#", "#beat# The trees closed in."],
    "opening.confrontation": ["Near the den, #beat#", "#beat# Every shadow had eyes."],
    "beat.howls_at_dusk": ["howls rose from the Greywood at dusk, closer every night."],
    "beat.joining_the_watch": ["{hero} took the Warden's oath and joined the Watch."],
    "beat.tracks_in_the_frost": ["great tracks crossed the frost, far too large for any ordinary wolf."],
    "beat.the_woodcutters_warning": ["a woodcutter warned of a pale shape that walked like a king among the pack."],
    "beat.the_den_in_the_hollow": ["the trail ended at a hollow where the snow lay trampled and red."],
  },
};
