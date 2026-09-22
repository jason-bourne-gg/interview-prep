# System design

Two rounds, two different skills.

**HLD** — "design Twitter". Boxes, arrows, tradeoffs, numbers. You are being
tested on whether you can reason about scale and *defend a choice*.

**LLD** — "design a parking lot". Classes, interfaces, patterns. You are being
tested on whether you can model a domain and write code someone else can extend.

| | |
|---|---|
| **[The framework](framework.md)** | How to spend the 45 minutes, and the numbers to memorise |
| **[Fundamentals](fundamentals.md)** | CAP, consistent hashing, sharding, caching, queues — the vocabulary |
| **[HLD — 10 problems](hld/README.md)** | The ones that actually recur |
| **[LLD — 10 problems](lld/README.md)** | With working JavaScript, not pseudocode |

---

## Which 10, and why those

The HLD list is cross-tabulated from what the standard sources actually teach —
Alex Xu's two volumes, ByteByteGo, `donnemartin/system-design-primer`,
`karanpratapsingh/system-design`, Hello Interview, and Gaurav Sen's playlist.
A question is here if it recurs across most of them, not because it sounds
impressive.

One deliberate departure: **consistent hashing** is a component, not a product,
so it lives in [fundamentals](fundamentals.md) rather than taking a slot. Its
slot went to **designing an LLM product**, which is the clearest thing that has
changed about this round since 2024 — Hello Interview is currently the only
major source shipping one, and it is going to spread.

The LLD list follows `ashishps1/awesome-low-level-design` (27k stars) and the
Grokking OOD case studies, which agree closely.

## The trap in both rounds

**Jumping to the answer.** You have heard "design a URL shortener" before, so you
start drawing. The interviewer learns nothing except that you have read a blog
post.

Spend the first five minutes on requirements and scale. Not because it is
ritual, but because the answer genuinely changes: a URL shortener doing 100 QPS
is a Postgres table, and one doing 100k QPS is a different system.
