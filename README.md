# Interview prep

Blind 75 in JavaScript, 20 system design problems, and the AI/ML round — written
to be *read*, not just copied.

Every DSA solution shows the ladder: **brute force → better → optimal**, with the
reasoning that gets you from one rung to the next. That progression is what an
interviewer is actually listening for.

| | |
|---|---|
| **[DSA](dsa/)** | Blind 75 in JS, grouped by pattern, every approach |
| **[JavaScript](javascript/)** | The pitfalls that break correct algorithms, and the language round |
| **[System design](system-design/)** | 10 HLD + 10 LLD, the ones that actually recur |
| **[AI](ai/)** | Definitions, the deep tech, and scenario answers |

---

## Start here

**[dsa/PATTERNS.md](dsa/PATTERNS.md)** — Blind 75 is not 75 problems. It is about
12 patterns appearing 4–8 times each. Read this before grinding.

**[javascript/pitfalls.md](javascript/pitfalls.md)** — most write-ups are in
Python. Ported to JS, half are subtly wrong: `sort()` compares strings, there is
no integer division, `Array(3).fill([])` shares one array. Your solution passes
three test cases and fails the fourth.

---

## Why JavaScript

Because that is what I write. The patterns are language-agnostic; the bugs are
not. A Python solution ported without thinking is a solution that breaks on the
hidden test case, and no interviewer will stop you before it does.
