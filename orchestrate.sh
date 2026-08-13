#!/usr/bin/env bash
# ============================================================================
# Student Utility Hub — Overnight Autonomous Build Orchestrator
#
# Drives PLAN.md milestones through headless `opencode run` sessions.
# Launch with nohup, go to sleep, read .overnight/MORNING_STATUS.md in the morning.
#
# Usage:
#   ./orchestrate.sh                # run all milestones
#   ONLY_MILESTONE=M3 ./orchestrate.sh  # run a single milestone
#   PUSH=1 ./orchestrate.sh         # git push after success (auto-deploys)
# ============================================================================
set -uo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OVERNIGHT_DIR="$PROJECT_DIR/.overnight"
LOG_DIR="$OVERNIGHT_DIR/logs"
STATUS_FILE="$OVERNIGHT_DIR/MORNING_STATUS.md"
FAILURES_FILE="$OVERNIGHT_DIR/FAILURES.md"
BUILD_LOG="$LOG_DIR/build-check.log"

# --- Config ----------------------------------------------------------------
MODEL="${MODEL:-opencode-go/deepseek-v4-flash}"   # your go-subscription flash model
MAX_RETRIES=2                                     # extra attempts per milestone after first failure
ONLY_MILESTONE="${ONLY_MILESTONE:-}"              # e.g. "M3" — run one milestone only
PUSH="${PUSH:-0}"                                 # 1 = git push to origin after success (auto-deploys to Cloudflare)
# ---------------------------------------------------------------------------

mkdir -p "$LOG_DIR"

# Milestones: "N|SessionId|Git commit message keyword|Short label"
MILESTONES=(
  "1|suh-m1|shared storage and format utilities|Shared utils library"
  "2|suh-m2|exam countdown|Exam Countdown page"
  "3|suh-m3|pomodoro study timer|Study Timer (Pomodoro) page"
  "4|suh-m4|semester syllabus tracker|Semester Syllabus Tracker page"
  "5|suh-m5|marks ledger|Marks Ledger page"
  "6|suh-m6|homepage categories and sitemap|Homepage + SEO refresh"
  "7|suh-m7|QA gate|QA gate (check, build, smoke tests)"
)

log()  { echo "[$(date '+%H:%M:%S')] $*" | tee -a "$OVERNIGHT_DIR/orchestrator.log"; }
fail() { log "ERROR: $*"; exit 1; }

# --- Step 0: baseline commit + preflight -----------------------------------
preflight() {
  log "== Preflight =="
  cd "$PROJECT_DIR" || fail "cannot cd to project"

  if git status --porcelain | grep -q .; then
    log "Working tree dirty — committing baseline before autonomous work..."
    git add -A && git commit -m "wip: baseline snapshot before overnight build" \
      || log "baseline commit failed (maybe nothing to commit)"
  fi

  log "Running npm run build (preflight)..."
  if npm run build > "$BUILD_LOG" 2>&1; then
    log "Preflight build OK"
  else
    tail -30 "$BUILD_LOG" | tee -a "$OVERNIGHT_DIR/orchestrator.log"
    fail "Preflight build FAILED — fix before launching overnight run"
  fi

  command -v opencode >/dev/null || fail "opencode not found in PATH"
  log "opencode: $(opencode --version 2>/dev/null || echo present)"
}

# --- Run one milestone with retries ----------------------------------------
run_milestone() {
  local num="$1" session="$2" label="$3"
  local attempt prompt log_file before_commits after_commits ok=0

  log "== Milestone M$num ($label) — session $session =="

  before_commits="$(git rev-list --count HEAD)"

  attempt=1
  while [ "$attempt" -le $((MAX_RETRIES + 1)) ]; do
    log "  attempt $attempt/$((MAX_RETRIES + 1))"
    log_file="$LOG_DIR/m$num-attempt$attempt.log"

    if [ "$attempt" -eq 1 ]; then
      prompt="Execute milestone M$num in PLAN.md. Read PLAN.md section M$num, DESIGN.md, and AGENTS.md first. Implement it fully. Then run 'npm run build' and fix any errors. Then run 'git add -A && git commit -m \"<message per plan>\"'. Reply DONE only when the build passes and the commit exists."
    else
      prompt="Your previous attempt at milestone M$num in PLAN.md failed (review your earlier work in this session). Diagnose the failure, fix it completely, re-run 'npm run build', and commit. Reply DONE only when the build passes and a new commit exists."
    fi

    if opencode run --auto -m "$MODEL" -s "$session" --format json --title "M$num $label" "$prompt" > "$log_file" 2>&1; then
      log "  opencode run exited 0"
    else
      log "  opencode run exited $? (see $log_file)"
    fi

    # Hard verification: build must pass AND a new commit must exist
    if npm run build > "$BUILD_LOG" 2>&1; then
      after_commits="$(git rev-list --count HEAD)"
      if [ "$after_commits" -gt "$before_commits" ]; then
        ok=1
        break
      else
        log "  build OK but no new commit — treating as failure"
      fi
    else
      log "  build check FAILED after attempt $attempt"
    fi

    attempt=$((attempt + 1))
  done

  if [ "$ok" -eq 1 ]; then
    log "  Milestone M$num COMPLETED"
    echo "M$num|$label|COMPLETED|$session|attempts=$attempt" >> "$OVERNIGHT_DIR/.results"
  else
    log "  Milestone M$num FAILED after $attempt attempts"
    echo "M$num|$label|FAILED|$session|attempts=$attempt" >> "$OVERNIGHT_DIR/.results"
    { echo "## M$num — $label — FAILED (session $session)";
      echo "Resume: opencode run -s $session \"fix the failure for milestone M$num\"";
      echo; } >> "$FAILURES_FILE"
  fi
}

# --- Final verification + morning report ------------------------------------
final_report() {
  log "== Final verification =="
  local build_ok=0 tests_ok=0
  local results=""

  npm run build > "$BUILD_LOG" 2>&1 && build_ok=1

  tests_ok=1
  for t in tests/test-storage.cjs tests/test-format.cjs tests/test-marks.cjs; do
    if [ -f "$t" ] && ! node "$t" > /dev/null 2>&1; then tests_ok=0; fi
  done

  {
    echo "# Overnight Build Report — $(date '+%Y-%m-%d %H:%M')"
    echo
    echo "Model: $MODEL | Attempts per milestone: $((MAX_RETRIES + 1))"
    echo
    echo "## Results"
    echo "| Milestone | Status | Session |"
    echo "|---|---|---|"
    while IFS='|' read -r m label status session attempts; do
      [ -n "$m" ] || continue
      if [ "$status" = "COMPLETED" ]; then
        echo "| M$m $label | ✅ COMPLETED | \`opencode run -s $session -c\` |"
      else
        echo "| M$m $label | ❌ FAILED | \`opencode run -s $session \"fix M$m\"\` |"
      fi
    done < "$OVERNIGHT_DIR/.results"
    echo
    echo "## Final checks"
    echo "- \`npm run build\`: $([ $build_ok -eq 1 ] && echo 'PASS' || echo 'FAIL — see .overnight/logs/build-check.log')"
    echo "- Unit tests: $([ $tests_ok -eq 1 ] && echo 'PASS' || echo 'FAIL')"
    echo "- Commits this run: $(git rev-list --count HEAD)"
    echo
    echo "## Next steps"
    echo "1. Review: \`git log --oneline -15\` and \`git diff HEAD~8\`"
    echo "2. Test locally: \`npm run dev\` → check the 4 new pages"
    echo "3. Deploy: \`git push origin main\` (Cloudflare Pages auto-deploys)"
    echo "4. Failed milestones: copy the resume command from .overnight/FAILURES.md"
  } > "$STATUS_FILE"

  log "Report written to $STATUS_FILE"
}

# --- Main --------------------------------------------------------------------
main() {
  rm -f "$OVERNIGHT_DIR/.results" "$FAILURES_FILE"
  : > "$OVERNIGHT_DIR/orchestrator.log"

  log "======== Overnight build started: $(date) ========"
  preflight

  for entry in "${MILESTONES[@]}"; do
    IFS='|' read -r num session label <<< "$entry"
    if [ -n "$ONLY_MILESTONE" ] && [ "$ONLY_MILESTONE" != "M$num" ]; then
      continue
    fi
    run_milestone "$num" "$session" "$label"
  done

  final_report

  if [ "$PUSH" = "1" ] && [ ! -s "$FAILURES_FILE" ]; then
    log "Pushing to origin (auto-deploy)..."
    git push origin main && log "Push OK" || log "Push failed — do it manually"
  fi

  log "======== Overnight build finished: $(date) ========"
  log "Read $STATUS_FILE"
}

main "$@"
