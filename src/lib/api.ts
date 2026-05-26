import { Preferences } from "./preferences";

interface ChatResponse {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string; type?: string };
}

const SYSTEM_PROMPT =
  "You are a spell checker. Fix spelling, grammar, and punctuation errors in the user's text. " +
  "Return ONLY the corrected text with no explanations, no preamble, no quotes. " +
  "Preserve the original meaning, tone, formatting, and line breaks. " +
  "If the text is already correct, return it unchanged.";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly apiType?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isAuthError(): boolean {
    return this.statusCode === 401 || this.statusCode === 403;
  }

  get isModelError(): boolean {
    return (
      this.statusCode === 400 &&
      (this.message.toLowerCase().includes("model") ||
        this.apiType === "invalid_request_error")
    );
  }

  get isRateLimitError(): boolean {
    return this.statusCode === 429;
  }

  get isConnectionError(): boolean {
    return this.statusCode === 0;
  }
}

export async function spellCheck(
  text: string,
  prefs: Preferences,
): Promise<string> {
  const url = `${prefs.baseUrl}/chat/completions`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${prefs.apiKey}`,
      },
      body: JSON.stringify({
        model: prefs.model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: text },
        ],
        temperature: 0,
      }),
    });
  } catch (e) {
    throw new ApiError(
      e instanceof Error ? e.message : "Failed to connect to API",
      0,
    );
  }

  if (!res.ok) {
    let apiMessage = `HTTP ${res.status}`;
    let apiType: string | undefined;
    try {
      const body = (await res.json()) as ChatResponse;
      if (body.error) {
        apiMessage = body.error.message ?? apiMessage;
        apiType = body.error.type;
      }
    } catch {
      apiMessage = (await res.text()) || apiMessage;
    }
    throw new ApiError(apiMessage, res.status, apiType);
  }

  const data = (await res.json()) as ChatResponse;

  if (data.error) {
    throw new ApiError(
      data.error.message ?? "Unknown API error",
      400,
      data.error.type,
    );
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new ApiError("No response content from model", 502);
  }

  return content;
}
