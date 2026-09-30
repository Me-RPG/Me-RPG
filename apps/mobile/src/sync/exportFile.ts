import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

/** Native: write the export to the cache and open the share sheet (save to Files, email, etc.). */
export async function saveExport(name: string, json: string): Promise<void> {
  const file = new File(Paths.cache, name);
  file.create({ overwrite: true });
  file.write(json);
  if (!(await Sharing.isAvailableAsync())) throw new Error("Sharing isn't available on this device.");
  await Sharing.shareAsync(file.uri, { mimeType: "application/json", UTI: "public.json", dialogTitle: "Your Me RPG data" });
}
