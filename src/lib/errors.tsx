import {
  Detail,
  ActionPanel,
  Action,
  openExtensionPreferences,
  Icon,
} from "@raycast/api";
import { ApiError } from "./api";

interface ErrorInfo {
  title: string;
  message: string;
  fixable: boolean;
}

function diagnose(error: unknown): ErrorInfo {
  if (error instanceof ApiError) {
    if (error.isAuthError) {
      return {
        title: "Authentication Failed",
        message:
          `Your API key was rejected by the provider.\n\n` +
          `> ${error.message}\n\n` +
          `Open extension preferences to update your API key.`,
        fixable: true,
      };
    }

    if (error.isModelError) {
      return {
        title: "Invalid Model",
        message:
          `The model name you configured is not supported by the provider.\n\n` +
          `> ${error.message}\n\n` +
          `Open extension preferences to update the model name.`,
        fixable: true,
      };
    }

    if (error.isRateLimitError) {
      return {
        title: "Rate Limited",
        message:
          `You've hit the API rate limit. Wait a moment and try again.\n\n` +
          `> ${error.message}`,
        fixable: false,
      };
    }

    if (error.isConnectionError) {
      return {
        title: "Connection Failed",
        message:
          `Could not connect to the API.\n\n` +
          `> ${error.message}\n\n` +
          `Check that the API Base URL in preferences is correct and that you have internet access.`,
        fixable: true,
      };
    }

    return {
      title: "API Error",
      message: `> ${error.message}`,
      fixable: true,
    };
  }

  const msg = error instanceof Error ? error.message : String(error);

  if (msg.includes("Unable to get selected text")) {
    return {
      title: "No Text Selected",
      message:
        "Select some text in another application first, then run this command.\n\n" +
        "**Tip:** Use ⌘A to select all text, or click and drag to select a portion.",
      fixable: false,
    };
  }

  if (msg.includes("Selected text is empty")) {
    return {
      title: "Empty Selection",
      message:
        "The selected text is empty or contains only whitespace.\n\n" +
        "Select some text with content and try again.",
      fixable: false,
    };
  }

  if (msg.includes("Selection too long")) {
    return {
      title: "Text Too Long",
      message: msg,
      fixable: true,
    };
  }

  return {
    title: "Unexpected Error",
    message: `> ${msg}`,
    fixable: false,
  };
}

export function ErrorView({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry?: () => void;
}) {
  const info = diagnose(error);
  const markdown = `## ${info.title}\n\n${info.message}`;

  return (
    <Detail
      markdown={markdown}
      actions={
        <ActionPanel>
          {onRetry && (
            <Action
              title="Try Again"
              icon={Icon.RotateClockwise}
              onAction={onRetry}
            />
          )}
          {info.fixable && (
            <Action
              title="Open Preferences"
              icon={Icon.Gear}
              onAction={openExtensionPreferences}
              shortcut={{ modifiers: ["cmd"], key: "," }}
            />
          )}
        </ActionPanel>
      }
    />
  );
}
