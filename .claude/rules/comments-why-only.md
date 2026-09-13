# Comments: Why-Only

Write a comment ONLY when it records a **durable, non-obvious why**: a hidden constraint, a subtle invariant, a workaround for a specific bug, or the reason behind a surprising choice. Keep it to one tight line, and make it read true a year from now with this task forgotten.

NEVER comment anything else. Names and structure carry the meaning, and a comment inflates the visual weight of its line — so commenting obvious code misdirects the reader.

## The test — apply to every comment before you write it

Name the constraint the comment records. If all you can say is what the code does, what you just changed, or how the current flow got here, delete it.

| Comment                                              | Verdict                                             |
| ---------------------------------------------------- | --------------------------------------------------- |
| `// loop over users`                                 | delete — restates the code                          |
| `// now also handle archived docs`                   | delete — narrates your change; git blame covers it  |
| `// the first request arrives without a token`       | delete — task narration, stale by tomorrow          |
| a paragraph explaining a block                       | rename or restructure until the block reads clearly |
| `// Reads hit the replica: primary lag can reach 2s` | keep — a constraint invisible in the code           |

Before you finish an edit, reread the comments you added and apply the test again — assume you wrote too many. The ones that slip through land in someone else's file for them to clean up by hand. Comments that were already there are someone else's durable why: leave them unless your change made them wrong.

## Exception: doc comments on exported APIs

These are user-facing documentation, not internal commentary. Be thorough: params, return values, edge cases, links to related symbols.
