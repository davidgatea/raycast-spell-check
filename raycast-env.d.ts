/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** API Key - API key for your OpenAI-compatible provider (OpenAI, DeepSeek, Groq, etc.) */
  "apiKey": string,
  /** API Base URL - Base URL for the API endpoint */
  "baseUrl": string,
  /** Model - Model name to use for spell checking */
  "model": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `spell-check` command */
  export type SpellCheck = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `spell-check` command */
  export type SpellCheck = {}
}

