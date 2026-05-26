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
import { useState, useEffect } from "react";
import { spellCheck } from "./lib/api";
import { getPreferences, Preferences } from "./lib/preferences";
import { ErrorView } from "./lib/errors";

function buildMarkdown(original: string, corrected: string): string {
  if (corrected === original) {
    return [`## No Changes Needed`, ``, original].join("\n");
  }

  return [
    `## Corrected`,
    ``,
    corrected,
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
  prefs,
}: {
  original: string;
  corrected: string;
  prefs: Preferences;
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
        text={prefs.model}
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
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    run();
  }, []);

  async function run() {
    try {
      const text = await getSelectedText();
      if (!text.trim()) {
        throw new Error("Unable to get selected text");
      }
      setOriginal(text);

      await showToast({
        style: Toast.Style.Animated,
        title: "Spell checking…",
      });

      const p = getPreferences();
      setPrefs(p);
      const result = await spellCheck(text, p);
      setCorrected(result);

      const changed = result !== text;
      await showToast({
        style: Toast.Style.Success,
        title: changed ? "Corrections found" : "No corrections needed",
      });
    } catch (e) {
      setError(e);
      await showToast({ style: Toast.Style.Failure, title: "Failed" });
    } finally {
      setIsLoading(false);
    }
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  const changed = corrected !== original;

  return (
    <Detail
      isLoading={isLoading}
      markdown={isLoading ? "" : buildMarkdown(original, corrected)}
      metadata={
        !isLoading && corrected && prefs ? (
          <ResultMetadata
            original={original}
            corrected={corrected}
            prefs={prefs}
          />
        ) : undefined
      }
      actions={
        !isLoading && corrected ? (
          <ActionPanel>
            {changed && (
              <Action
                title="Accept & Replace"
                icon={Icon.CheckCircle}
                onAction={async () => {
                  await Clipboard.paste(corrected);
                  await showToast({
                    style: Toast.Style.Success,
                    title: "Text replaced",
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
