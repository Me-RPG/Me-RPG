import type { CapacityParams } from "@me-rpg/fitness-model";
import type { EpochDay } from "./events.js";

/**
 * One physiological capacity. `fitness` is the modeled real gain above
 * baseline and drives quest difficulty. `displayFitness` is what the
 * character sheet shows; it tracks `fitness` except that Sanctuary shields
 * it from decay. After Sanctuary the displayed value holds while real fitness
 * retrains up to it, so a returning player never watches stats fall while training.
 */
export interface CapacityState {
  baseline: number;
  fitness: number;
  displayFitness: number;
  fatigue: number;
  peak: number;
  /** Rolling (~weekly) load; reaching minStimulusLoad counts as a maintaining dose. */
  stimulusBank: number;
  lastStimulusDay: EpochDay;
  displayLastStimulusDay: EpochDay;
}

export function initialCapacity(baseline: number, day: EpochDay): CapacityState {
  return {
    baseline,
    fitness: 0,
    displayFitness: 0,
    fatigue: 0,
    peak: 0,
    stimulusBank: 0,
    lastStimulusDay: day,
    displayLastStimulusDay: day,
  };
}

/** Maintenance is judged on roughly a week of accumulated load, not a single session. */
const STIMULUS_BANK_TAU_DAYS = 7;

function decayToward(value: number, floor: number, tauDays: number): number {
  if (value <= floor) return value;
  return Math.max(floor, value * Math.exp(-1 / tauDays));
}

/** Advance one day. Inside the grace window nothing decays, so normal rest is free. */
export function tickCapacity(
  c: CapacityState,
  day: EpochDay,
  p: CapacityParams,
  inSanctuary: boolean,
): CapacityState {
  const floor = p.retainedFloorFrac * c.peak;
  const fatigue = c.fatigue * Math.exp(-1 / p.tauFatigueDays);
  const stimulusBank = c.stimulusBank * Math.exp(-1 / STIMULUS_BANK_TAU_DAYS);

  const fitness = day - c.lastStimulusDay > p.graceDays
    ? decayToward(c.fitness, floor, p.tauFitnessDays)
    : c.fitness;

  const displayLastStimulusDay = inSanctuary ? day : c.displayLastStimulusDay;
  const decayedDisplay = day - displayLastStimulusDay > p.graceDays
    ? decayToward(c.displayFitness, floor, p.tauFitnessDays)
    : c.displayFitness;
  const displayFitness = Math.max(decayedDisplay, fitness);

  return { ...c, fatigue, stimulusBank, fitness, displayFitness, displayLastStimulusDay };
}

/** Apply training load (already allocated to this capacity). */
export function stimulateCapacity(c: CapacityState, load: number, day: EpochDay, p: CapacityParams): CapacityState {
  if (load <= 0) return c;
  const retrain = c.fitness < c.peak ? p.retrainingMultiplier : 1;
  const room = Math.max(0, 1 - c.fitness / p.diminishingCeiling);
  const gain = load * p.gainPerLoad * retrain * room;
  const fitness = c.fitness + gain;
  const stimulusBank = c.stimulusBank + load;
  const meaningful = stimulusBank >= p.minStimulusLoad;
  return {
    ...c,
    fitness,
    // While a Sanctuary shield exceeds real fitness, the display holds until real catches up.
    displayFitness: Math.max(fitness, c.displayFitness),
    fatigue: c.fatigue + load * p.fatiguePerLoad,
    peak: Math.max(c.peak, fitness),
    stimulusBank,
    lastStimulusDay: meaningful ? day : c.lastStimulusDay,
    displayLastStimulusDay: meaningful ? day : c.displayLastStimulusDay,
  };
}

export const realValue = (c: CapacityState): number => c.baseline + c.fitness;
export const displayValue = (c: CapacityState): number => c.baseline + c.displayFitness;
