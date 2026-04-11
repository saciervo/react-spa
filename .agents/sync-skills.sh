#!/usr/bin/env bash
# Syncs .agents/skills/<name>/ → .claude/skills/<name> as directory symlinks
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SKILLS_DIR="$REPO_ROOT/.claude/skills"
mkdir -p "$SKILLS_DIR"
for skill_dir in "$REPO_ROOT/.agents/skills"/*/; do
  [ -d "$skill_dir" ] || continue
  skill_name="$(basename "$skill_dir")"
  link="$SKILLS_DIR/${skill_name}"
  [ -L "$link" ] || ln -sf "../../.agents/skills/${skill_name}" "$link"
done
