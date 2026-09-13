# Check New Tests for Flakiness

After writing or changing a test, run it at least 5 times before calling it done. Results that vary between runs mean it's flaky, and a flaky test counts as a failing test.

Fix the root cause: shared state, real clocks or network, sleeps instead of waits, unseeded randomness, order dependence. NEVER paper over it with retries, longer sleeps, or rerunning until green.
