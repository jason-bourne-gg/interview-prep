# JavaScript for interviews

The things that actually bite you when you solve DSA in JS, and the language
questions that come up in the same interviews.

- **[pitfalls.md](pitfalls.md)** — 20 ways JS quietly breaks a correct algorithm
- **[toolkit.md](toolkit.md)** — the data structures JS doesn't give you, and what to use instead
- **[language-questions.md](language-questions.md)** — closures, `this`, event loop, prototypes

---

## Why this section exists first

Most Blind 75 write-ups are in Python. Ported to JavaScript, half of them are
subtly wrong — not because the algorithm is wrong, but because `sort()` compares
strings, integer division leaves a float, and there is no built-in heap.

An interviewer will not stop you. Your solution will pass three test cases and
fail the fourth.
