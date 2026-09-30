import type { Grammar } from "@me-rpg/content";
import { Rng } from "../rng.js";

const MAX_DEPTH = 8;

/**
 * Expand a Tracery-style template. `#symbol#` picks a line from the grammar
 * (seeded by the symbol's position, so edits elsewhere don't reshuffle it);
 * `{slot}` is replaced from `slots`. Unknown slots are left visible so gaps
 * show up in review instead of silently disappearing.
 */
export function expand(template: string, grammar: Grammar, slots: Record<string, string>, rng: Rng, depth = 0): string {
  if (depth > MAX_DEPTH) throw new Error(`grammar recursion too deep at: ${template}`);
  let n = 0;
  const withSymbols = template.replace(/#([a-z_.]+)#/g, (_, sym: string) => {
    const lines = grammar[sym];
    if (!lines || lines.length === 0) throw new Error(`grammar symbol #${sym}# is undefined`);
    const r = rng.fork(`${sym}:${n++}`);
    return expand(r.pick(lines), grammar, slots, r, depth + 1);
  });
  return withSymbols.replace(/\{([a-zA-Z]+)\}/g, (whole, key: string) => slots[key] ?? whole);
}

/** Join sentences, dropping empties and tidying spacing and capitalisation. */
export function sentences(parts: string[]): string {
  return parts
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ")
    .replace(/\s+/g, " ");
}
