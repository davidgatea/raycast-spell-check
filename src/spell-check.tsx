import {
  Detail,
  ActionPanel,
  Action,
  Color,
  Icon,
  getSelectedText,
  Clipboard,
  showToast,
  Toast,
} from "@raycast/api";
import { useCallback, useEffect, useRef, useState } from "react";
import { spellCheck } from "./lib/api";
import { getPreferences } from "./lib/preferences";
import { ErrorView } from "./lib/errors";

const MAX_CHARS_FALLBACK = 10000;

function escapeMarkdown(text: string): string {
  return text.replace(/([*~`_[\]\\#>|])/g, "\\$1");
}

function buildMarkdown(original: string, corrected: string): string {
  if (corrected === original) {
    return [`## No Changes Needed`, ``, escapeMarkdown(original)].join("\n");
  }

  return [
    `## Corrected`,
    ``,
    escapeMarkdown(corrected),
    ``,
    `---`,
    ``,
    `## Original`,
    ``,
    "```",
    original,
    "```",
  ].join("\n");
}

function ResultMetadata({
  original,
  corrected,
  model,
}: {
  original: string;
  corrected: string;
  model: string;
}) {
  const changed = corrected !== original;

  return (
    <Detail.Metadata>
      <Detail.Metadata.TagList title="Status">
        <Detail.Metadata.TagList.Item
          text={changed ? "Changes found" : "All good"}
          color={changed ? Color.Orange : Color.Green}
        />
      </Detail.Metadata.TagList>
      <Detail.Metadata.Separator />
      <Detail.Metadata.Label
        title="Model"
        text={model}
        icon={Icon.ComputerChip}
      />
      <Detail.Metadata.Label
        title="Words"
        text={`${original.split(/\s+/).filter(Boolean).length}`}
        icon={Icon.Text}
      />
    </Detail.Metadata>
  );
}

export default function Command() {
  const [original, setOriginal] = useState("");
  const [corrected, setCorrected] = useState("");
  const [model, setModel] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError(null);
    setIsLoading(true);
    setCorrected("");

    try {
      const text = await getSelectedText();
      if (!text.trim()) {
        throw new Error("Selected text is empty");
      }

      const prefs = getPreferences();
      const maxChars = prefs.maxCharacters || MAX_CHARS_FALLBACK;
      if (text.length > maxChars) {
        throw new Error(
          `Selection too long (${text.length.toLocaleString()} chars). ` +
            `Maximum is ${maxChars.toLocaleString()}. ` +
            `Select a shorter passage or increase the limit in preferences.`,
        );
      }

      setOriginal(text);
      setModel(prefs.model);

      await showToast({
        style: Toast.Style.Animated,
        title: "Spell checking…",
      });

      const result = await spellCheck(text, prefs, controller.signal);
      setCorrected(result);

      const changed = result !== text;
      await showToast({
        style: Toast.Style.Success,
        title: changed ? "Corrections found" : "No corrections needed",
      });
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setError(e);
      await showToast({ style: Toast.Style.Failure, title: "Failed" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    run();
    return () => abortRef.current?.abort();
  }, [run]);

  if (error) {
    return <ErrorView error={error} onRetry={run} />;
  }

  const changed = corrected !== original;

  return (
    <Detail
      isLoading={isLoading}
      markdown={isLoading ? "" : buildMarkdown(original, corrected)}
      metadata={
        !isLoading && corrected && model ? (
          <ResultMetadata
            original={original}
            corrected={corrected}
            model={model}
          />
        ) : undefined
      }
      actions={
        !isLoading && corrected ? (
          <ActionPanel>
            {changed && (
              <Action
                title="Accept & Paste"
                icon={Icon.CheckCircle}
                onAction={async () => {
                  await Clipboard.paste(corrected);
                  await showToast({
                    style: Toast.Style.Success,
                    title: "Corrected text pasted",
                  });
                }}
              />
            )}
            <Action.CopyToClipboard
              title="Copy Corrected Text"
              content={corrected}
              icon={Icon.Clipboard}
            />
            <Action.CopyToClipboard
              title="Copy Original Text"
              content={original}
              icon={Icon.Document}
              shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
            />
          </ActionPanel>
        ) : undefined
      }
    />
  );
}
