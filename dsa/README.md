# Blind 75 — JavaScript

Every problem from the Blind 75 list, solved in plain JavaScript. Each file walks
from the brute-force approach to the optimal one, so the trade-offs are visible
rather than assumed. Every file is runnable on its own (`node <file>`) and carries
its own inline test cases.

Cross-problem techniques — sliding window, two pointers, binary search on answer,
DP shapes, graph traversal — are collected in [PATTERNS.md](./PATTERNS.md).

## Categories

| Folder | Problems |
|---|---|
| `01-array` | 10 |
| `02-binary` | 5 |
| `03-dynamic-programming` | 11 |
| `04-graph` | 8 |
| `05-interval` | 5 |
| `06-linked-list` | 6 |
| `07-matrix` | 4 |
| `08-string` | 10 |
| `09-tree` | 14 |
| `10-heap` | 3 |
| **Total** | **76 files** |

`_lib/` holds shared test helpers, not problems.

## Running the tests

From the repo root:

```bash
node run-tests.js
```

This executes every solution file and reports pass/fail per problem. A single
problem can be run directly:

```bash
node dsa/01-array/two-sum.js
```

## On the count

The original Blind 75 list has 76 entries but only 75 unique problems — Merge K
Sorted Lists is listed twice (under Linked List and under Heap). Both files are
kept here, since the two categories teach it differently.
