const key = 'hackertube:learning-goal-intent';

/** Only an explicit homepage form submission can queue automatic generation. */
export function queueLearningGoal(goal: string) {
  try {
    sessionStorage.setItem(
      key,
      JSON.stringify({ goal: goal.slice(0, 200), at: Date.now() })
    );
  } catch {
    /* The planner still accepts the goal in its URL. */
  }
}

export function takeLearningGoal(goal: string): boolean {
  try {
    const raw = sessionStorage.getItem(key);
    sessionStorage.removeItem(key);
    if (!raw) return false;
    const intent = JSON.parse(raw);
    return (
      intent.goal === goal &&
      typeof intent.at === 'number' &&
      Date.now() - intent.at >= 0 &&
      Date.now() - intent.at < 60_000
    );
  } catch {
    return false;
  }
}
