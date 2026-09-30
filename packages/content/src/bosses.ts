export type VictoryGrade = "narrow" | "valiant" | "legendary";

export interface BossAttack {
  id: string;
  name: string;
  /** Damage as a fraction of the hero's max health (before defenses). */
  damageFrac: number;
  /** Specials are telegraphed a turn ahead and hit harder. */
  special: boolean;
  /** Warning shown the turn before a special lands. */
  telegraph?: string;
  /** Abilities that fully counter this attack when active. */
  counteredBy: string[];
  text: string;
  counterText?: string;
}

export interface BossDef {
  templateId: string;
  name: string;
  intro: string[];
  attacks: BossAttack[];
  /** Fate Director lines: pure luck that keeps the hero standing. {hero}, {boss} available. */
  luckBeats: string[];
  /**
   * "Nick of time" lines: late in a desperate fight, fate turns a hero's attack
   * into the winning blow. {hero}, {boss} available.
   */
  fatedBlows: string[];
  /** Used if the fight runs long: fate ends it in the hero's favour. */
  finale: string[];
  defeat: string[];
  loot: Record<VictoryGrade, string[]>;
}

export const BOSSES: Record<string, BossDef> = {
  dragon_of_ashpeak: {
    templateId: "dragon_of_ashpeak",
    name: "Vorthax the Cinder-Wyrm",
    intro: [
      "The lair mouth breathes heat. Vorthax uncoils from a bed of ash, eyes like forge coals, and regards {hero} with ancient amusement.",
      "Smoke parts. The Cinder-Wyrm lifts its head from the gold-strewn dark and speaks in a voice like shifting stone: 'Another little knight.'",
    ],
    attacks: [
      { id: "claw", name: "Raking Claw", damageFrac: 0.12, special: false, counteredBy: ["shield_wall"], text: "Vorthax rakes at {hero} with talons like scythes.", counterText: "The talons shriek across the raised shield." },
      { id: "tail", name: "Tail Sweep", damageFrac: 0.1, special: false, counteredBy: ["shield_wall", "evade"], text: "The great tail sweeps the cavern floor.", counterText: "{hero} is already clear of the sweep." },
      {
        id: "fire",
        name: "Cinder Breath",
        damageFrac: 0.3,
        special: true,
        telegraph: "Embers glow in the wyrm's throat. It is drawing breath...",
        counteredBy: ["terrain_knowledge", "shield_wall"],
        text: "A river of fire pours across the cavern.",
        counterText: "The fire breaks around {hero} like water around a rock.",
      },
    ],
    luckBeats: [
      "The wyrm's talon catches on a jagged spur of rock and the blow goes wide.",
      "A slab of ceiling gives way between them, and the strike meant for {hero} hammers stone instead.",
      "Vorthax's footing slides on loose gold coins; the attack only grazes {hero}.",
      "A gust from the lair mouth scatters the flames just before they reach {hero}.",
    ],
    fatedBlows: [
      "Vorthax rears to finish it, and in that instant {hero} sees the loose scale over its heart. The blade goes home.",
      "The wyrm lunges; {hero} stumbles, and the stumble carries the blade up beneath its jaw. Vorthax shudders and falls.",
      "Smoke blinds them both, but {hero}'s swing finds the one soft place in the dragon's armour.",
    ],
    finale: [
      "Weakened, Vorthax rears for one last breath, but a shelf of the cavern collapses beneath it. {hero} does not hesitate.",
    ],
    defeat: [
      "With a final roar that shakes the mountain, Vorthax falls. The fires of Ashpeak gutter and go dark.",
      "The Cinder-Wyrm crashes into its hoard and is still. Somewhere below, Emberford's bells begin to ring.",
    ],
    loot: {
      narrow: ["A scorched scale of Vorthax, still warm to the touch"],
      valiant: ["The Emberford Blade, re-forged in dragonfire"],
      legendary: ["The Crown of Ashpeak, taken from the wyrm's hoard"],
    },
  },
  wolves_of_greywood: {
    templateId: "wolves_of_greywood",
    name: "The Pale Alpha",
    intro: [
      "Frost hangs in the hollow. The Pale Alpha steps from the trees, twice the size of any wolf in Hollin's stories, and the pack falls silent behind it.",
    ],
    attacks: [
      { id: "bite", name: "Savage Bite", damageFrac: 0.12, special: false, counteredBy: ["shield_wall"], text: "The Alpha lunges, jaws snapping.", counterText: "Teeth close on the shield's rim and nothing more." },
      { id: "flank", name: "Pack Flank", damageFrac: 0.1, special: false, counteredBy: ["evade"], text: "Two wolves dart in from the sides.", counterText: "{hero} twists free of the flanking pair." },
      {
        id: "howl",
        name: "Frost Howl",
        damageFrac: 0.28,
        special: true,
        telegraph: "The Alpha lifts its head to the moon. The whole pack tenses...",
        counteredBy: ["shield_wall", "evade"],
        text: "The howl rolls through the hollow and the pack charges as one.",
        counterText: "{hero} meets the charge braced and ready; the pack breaks around them.",
      },
    ],
    luckBeats: [
      "A snow-laden branch gives way and buries the lunging wolf.",
      "The Alpha skids on a sheet of hidden ice and its jaws snap on empty air.",
      "An owl bursts from the undergrowth, and the startled wolf veers away from {hero}.",
    ],
    fatedBlows: [
      "The Alpha leaps for the throat, and {hero}'s desperate thrust meets it mid-air.",
      "Cornered against an oak, {hero} strikes blind, and the Pale Alpha crumples in the snow.",
    ],
    finale: ["The Alpha staggers on the frozen stream; the ice cracks beneath it, and {hero} is there."],
    defeat: ["The Pale Alpha falls in the snow. One by one the pack melts back into the Greywood, and does not return."],
    loot: {
      narrow: ["A tuft of the Alpha's silver fur"],
      valiant: ["The Warden's Cloak of Hollin"],
      legendary: ["The Pale Fang, a charm against all beasts of the wood"],
    },
  },
};
