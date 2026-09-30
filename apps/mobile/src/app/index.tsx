import { Redirect } from "expo-router";
import { useGame } from "../game/store";

/** Entry: new players go to onboarding, everyone else to the quest board. */
export default function Index() {
  const hasHero = useGame((s) => s.state.character !== null);
  return <Redirect href={hasHero ? "/quests" : "/onboarding"} />;
}
