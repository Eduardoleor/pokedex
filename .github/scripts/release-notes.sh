#!/usr/bin/env bash
# Prints a Markdown summary of the commits in HEAD that are not yet in BASE.
# Usage: release-notes.sh <base> <head>
set -euo pipefail

base="${1:-origin/main}"
head="${2:-origin/develop}"

commits="$(git log "$base..$head" --no-merges --pretty=format:'%h%x09%s%x09%an')"

if [ -z "$commits" ]; then
  exit 0
fi

section() {
  local title="$1" pattern="$2" exclude="${3:-^$}" lines
  lines="$(echo "$commits" | awk -F'\t' -v p="$pattern" -v x="$exclude" \
    '$2 ~ p && $2 !~ x { printf "- %s (`%s`, %s)\n", $2, $1, $3 }')"
  if [ -n "$lines" ]; then
    printf '### %s\n\n%s\n\n' "$title" "$lines"
  fi
}

total="$(echo "$commits" | wc -l | tr -d ' ')"
stat="$(git diff --shortstat "$base...$head" | sed 's/^ //')"

printf '## Release summary\n\n'
base_label="${base#origin/}"
if [[ "$base_label" =~ ^[0-9a-f]{40}$ ]]; then
  base_label="${base_label:0:7}"
fi
noun="commits"
[ "$total" = "1" ] && noun="commit"

printf '%s %s (`%s..%s`). %s.\n\n' "$total" "$noun" "$base_label" "${head#origin/}" "$stat"

section 'Features' '^feat(\\(.*\\))?!?:'
section 'Fixes' '^fix(\\(.*\\))?!?:'
section 'Performance' '^perf(\\(.*\\))?!?:'
section 'Refactors' '^refactor(\\(.*\\))?!?:'
section 'Tests' '^test(\\(.*\\))?!?:'
section 'Documentation' '^docs(\\(.*\\))?!?:'
section 'Build & CI' '^(build|ci)(\\(.*\\))?!?:'
section 'Dependencies' '^chore\\(deps(-dev)?\\)'
section 'Other' '^(chore|style|revert)(\\(.*\\))?!?:' '^chore\\(deps(-dev)?\\)'

breaking="$(echo "$commits" | awk -F'\t' '$2 ~ /^[a-z]+(\(.*\))?!:/ { printf "- %s (`%s`)\n", $2, $1 }')"
if [ -n "$breaking" ]; then
  printf '### Breaking changes\n\n%s\n\n' "$breaking"
fi

printf '<details>\n<summary>Changed files</summary>\n\n```\n%s\n```\n\n</details>\n' \
  "$(git diff --stat=100 "$base...$head")"
