# Interview prep

Blind 75 in JavaScript, 21 system design problems, the LLM and agentic round, and
the rounds that are not about code — written to be *read*, not just copied.

## Start here

**[REVISE.md](REVISE.md)** — the revision plan. What to read, in what order, and
what to skip when the interview is tomorrow. Everything below is the map it
routes into.

| | |
|---|---|
| **[DSA](dsa/)** | Blind 75 in JS, grouped by pattern, every approach |
| **[JavaScript](javascript/)** | The pitfalls that break correct algorithms, and the language round |
| **[System design](system-design/)** | 10 HLD + 11 LLD, the ones that actually recur |
| **[AI](ai/)** | LLM, GenAI and agentic. Interview questions, answers you can say out loud |
| **[Rounds](rounds/)** | Behavioural, take-homes, and the AI-assisted coding round |

Every DSA solution shows the ladder: **brute force → better → optimal**, with the
reasoning that gets you from one rung to the next. That progression is what an
interviewer is actually listening for.

The AI section is LLM, GenAI and agentic systems only. No classical ML.

---

## Two files worth reading on their own

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
