# LLD — 11 problems

The list follows `ashishps1/awesome-low-level-design` (27k★) and the Grokking
OOD case studies, which agree closely. Each write-up is working JavaScript, not
pseudocode.

Every problem below is chosen because it isolates **one** design idea. If you
can name that idea out loud in the first two minutes, you are already answering
the question the interviewer is actually asking.

| # | Problem | The one design idea it tests |
|---|---|---|
| 1 | [Parking lot](01-parking-lot.md) | Composition over inheritance — vehicle size is a value, pricing is a strategy, free spots are a list not a scan |
| 2 | [Elevator system](02-elevator-system.md) | Explicit state machine, plus separating *what was requested* from *who serves it* so scheduling is swappable |
| 3 | [LRU cache](03-lru-cache.md) | Two structures over the same nodes — hash map for O(1) lookup, doubly-linked list for order |
| 4 | [Chess](04-chess.md) | Polymorphism, and where it stops: castling, en passant and promotion belong to no single piece |
| 5 | [Movie ticket booking](05-movie-ticket-booking.md) | Concurrency — check-then-take is two operations, and a held seat outlives any lock you can hold |
| 6 | [Splitwise](06-splitwise.md) | Strategy for split rules, plus a real algorithm: net every balance, then greedily match creditor to debtor |
| 7 | [ATM](07-atm.md) | State pattern where illegal transitions are unrepresentable, plus reconciling physical cash against a ledger |
| 8 | [Vending machine](08-vending-machine.md) | Compact state machine with a genuinely hard core — bounded change-making, where greedy is wrong |
| 9 | [Library management](09-library-management.md) | Entity modelling — the bibliographic record is not the physical copy, and folding them loses every real query |
| 10 | [Ride-sharing](10-ride-sharing.md) | A contended resource handed between two long-running state machines, with a human-latency timeout in the middle |
| 11 | [In-memory key-value store](11-in-memory-store.md) | One read path behind one accessor — so a requirement you have not heard yet is an edit in one place, not thirty |

**Problem 11 is a different format.** The first ten hand you the whole
requirement up front. Eleven is a *progressive spec*: the requirements arrive one
at a time, over the hour, and the grade is how well the design absorbs each one.
Do it last, and do it after you have done at least two of the others.

---

## How an LLD round differs from HLD

**The unit of the answer is a class, not a box.** HLD asks which service owns
the data; LLD asks which object owns the invariant, and you are expected to
write the method signatures that enforce it.

**You are graded on change, not scale.** Nobody asks the QPS. They add a
requirement — a sixth split rule, a new vehicle size — and watch whether it is a
new file or an edit to a `switch` in the middle of your core class.

**Concurrency is in the code, not the cluster.** There is no quorum or
replication lag here; there is one process, two threads, and the gap between
reading a seat's state and writing it.

**Read [the framework](../framework.md) first**, and see
[HLD — 10 problems](../hld/) for the other round.
