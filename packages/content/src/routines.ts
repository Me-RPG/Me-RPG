import type { RoutineDef } from "./types.js";

export const ROUTINES: Record<string, RoutineDef> = {
  squires_drill: {
    id: "squires_drill",
    name: "The Squire's Drill",
    nominalMinutes: 30,
    equipment: "none",
    exercises: [
      { name: "Bodyweight squat", sets: 2, reps: 12, cue: "Sit back as if onto a low stool; stop 2-3 reps short of failure." },
      { name: "Push-up (knees or incline allowed)", sets: 2, reps: 10, cue: "Body in one line; lower with control." },
      { name: "Glute bridge", sets: 2, reps: 12, cue: "Squeeze at the top for a breath." },
      { name: "Backpack row", sets: 2, reps: 12, cue: "Hinge forward, pull the pack to your ribs." },
      { name: "Plank", sets: 2, seconds: 30, cue: "Breathe steadily; stop if your back sags." },
    ],
  },
  forge_session: {
    id: "forge_session",
    name: "The Blacksmith's Forge",
    nominalMinutes: 45,
    equipment: "gym",
    exercises: [
      { name: "Goblet squat", sets: 3, reps: 10, cue: "Leave 2-3 reps in reserve." },
      { name: "Romanian deadlift", sets: 3, reps: 10, cue: "Hinge at the hips, flat back." },
      { name: "Dumbbell bench press", sets: 3, reps: 10, cue: "Controlled lowering." },
      { name: "Seated cable row", sets: 3, reps: 12, cue: "Shoulders down and back." },
      { name: "Farmer's carry", sets: 3, seconds: 40, cue: "Tall posture, steady steps." },
    ],
  },
  shieldbearers_circuit: {
    id: "shieldbearers_circuit",
    name: "The Shieldbearer's Circuit",
    nominalMinutes: 30,
    equipment: "home",
    exercises: [
      { name: "Step-up (stair or sturdy box)", sets: 3, reps: 10, cue: "Drive through the whole foot." },
      { name: "Wall-sit", sets: 3, seconds: 30, cue: "Knees over ankles." },
      { name: "Dead bug", sets: 3, reps: 10, cue: "Low back stays down." },
      { name: "Band pull-apart or towel row", sets: 3, reps: 15, cue: "Slow and even." },
    ],
  },
  monks_stretch: {
    id: "monks_stretch",
    name: "The Monk's Stretch",
    nominalMinutes: 20,
    equipment: "none",
    exercises: [
      { name: "Cat-cow", sets: 1, reps: 10, cue: "Move with the breath." },
      { name: "Hip flexor lunge stretch", sets: 2, seconds: 45, cue: "Each side; tuck the pelvis." },
      { name: "Hamstring stretch", sets: 2, seconds: 45, cue: "Each side; no bouncing." },
      { name: "Thoracic rotation", sets: 2, reps: 8, cue: "Each side, slow." },
      { name: "Calf stretch", sets: 2, seconds: 45, cue: "Each side, heel down." },
    ],
  },
  rangers_flow: {
    id: "rangers_flow",
    name: "The Ranger's Flow",
    nominalMinutes: 30,
    equipment: "none",
    exercises: [
      { name: "Sun salutation (gentle)", sets: 3, reps: 1, cue: "Match movement to breath." },
      { name: "Warrior II", sets: 2, seconds: 30, cue: "Each side." },
      { name: "Low lunge twist", sets: 2, seconds: 30, cue: "Each side." },
      { name: "Pigeon or figure-four", sets: 2, seconds: 45, cue: "Each side, ease in." },
      { name: "Child's pose", sets: 1, seconds: 60, cue: "Rest and breathe." },
    ],
  },
};

/** Scale a routine's sets to a target duration (min 1 set; at most double). */
export function scaledRoutine(routine: RoutineDef, minutes: number): RoutineDef {
  const factor = Math.min(2, Math.max(0.5, minutes / routine.nominalMinutes));
  return {
    ...routine,
    exercises: routine.exercises.map((e) => ({ ...e, sets: Math.max(1, Math.round(e.sets * factor)) })),
  };
}
