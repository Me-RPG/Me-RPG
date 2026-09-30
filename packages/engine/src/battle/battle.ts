import type { BossAttack, BossDef, VictoryGrade } from "@healthrpg/content";
import { Rng } from "../rng.js";
import type { EngineContext } from "../rules.js";
import { potency } from "../skills.js";
import type { GameState } from "../state.js";
import { characterStats } from "../stats.js";
import type { QuestlineState } from "../quests/types.js";

/**
 * Battle tuning (design; see the balance report in outputs/balance/).
 * The hero can fall to 1 HP. The guarantee is hidden behind real tension:
 * luck saves only a lethal blow, fate can land a "nick of time" finishing
 * strike late in a desperate fight, and a fight that drags ends by fate at TURN_CAP.
 */
export const BATTLE = {
  /** The fight is sized to end in about this many plain strikes. */
  targetTurns: 9,
  /** Fate ends the fight in the hero's favour if it runs this long. */
  turnCap: 16,
  /** Fate never lets health drop below this. */
  hpFloor: 1,
  /** Every Nth turn the boss's special lands (telegraphed the turn before). */
  specialEvery: 3,
  critChance: 0.12,
  critMult: 1.75,
  /** Nick-of-time finishing blows become possible from this turn. */
  nickOfTimeFromTurn: 9,
  /** Chance per damaging action once the hero is desperate (at or below `desperateFrac` health). */
  nickOfTimeChance: 0.15,
  /** Higher chance when the hero is hanging on by a thread. */
  nickOfTimeChanceCritical: 0.35,
  desperateFrac: 0.3,
  criticalFrac: 0.1,
  heroHpBase: 60,
  /** Legend scaling: per class-tree skill unlocked beyond the roots, the boss gains this much health and damage. */
  legendHpPerSkill: 0.06,
  legendDmgPerSkill: 0.05,
  bossDamageScale: 1.4,
} as const;

export const BASE_ACTIONS = ["strike", "guard"] as const;
export type BattleAction = (typeof BASE_ACTIONS)[number] | string;

type Defense = "none" | "guard" | "shield_wall" | "evade" | "terrain_knowledge";

export interface BattleSkill {
  rank: number;
  potency: number;
}

export interface BattleState {
  turn: number;
  heroHp: number;
  heroMaxHp: number;
  /** Lowest health reached, for the balance report. */
  heroMinHp: number;
  stamina: number;
  staminaMax: number;
  baseDamage: number;
  bossHp: number;
  bossMaxHp: number;
  /** Legend scaling applied to boss damage. */
  bossDamageMult: number;
  /** Class-tree skills (beyond roots) the hero brought to this fight. */
  legend: number;
  /** Skills available in this fight, snapshotted at the start (rank and sharpness). */
  skills: Record<string, BattleSkill>;
  nextAttackId: string;
  highGround: boolean;
  /** Hunter's Mark: attacks left with a boosted critical chance. */
  markedStrikes: number;
  /** Rage: turns of fury left. */
  rageTurns: number;
  cooldowns: Record<string, number>;
  usedOnce: string[];
  /** Times fate intervened: lethal saves, nick-of-time blows, the turn-cap finale. */
  luck: number;
  crits: number;
  nickOfTime: boolean;
  intro: string;
  /** Narration, one array of lines per resolved turn. */
  log: string[][];
  outcome: { grade: VictoryGrade; loot: string; turns: number } | null;
}

function bossFor(q: QuestlineState, ctx: EngineContext): BossDef {
  const boss = ctx.content.bosses[q.plan.templateId];
  if (!boss) throw new Error(`no boss for ${q.plan.templateId}`);
  return boss;
}

const fill = (text: string, hero: string, boss: BossDef) => text.replace(/\{hero\}/g, hero).replace(/\{boss\}/g, boss.name);

function rngFor(state: GameState, q: QuestlineState, turn: number): Rng {
  return Rng.from(state.character?.userId ?? "", q.plan.questlineId, "battle", turn);
}

function chooseAttack(boss: BossDef, turn: number, rng: Rng): BossAttack {
  const specials = boss.attacks.filter((a) => a.special);
  if ((turn + 1) % BATTLE.specialEvery === 0 && specials.length > 0) return rng.pick(specials);
  return rng.pick(boss.attacks.filter((a) => !a.special));
}

/** Hero numbers and skills come from the character at the moment the fight begins. */
export function startBattle(state: GameState, q: QuestlineState, ctx: EngineContext): BattleState {
  const boss = bossFor(q, ctx);
  const stats = characterStats(state, ctx);
  const baseHp = BATTLE.heroHpBase + 2 * stats.VIT + stats.END;
  const baseDamage = 8 + stats.STR / 3;
  const rng = rngFor(state, q, 0);
  const skills: Record<string, BattleSkill> = {};
  for (const [id, sk] of Object.entries(state.skills)) {
    if (ctx.content.abilities[id]) skills[id] = { rank: sk.rank, potency: Math.round(potency(sk, state.day) * 100) / 100 };
  }
  // Legend: class-tree skills beyond each tree's root. Foes grow with the hero.
  const legend = Object.values(ctx.content.classes).reduce((n, c) => n + c.tree.slice(1).filter((node) => skills[node.abilityId]).length, 0);
  // Passives from class trees.
  const pot = (id: string) => skills[id]?.potency ?? 0;
  const staminaMax = 8 + Math.round(stats.END / 6) + Math.round(3 * pot("fleet_foot"));
  const heroMaxHp = Math.round(baseHp * (1 + 0.08 * pot("endure")));
  return {
    turn: 0,
    heroHp: heroMaxHp,
    heroMaxHp,
    heroMinHp: heroMaxHp,
    stamina: staminaMax,
    staminaMax,
    baseDamage: Math.round(baseDamage * 10) / 10,
    bossHp: Math.round(baseDamage * BATTLE.targetTurns * (1 + BATTLE.legendHpPerSkill * legend)),
    bossMaxHp: Math.round(baseDamage * BATTLE.targetTurns * (1 + BATTLE.legendHpPerSkill * legend)),
    bossDamageMult: Math.round((1 + BATTLE.legendDmgPerSkill * legend) * 100) / 100,
    legend,
    markedStrikes: 0,
    rageTurns: 0,
    skills,
    nextAttackId: chooseAttack(boss, 0, rng.fork("attack")).id,
    highGround: false,
    cooldowns: {},
    usedOnce: [],
    luck: 0,
    crits: 0,
    nickOfTime: false,
    intro: fill(rng.fork("intro").pick(boss.intro), state.character?.name ?? "The hero", boss),
    log: [],
    outcome: null,
  };
}

/** Actions the hero can take right now: strike, guard, and ready skills. */
export function availableActions(b: BattleState, ctx: EngineContext): BattleAction[] {
  const out: BattleAction[] = [...BASE_ACTIONS];
  for (const id of Object.keys(b.skills).sort()) {
    const a = ctx.content.abilities[id];
    if (!a || a.kind !== "active") continue;
    if ((b.cooldowns[id] ?? 0) > 0 || b.stamina < a.staminaCost) continue;
    if (a.oncePerBattle && b.usedOnce.filter((u) => u === id).length >= usesAllowed(b, id)) continue;
    out.push(id);
  }
  return out;
}

/** The Long Road lets Second Wind be used twice. */
function usesAllowed(b: BattleState, id: string): number {
  return id === "second_wind" && b.skills.long_road ? 2 : 1;
}

/** The telegraph line for the incoming special, if any. */
export function incomingWarning(b: BattleState, q: QuestlineState, ctx: EngineContext): string | null {
  const atk = bossFor(q, ctx).attacks.find((a) => a.id === b.nextAttackId);
  return atk?.special ? (atk.telegraph ?? `${atk.name} is coming.`) : null;
}

export function battleTurn(state: GameState, q: QuestlineState, action: BattleAction, ctx: EngineContext): BattleState {
  const b = q.battle;
  if (!b) throw new Error("no battle in progress");
  if (b.outcome) throw new Error("the battle is already won");
  if (!availableActions(b, ctx).includes(action)) throw new Error(`action ${action} is not available`);

  const boss = bossFor(q, ctx);
  const hero = state.character?.name ?? "The hero";
  const turn = b.turn + 1;
  const rng = rngFor(state, q, turn);
  const lines: string[] = [];
  let { heroHp, stamina, bossHp, highGround, luck, crits, nickOfTime, markedStrikes } = b;
  let rageTurns = Math.max(0, b.rageTurns - 1);
  const cooldowns: Record<string, number> = {};
  for (const [k, v] of Object.entries(b.cooldowns)) if (v > 1) cooldowns[k] = v - 1;
  const usedOnce = [...b.usedOnce];
  const pot = (id: string) => b.skills[id]?.potency ?? 1;
  const has = (id: string) => b.skills[id] !== undefined;
  const shed = has("unbroken") ? 0.5 - 0.2 * Math.min(1.2, pot("unbroken")) : 0.5;
  const rank = (id: string) => b.skills[id]?.rank ?? 1;
  let defense: Defense = "none";
  let draws = 0;

  // Nick of time: late in a desperate fight, fate can make this attack the winning blow.
  const desperate = turn >= BATTLE.nickOfTimeFromTurn && heroHp <= b.heroMaxHp * BATTLE.desperateFrac;
  const nickChance = heroHp <= b.heroMaxHp * BATTLE.criticalFrac ? BATTLE.nickOfTimeChanceCritical : BATTLE.nickOfTimeChance;

  const strike = (mult: number, label: string) => {
    const r = rng.fork(`strike${draws++}`);
    if (desperate && !nickOfTime && r.chance(nickChance)) {
      nickOfTime = true;
      luck++;
      bossHp = 0;
      lines.push(fill(r.fork("fated").pick(boss.fatedBlows), hero, boss));
      return;
    }
    const critChance = markedStrikes > 0 ? Math.min(0.9, BATTLE.critChance + 0.55 * pot("hunters_mark")) : BATTLE.critChance;
    if (markedStrikes > 0) markedStrikes--;
    const crit = r.fork("crit").chance(critChance);
    const high = highGround ? 1 + 0.75 * pot("terrain_knowledge") : 1;
    const fury = rageTurns > 0 || action === "rage" ? 1 + 0.6 * pot("rage") * (1 - heroHp / b.heroMaxHp) : 1;
    const dmg = Math.max(1, Math.round(b.baseDamage * mult * (0.85 + 0.3 * r.fork("dmg").next()) * high * fury * (crit ? BATTLE.critMult : 1)));
    if (highGround) lines.push(`From the high ground, ${hero} strikes down with extra force.`);
    if (crit) {
      crits++;
      lines.push("A critical blow!");
      if (has("bloodlust")) {
        const heal = Math.round(b.heroMaxHp * 0.06 * pot("bloodlust"));
        heroHp = Math.min(b.heroMaxHp, heroHp + heal);
        lines.push(`Bloodlust: ${hero} recovers ${heal} health.`);
      }
    }
    highGround = false;
    bossHp = Math.max(0, bossHp - dmg);
    lines.push(`${label} ${boss.name} takes ${dmg} damage.`);
  };

  // 1. The hero acts.
  const ability = ctx.content.abilities[action];
  if (ability) {
    stamina -= ability.staminaCost;
    if (ability.cooldown > 0) cooldowns[action] = ability.cooldown;
    if (ability.oncePerBattle) usedOnce.push(action);
    lines.push(fill(ability.text, hero, boss));
  }
  switch (action) {
    case "strike":
      stamina = Math.min(b.staminaMax, stamina + 1);
      strike(1, `${hero} strikes.`);
      break;
    case "guard":
      stamina = Math.min(b.staminaMax, stamina + 2);
      defense = "guard";
      lines.push(`${hero} steadies their guard and catches their breath.`);
      break;
    case "heavy_strike":
      strike(2 * pot(action), "The blow lands like a hammer on an anvil.");
      break;
    case "stamina_surge":
      strike(pot(action), "The first cut lands.");
      if (bossHp > 0) strike(pot(action), "Then the second.");
      break;
    case "crushing_blow":
      strike(2.5 * pot(action), "The ground shakes with the blow.");
      break;
    case "hunters_mark":
      markedStrikes = 2;
      strike(1, `${hero} follows the mark with a quick strike.`);
      break;
    case "rage":
      rageTurns = 3;
      strike(1, `${hero} lashes out in fury.`);
      break;
    case "rally":
      heroHp = Math.min(b.heroMaxHp, heroHp + Math.round(b.heroMaxHp * 0.1 * pot(action)));
      stamina = Math.min(b.staminaMax, stamina + 4);
      defense = "guard";
      break;
    case "second_wind":
      heroHp = Math.min(b.heroMaxHp, heroHp + Math.round(b.heroMaxHp * 0.35 * pot(action)));
      stamina = b.staminaMax;
      break;
    case "shield_wall":
    case "evade":
    case "terrain_knowledge":
      defense = action;
      if (action === "terrain_knowledge") highGround = true;
      break;
  }

  const won = (reason: string[] = []): BattleState => {
    const grade: VictoryGrade = luck === 0 ? "legendary" : luck <= 2 ? "valiant" : "narrow";
    const loot = rng.fork("loot").pick(boss.loot[grade]);
    return {
      ...b, turn, heroHp, stamina, bossHp: 0, highGround, cooldowns, usedOnce, luck, crits, nickOfTime, markedStrikes, rageTurns,
      log: [...b.log, [...lines, ...reason, fill(rng.fork("defeat").pick(boss.defeat), hero, boss)]],
      outcome: { grade, loot, turns: turn },
    };
  };
  if (bossHp <= 0) return won();

  // 2. The boss answers with the attack it telegraphed.
  const atk = boss.attacks.find((a) => a.id === b.nextAttackId) ?? boss.attacks[0]!;
  lines.push(fill(atk.text, hero, boss));
  let dmg = Math.round(atk.damageFrac * BATTLE.bossDamageScale * b.bossDamageMult * b.heroMaxHp * (0.85 + 0.3 * rng.fork("boss").next()));
  if (defense !== "none" && defense !== "guard" && atk.counteredBy.includes(defense)) {
    dmg = 0;
    lines.push(fill(atk.counterText ?? `${hero} is ready for it.`, hero, boss));
    if (defense === "shield_wall" && rank("shield_wall") >= 3) stamina = Math.min(b.staminaMax, stamina + 1);
  } else if (defense === "evade") {
    dmg = Math.round(dmg * Math.max(0.1, shed - 0.1 * (rank("evade") - 1)));
    lines.push(`${hero} twists aside; the blow only grazes.`);
  } else if (defense !== "none") {
    dmg = Math.round(dmg * shed);
    lines.push(`${hero}'s defense turns aside much of the force.`);
  }
  if (dmg > 0 && has("iron_hide")) dmg = Math.round(dmg * (1 - 0.06 * pot("iron_hide")));
  // Fleet Foot: a Ranger sometimes slips the worst of a blow.
  if (dmg > 0 && has("fleet_foot") && rng.fork("fleet").chance(0.15 * pot("fleet_foot"))) {
    dmg = Math.round(dmg * 0.5);
    lines.push(`${hero} is already moving; the blow only half lands.`);
  }

  // 3. The Fate Director saves only a lethal blow. The hero can be left on 1 HP.
  if (dmg > 0 && heroHp - dmg < BATTLE.hpFloor) {
    dmg = Math.max(0, heroHp - BATTLE.hpFloor);
    luck++;
    lines.push(fill(rng.fork("luck").pick(boss.luckBeats), hero, boss));
  }
  heroHp -= dmg;
  if (dmg > 0) lines.push(`${hero} takes ${dmg} damage.`);
  const heroMinHp = Math.min(b.heroMinHp, heroHp);

  // 4. A fight that runs long ends by fate, in the hero's favour.
  if (turn >= BATTLE.turnCap) {
    luck++;
    return { ...won([fill(rng.fork("finale").pick(boss.finale), hero, boss)]), heroMinHp };
  }

  const next = chooseAttack(boss, turn, rng.fork("attack"));
  return {
    ...b, turn, heroHp, heroMinHp, stamina, bossHp, highGround, cooldowns, usedOnce, luck, crits, nickOfTime, markedStrikes, rageTurns,
    nextAttackId: next.id,
    log: [...b.log, lines],
  };
}
