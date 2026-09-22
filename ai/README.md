# The AI round

For an engineer who **builds on models**, not one who trains them. Everything
here is about the layer you actually own: prompts, retrieval, tools, agents,
evals, traces, latency and spend.

No classical ML, by design. No bias-variance, no gradient descent, no "explain
random forests". If a round asks for that, it is a different job.

The whole folder is about four hours end to end. You do not need all of it in
one sitting. **Cold, with one hour:** read `10-definitions.md`, then
`05-evaluation.md`. Those two carry most rounds.

## The files

| File | What it is for | Read |
|---|---|---|
| [01-how-llms-work.md](01-how-llms-work.md) | Tokens, attention, KV cache, quantisation — the mechanics you get asked to say out loud | 25 min |
| [02-rag.md](02-rag.md) | Retrieval end to end: chunking, embeddings, hybrid search, reranking, access control | 15 min |
| [03-agents.md](03-agents.md) | ReAct, tool calling, MCP, bounds, memory, and when an agent is the wrong shape | 15 min |
| [04-agentic-system-design.md](04-agentic-system-design.md) | The design round: an order to work in, plus worked designs | 30 min |
| [05-evaluation.md](05-evaluation.md) | Golden sets, LLM-as-judge, sample sizes — how you prove it got better | 25 min |
| [06-observability.md](06-observability.md) | Traces and spans, what to log per call, the metrics that matter, closing the loop | 20 min |
| [07-cost-and-performance.md](07-cost-and-performance.md) | TTFT, streaming, batching, prompt caching, latency budgets, cost models | 20 min |
| [08-safety-and-guardrails.md](08-safety-and-guardrails.md) | Prompt injection, confused deputy, what helps and what only sounds like it | 15 min |
| [09-scenarios.md](09-scenarios.md) | "It's broken in production — what do you do?" Worked answers by symptom | 20 min |
| [10-definitions.md](10-definitions.md) | One-line definitions for rapid-fire, plus the twelve common confusions | 15 min |
| [11-coding-drills.md](11-coding-drills.md) | Attention from scratch, a broken transformer to fix, and the correctness checks | 40 min |

## The three deepest files

**[05-evaluation.md](05-evaluation.md)**, **[06-observability.md](06-observability.md)**
and **[07-cost-and-performance.md](07-cost-and-performance.md)** are longer and
more worked than the rest.

That is deliberate. These three come up most, because they are what separates
someone who has shipped an LLM feature from someone who has demoed one. Anyone
can get a good answer out of a model once. Knowing whether it got better, why it
broke, and what it costs is the job.

If you are short on time, be shallow elsewhere and deep in those three.
