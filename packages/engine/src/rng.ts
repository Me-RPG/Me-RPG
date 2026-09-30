import { cyrb128 } from "./hash.js";

/**
 * xoshiro128** seeded PRNG. The engine's only source of randomness.
 * Streams are derived by name (`fork("battle.turn3")`) so adding a new draw
 * in one place never shifts the sequence seen elsewhere.
 */
export class Rng {
  private s: [number, number, number, number];
  private readonly seedKey: string;

  constructor(seedKey: string) {
    this.seedKey = seedKey;
    this.s = cyrb128(seedKey);
    if ((this.s[0] | this.s[1] | this.s[2] | this.s[3]) === 0) this.s[0] = 1;
  }

  static from(...parts: Array<string | number>): Rng {
    return new Rng(parts.join("|"));
  }

  fork(label: string): Rng {
    return new Rng(`${this.seedKey}/${label}`);
  }

  /** Uniform integer in [0, 2^32). */
  nextU32(): number {
    const s = this.s;
    const result = Math.imul(rotl(Math.imul(s[1], 5), 7), 9) >>> 0;
    const t = s[1] << 9;
    s[2] ^= s[0];
    s[3] ^= s[1];
    s[1] ^= s[2];
    s[0] ^= s[3];
    s[2] ^= t;
    s[3] = rotl(s[3], 11);
    return result;
  }

  /** Uniform float in [0, 1). */
  next(): number {
    return this.nextU32() / 4294967296;
  }

  /** Uniform integer in [min, max] inclusive. */
  int(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  chance(p: number): boolean {
    return this.next() < p;
  }

  pick<T>(items: readonly T[]): T {
    if (items.length === 0) throw new Error("pick from empty list");
    return items[Math.floor(this.next() * items.length)] as T;
  }

  weighted<T>(items: ReadonlyArray<readonly [T, number]>): T {
    const total = items.reduce((sum, [, w]) => sum + w, 0);
    let r = this.next() * total;
    for (const [item, w] of items) {
      r -= w;
      if (r < 0) return item;
    }
    return items[items.length - 1]![0];
  }
}

function rotl(x: number, k: number): number {
  return (x << k) | (x >>> (32 - k));
}
