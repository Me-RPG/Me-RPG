import { describe, expect, it } from "vitest";
import { DEFAULT_PARAMS } from "@healthrpg/fitness-model";
import { DEFAULT_CONTENT, lintContent } from "@healthrpg/content";

describe("content lint", () => {
  it("shipped content passes every cohesion check", () => {
    expect(lintContent(DEFAULT_CONTENT, DEFAULT_PARAMS)).toEqual([]);
  });

  it("catches a boss mechanic that nothing trains", () => {
    const dragon = DEFAULT_CONTENT.questlines.dragon_of_ashpeak!;
    const broken = {
      ...DEFAULT_CONTENT,
      questlines: { x: { ...dragon, id: "x", bossMechanics: [...dragon.bossMechanics, "fly"] } },
    };
    expect(lintContent(broken, DEFAULT_PARAMS)).toContain("x: boss mechanic fly is never trained");
  });
});
