#!/usr/bin/env bash
# Prints the next semantic version based on the Conventional Commits since the last v* tag.
# Without a previous tag it prints the version from app.json.
set -euo pipefail

last_tag="$(git describe --tags --abbrev=0 --match 'v[0-9]*' 2>/dev/null || true)"

if [ -z "$last_tag" ]; then
  node -p "require('./app.json').expo.version"
  exit 0
fi

IFS=. read -r major minor patch <<< "${last_tag#v}"
log="$(git log "$last_tag..HEAD" --no-merges --pretty=format:'%s%n%b')"

if echo "$log" | grep -Eq '^[a-z]+(\(.+\))?!:|^BREAKING CHANGE:'; then
  echo "$((major + 1)).0.0"
elif echo "$log" | grep -Eq '^feat(\(.+\))?:'; then
  echo "$major.$((minor + 1)).0"
else
  echo "$major.$minor.$((patch + 1))"
fi
