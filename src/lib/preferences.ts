import { getPreferenceValues } from "@raycast/api";

interface RawPreferences {
  apiKey: string;
  baseUrl: string;
  model: string;
  maxCharacters: string;
}

export interface Preferences {
  apiKey: string;
  baseUrl: string;
  model: string;
  maxCharacters: number;
}

export function getPreferences(): Preferences {
  const prefs = getPreferenceValues<RawPreferences>();
  return {
    ...prefs,
    baseUrl: prefs.baseUrl.replace(/\/+$/, ""),
    maxCharacters: parseInt(prefs.maxCharacters, 10) || 10000,
  };
}
