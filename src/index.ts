import * as core from "@actions/core";
import * as github from "@actions/github";

function parseBlockedLabels(labelsInput: string): string[] {
  const normalizedInput = labelsInput.replace(/\r\n/g, "\n").trim();

  if (normalizedInput.length === 0) {
    return [];
  }

  // Labels are newline-delimited so label names can safely contain commas.
  const rawLabels = normalizedInput.split("\n");

  return rawLabels.map((l) => l.trim().toLowerCase()).filter((l) => l.length > 0);
}

function run(): void {
  const labelsInput = core.getInput("labels", { required: true });
  const blockedLabels = parseBlockedLabels(labelsInput);

  if (blockedLabels.length === 0) {
    core.warning("No labels provided to block-pr-by-label. Nothing to check.");
    return;
  }

  const { payload, eventName } = github.context;

  if (eventName !== "pull_request" && eventName !== "pull_request_target") {
    core.warning(
      `block-pr-by-label is intended for pull_request events, but was triggered by "${eventName}". Skipping.`,
    );
    return;
  }

  const prLabels: string[] =
    (payload.pull_request?.labels as Array<{ name: string }> | undefined)?.map((l) =>
      l.name.toLowerCase(),
    ) ?? [];

  const matched = prLabels.filter((label) => blockedLabels.includes(label));

  if (matched.length > 0) {
    core.setFailed(`PR is blocked because it has the following label(s): ${matched.join(", ")}`);
    return;
  }

  core.info("No blocking labels found. PR is clear to merge.");
}

run();
