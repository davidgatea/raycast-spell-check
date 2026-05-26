# Spell Check

Spell check any selected text using an AI model and replace it with the corrected version — all without leaving your keyboard.

## How It Works

1. Select text in any application
2. Open Raycast and run **Spell Check**
3. Review the corrected text alongside the original
4. Press Enter to **Accept & Paste** the corrected text back, or copy it to the clipboard

## Setup

This extension requires an API key from any OpenAI-compatible provider.

### Supported Providers

| Provider | Base URL | Example Model |
|----------|----------|---------------|
| [DeepSeek](https://platform.deepseek.com) | `https://api.deepseek.com/v1` | `deepseek-chat` |
| [OpenAI](https://platform.openai.com) | `https://api.openai.com/v1` | `gpt-4o-mini` |
| [Groq](https://console.groq.com) | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` |
| [Together](https://api.together.xyz) | `https://api.together.xyz/v1` | `meta-llama/Llama-3.3-70B-Instruct-Turbo` |

Any provider with an OpenAI-compatible chat completions endpoint will work.

### Configuration

| Preference | Description | Default |
|------------|-------------|---------|
| **API Key** | Your provider's API key | Required |
| **API Base URL** | Base URL for the API endpoint | `https://api.deepseek.com/v1` |
| **Model** | Model name for spell checking | `deepseek-chat` |
| **Max Characters** | Character limit per request (cost guard) | `10000` |

## Actions

| Action | Shortcut | Description |
|--------|----------|-------------|
| Accept & Paste | `Enter` | Pastes corrected text at your cursor position |
| Copy Corrected Text | `Cmd + .` | Copies corrected text to clipboard |
| Copy Original Text | `Cmd + Shift + C` | Copies original text to clipboard |

## Error Handling

The extension provides clear, actionable error messages for common issues:

- **Invalid model name** — shows the provider's supported models and links to preferences
- **Authentication failure** — prompts you to update your API key
- **Rate limiting** — suggests waiting and offers a retry action
- **Connection errors** — checks your base URL and network
- **Text too long** — shows character count and the configured limit

All errors include a **Try Again** action to retry without reopening the command.
