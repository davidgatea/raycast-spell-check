import { getPreferenceValues } from "@raycast/api";

export interface Preferences {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export function getPreferences(): Preferences {
  const prefs = getPreferenceValues<Preferences>();
  return {
    ...prefs,
    baseUrl: prefs.baseUrl.replace(/\/+$/, ""),
  };
}
