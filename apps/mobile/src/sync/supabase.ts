import "expo-sqlite/localStorage/install";
import { AppState } from "react-native";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Both values are public by design (EXPO_PUBLIC_ is bundled into the app); see .env.example.
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** Null when the build has no Supabase settings (a fresh clone without .env.local): the game still plays offline. */
export const supabase: SupabaseClient | null = url && key
  ? createClient(url, key, {
    auth: {
      // On device, expo-sqlite's localStorage keeps the session across launches; on web it's the browser's.
      storage: localStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  })
  : null;

if (supabase) {
  const client = supabase;
  AppState.addEventListener("change", (state) => {
    if (state === "active") client.auth.startAutoRefresh();
    else client.auth.stopAutoRefresh();
  });
}
