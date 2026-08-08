type GameTitleInput = {
  title: string;
  version?: string | null;
};

function compactVersion(value?: string | null) {
  return (value ?? "").replace(/^v/i, "").replace(/\D/g, "");
}

function removeVersionSuffix(title: string, version?: string | null) {
  const versionDigits = compactVersion(version);

  if (versionDigits.length < 2) {
    return title;
  }

  const suffixPattern = versionDigits.split("").join("[\\s._-]*");
  return title.replace(new RegExp(`[\\s._-]*${suffixPattern}$`, "i"), "").trim();
}

function restoreCommonWordBreaks(title: string) {
  return title.replace(/\b([A-Z]{5,})(BY)\b/g, "$1 $2");
}

export function getGameDisplayTitle(game: GameTitleInput) {
  const normalized = game.title.replace(/\s+/g, " ").trim();
  const withoutVersion = removeVersionSuffix(normalized, game.version);

  return restoreCommonWordBreaks(withoutVersion) || normalized;
}
