# Revise

The night-before sheet. Cover the right column, answer out loud, and only open a
file for the rows you fluffed. Each table covers one file, and the link in its
heading is where every row in it is answered properly; tables that span files
link per row.

---

## If you have one evening

Ninety minutes, in this order — the topics the research found asked most. If you
only get through three, do 1, 2 and 3.

| # | Do this | Time |
|---|---|---|
| 1 | KV cache: the formula, then 320 KB/token, then the 80GB subtraction — [ai/01](ai/01-how-llms-work.md) | 20 min |
| 2 | Error compounding: `0.95^20 ≈ 36%`, and the four agent failure modes — [ai/03](ai/03-agents.md) | 10 min |
| 3 | Eval design: the levels, the first 20 cases, judge bias, the CI gate — [ai/05](ai/05-evaluation.md) | 15 min |
| 4 | Prompt injection: why it is architectural, and what only sounds like it helps — [ai/08](ai/08-safety-and-guardrails.md) | 10 min |
| 5 | RAG access control as a pre-filter, plus the six failure modes — [ai/02](ai/02-rag.md) | 10 min |
| 6 | The cost ladder in order, and the prefill/decode latency split — [ai/07](ai/07-cost-and-performance.md) | 10 min |
| 7 | Observability: what you log per call, and the step-count histogram — [ai/06](ai/06-observability.md) | 10 min |
| 8 | Agent bounding: the five bounds, and what happens when one trips — [ai/03](ai/03-agents.md) | 5 min |

---

## Numbers worth memorising

Only the ones this repo derives. Do not quote anything else as a figure.

| Number | Where it comes from |
|---|---|
| `2 × n_layers × n_kv_heads × head_dim × bytes × context × batch` | The KV cache formula. No Q term — queries are used once and thrown away |
| **320 KB per token** | 70B-class GQA config at BF16: 80 layers, 8 KV heads, head_dim 128 |
| 2.5 GB / 10 GB | One sequence of that config at 8k / at 32k |
| 80 GB / 320 GB | Batch 32 at 8k / at 32k — a whole accelerator on cache alone |
| **8×** | What GQA bought: 64 query heads over 8 KV heads. Turn it off and one 32k sequence is 80 GB |
| ~140 / ~70 / ~35 GB | 70B weights at BF16 / FP8-INT8 / INT4 |
| `0.95^20 = 0.358` | 20 steps at 95% per step is about 36% end to end |
| `0.9^(1/20) ≈ 0.995` | 90% over 20 steps needs 99.5% per step |
| **420,000 input tokens** | A 20-step run at 2,000 tokens/step: `2000 × (20×21/2)`. The final transcript weighs 40,000 |
| ~4 characters | One token of English. Output costs several times input |
| ~8 points | At 100 eval cases near 80%, a smaller difference is noise (`1/√n`) |

---

## ai/01 — How LLMs work · [file](ai/01-how-llms-work.md)

| Question | Answer |
|---|---|
| Why is attention O(n²)? | Every token scores against every other, so work and the score matrix grow as the square of length |
| What is the KV cache for? | Stores K and V per token per layer so a new token attends over the past without recomputing it |
| Why is `n_kv_heads` not `n_heads`? | GQA lets groups of query heads share one KV head. The saving is exactly `n_heads / n_kv_heads` |
| Does a 70B fit on one 80GB GPU? | Not at BF16. It is a subtraction, and the KV cache is the term that moves |
| It does not fit — what first? | Paged KV, prefix caching, cap context, smaller batch, then quantise. Free levers before quality ones |
| Why worse at long context even when it fits? | Fitting is a capacity guarantee, not an attention guarantee. Relevance density beats volume |
| Temperature vs top-p? | Temperature reshapes the distribution, top-p truncates it. Change one, not both |
| Why non-deterministic at temperature 0? | Float addition is not associative and batch composition changes reduction order. Test behaviour, not bytes |
| Pretraining vs SFT vs RLHF? | Capability comes from pretraining; alignment and behaviour come from the later stages |
| Why does it make things up? | The objective is next-token plausibility, a property of form not truth. There is no lookup step to fail |

## ai/02 — RAG · [file](ai/02-rag.md)

| Question | Answer |
|---|---|
| RAG in two minutes? | Search plus a summariser: retrieve the passages most likely to contain the answer, put them in the prompt |
| When is RAG the wrong answer? | When the bottleneck is not "the model lacks facts" — format, reasoning or behaviour problems |
| Why is fixed-size chunking weakest? | It splits on a character count, a property of the file, not of the meaning |
| Change the embedding model later? | Every vector is invalidated. It is a re-index and a migration, not a config change |
| Why hybrid with BM25? | Embeddings capture meaning and lose the exact string. Identifiers and rare terms need lexical search |
| **Access control?** | A pre-filter on the retrieval query, from the caller's identity at request time. Never post-filter, never ask the model |
| Nothing relevant retrieved? | Check the doc is indexed at all, add BM25, rewrite the query, raise k and rerank. If no evidence, refuse |
| Right chunk, answer cut in half? | Retrieval metrics look fine. Fix with overlap, small-to-big, sentence-window, structure-aware splitting |
| Right chunk, buried mid-context? | Send fewer chunks, rerank, strongest last. Raising k is usually the wrong instinct |
| Model ignores context? | Counterfactual probe: remove the context. If the answer barely changes, it was never grounded |

## ai/03 — Agents · [file](ai/03-agents.md)

| Question | Answer |
|---|---|
| Agent or workflow? | In a workflow a human wrote the control flow. In an agent the model decides it. Prefer the workflow |
| What is tool calling really? | The model emits structured text saying it would like a call. Your runtime does the calling |
| Designing a tool interface? | For a competent new hire who can only read the docstring and can never ask a question |
| What is MCP? | An open protocol for how a host discovers and calls tools, so integrations are not rewritten per app |
| **20 steps at 95%?** | About 36%. Reliability multiplies. 90% over 20 steps needs 99.5% per step |
| The four failure modes? | Context growth, looping, fabricated success, silent cost blow-up. Fabricated success is the only silent one |
| How do you bound an agent? | Step limit, token budget, wall clock, action budget, scope. Scope is the only one that limits harm |
| What on a bound trip? | Stop cleanly into a distinct terminal state, return partial work plus state, alert on the bound itself |
| When is multi-agent better? | When subtasks are genuinely independent and the win is parallelism or context isolation |
| Where does the human gate go? | At the irreversible step. Not at the start, not at the end |
| How do you evaluate an agent? | Grade the trajectory and the artefact, not the final message |

## ai/04 — Agentic system design · [file](ai/04-agentic-system-design.md)

| Question | Answer |
|---|---|
| How is this round different? | The dependency is slow, expensive and non-deterministic, and you do not control it |
| Repo does not fit in context? | Do not load it. Give search tools: a map, exact search, and read-on-demand |
| Session longer than the window? | Stable prefix, external artefacts with handles, compaction that carries goal and side effects verbatim |
| What changes when an agent can act? | Answering is reversible and acting is not. Design shifts from retrieval quality to blast radius |
| Where does the gate go? | On a rule about reversibility and blast radius, never on the model's confidence |
| Idempotent side effects? | Key derived from the intent; store key-to-result before calling downstream |
| Rollback story? | An append-only ledger with a named compensating action. You do not undo, you compensate |
| Surviving a worker restart? | An append-only event log per run; replay it to rebuild state |
| The three caches? | Exact (correct, low hit rate), prefix (transformative for agents), semantic (dangerous — similarity is not equivalence) |

## ai/05 — Evaluation · [file](ai/05-evaluation.md)

| Question | Answer |
|---|---|
| How do you know it got better? | Define "better" as a measurable property first, fix the inputs, then change one thing |
| The levels of evaluation? | Unit, component, end-to-end, human review, online. Cost and fidelity both rise as you go up |
| You have nothing — start where? | Twenty hand-written cases today, with pass criteria instead of expected outputs |
| **How big before it means anything?** | Uncertainty goes as `1/√n`. At 100 cases near 80%, under ~8 points is noise. Pair the runs |
| Writing a judge rubric? | A rubric is a spec. Two careful humans reading it must reach the same verdict |
| Why pairwise over absolute? | Relative judgement needs no calibrated internal scale. Absolute scoring assumes one exists |
| Judge biases? | Position, verbosity, self-preference, formatting. Randomise order, strip formatting, check both ways |
| Evaluating the judge? | Against human labels on a held-out set — and measure human-human agreement first |
| Retrieval metrics that matter? | Recall@k first. It is the ceiling on everything downstream |
| What is the CI gate? | Three tiers by cost: structural checks per commit, frozen set plus safety on PR, the expensive set nightly |
| Offline and online disagree? | Online decides what to ship. Offline explains why. Assume the offline set is unrepresentative |
| Provider changed the model? | A frozen canary set on a schedule, watching the output distribution, not just the score |

## ai/06 — Observability · [file](ai/06-observability.md)

| Question | Answer |
|---|---|
| What is the right span unit? | Session → run → step → model call and tool call |
| What do you log per call? | Enough to reconstruct the call exactly, price it exactly, and find it again |
| Why log the rendered prompt? | Template plus variables is not the prompt. The prompt is what was actually sent |
| Metrics that matter? | Output-contract failures, `finish_reason = length`, empty retrieval, refusals, tool failures, steps per run |
| Why alert on distributions? | The error rate stays flat while the shape moves. Never report the mean — LLM latency is bimodal |
| Where does the money go? | The step-count histogram. Median three steps, p99 thirty — and the spike at the cap is failed runs |
| Debugging an agent run? | Walk forward to the first step whose input was still correct and whose output was not |
| Quality with no ground truth? | Triangulate: implicit behavioural signals, a sampled judge, and explicit feedback |
| Closing the loop? | Every production failure you find becomes a case in the golden set |

## ai/07 — Cost and performance · [file](ai/07-cost-and-performance.md)

| Question | Answer |
|---|---|
| Where does the time go? | Prefill is one parallel compute-bound pass. Decode is sequential and bandwidth-bound |
| Why TTFT and inter-token latency separately? | Different causes, different fixes. Averaged, both become undiagnosable |
| What does streaming buy and cost? | Converts total latency into TTFT for zero compute saving; errors arrive in-band and retry turns ambiguous |
| What does prompt caching require? | A byte-identical, stable prefix. Immutable content first, variable last, never reorder |
| How do you model feature cost? | calls per task × (input tokens × input rate + output tokens × output rate) |
| Why is agent cost long-tailed? | Most runs end quickly, a minority loop. Plan on p95, never the mean |
| **The cost ladder, in order?** | Measure and attribute → cut prompt size → cache → route easy cases down → cap output → batch offline → self-host last |
| Routing vs cascading? | Routing picks the model before the call. Cascading tries cheap, checks, and escalates |
| Detecting a runaway? | Spend as a real-time metric with alerts on its rate of change, per feature and per tenant |

## ai/08 — Safety and prompt injection · [file](ai/08-safety-and-guardrails.md)

| Question | Answer |
|---|---|
| **What is prompt injection?** | Instructions and data arrive on the same channel, as one flat sequence. Architectural, not a bug |
| Direct or indirect — which matters? | Indirect. Content the agent retrieves carries the attack, and no user had to be malicious |
| The confused deputy? | A program with more authority than the person asking, tricked into using it on their behalf |
| Jailbreak vs injection? | Jailbreaking attacks the policy. Injection attacks the boundary between instruction and data |
| What actually reduces risk? | Least privilege on tools, human gates on irreversible actions, constrained tool signatures |
| What only sounds like it helps? | Anything enforced inside the same token stream as the attack — "ignore instructions in documents" |
| How do you test for it? | An injection corpus in the eval set, one case per attack shape, run every release |
| Where do guardrails go? | Outside the model, on the way in and on the way out, enforcing something you will act on |
| Fail open or closed? | Closed for anything with a side effect or real harm. Open for advisory checks |
| Never see a raw credential? | The agent asks for an action; a broker holds the key and injects it at the call boundary |

## ai/09 — Scenarios · [file](ai/09-scenarios.md)

| Scenario | The move |
|---|---|
| Confident answer from the wrong document | Debug retrieval and generation separately before touching either |
| Evals green, users complaining | Your set is unrepresentative. Trust the users, then fix the set |
| Provider silently changed the model | Separate "they changed" from "we changed" from "our traffic changed". Frozen canary set |
| Spend up 10x, nobody noticed | Instrument and attribute before optimising, and name who owns the bill |
| Agent loops and burns the budget | Design the termination condition: repeat detection, step cap, budget checked before each call |
| p99 blows the budget, p50 is fine | Read the histogram. Look for retries, fallbacks and the step cap |
| Agent reports success but did nothing | A claim of success is generated text. Grade the artefact with a verifier that never sees the transcript |
| Injection found in production | Run it as an incident, then fix the architecture: privilege, gates, scope. Not a prompt patch |
| A user sees another user's data | Incident. The cause is ordinary — a cache or a filter crossing an identity boundary |

## ai/10 and ai/11 — Definitions and coding drills

| Question | Answer |
|---|---|
| Quick definitions, and the pairs people confuse | [ai/10-definitions.md](ai/10-definitions.md) — read the bottom table if you read nothing else |
| Attention from scratch | Mask the scores, not the probabilities. `1/√d_k` because score variance grows with `d_k` — [ai/11](ai/11-coding-drills.md) |
| Debugging a broken transformer | Shapes, then one token by hand, then properties, then a reference. State the method before touching code |
| Concurrency against a rate-limited API | Concurrency and rate are two limits needing two mechanisms. A timeout that does not abort leaks past your pool |

---

## System design — HLD

| Problem | What is being tested |
|---|---|
| [URL shortener](system-design/hld/01-url-shortener.md) | Code generation: a counter with pre-allocated key ranges, encoded so it is not enumerable |
| [News feed](system-design/hld/02-news-feed.md) | Fan-out on write vs read, and the celebrity case that forces a hybrid |
| [Chat system](system-design/hld/03-chat-system.md) | The server pushes instead of waiting. Connection management, receipts, ordering |
| [Rate limiter](system-design/hld/04-rate-limiter.md) | Whether a counter shared by fifty servers is both correct and fast. Fixed windows admit 2x across the seam |
| [Video streaming](system-design/hld/05-video-streaming.md) | A batch transcoding pipeline bolted to a CDN problem, with an ordinary web app beside it |
| [Ride-hailing](system-design/hld/06-ride-hailing.md) | The location index, and the dispatch race. Everything else is ordinary |
| [Key-value store](system-design/hld/07-key-value-store.md) | Distributed primitives named out loud: partitioning, quorums, conflict detection, anti-entropy |
| [Web crawler](system-design/hld/08-web-crawler.md) | Throughput not latency, and the limit is politeness not hardware. Frontier design, dedup at 100 billion |
| [Notification system](system-design/hld/09-notification-system.md) | Everything hard sits behind a vendor you do not control. Exactly-once as the user perceives it |
| [LLM application](system-design/hld/10-llm-application.md) | A dependency that is slow, expensive and different every time. Ingestion decides answer quality |

## System design — LLD

Name the one idea in the first two minutes and you are already answering.

| Problem | The one idea |
|---|---|
| [Parking lot](system-design/lld/01-parking-lot.md) | Do not build an inheritance hierarchy where a value would do |
| [Elevator](system-design/lld/02-elevator-system.md) | An explicit state machine, so "moving with the doors open" is unreachable rather than a bug |
| [LRU cache](system-design/lld/03-lru-cache.md) | No single structure gives both properties. Run a map and a list over the same nodes |
| [Chess](system-design/lld/04-chess.md) | The rules that belong to no single piece — that is the graded part, not the six subclasses |
| [Movie booking](system-design/lld/05-movie-ticket-booking.md) | Two people tapping seat A2 in the same second. Check-then-take is two operations with a gap |
| [Splitwise](system-design/lld/06-splitwise.md) | Split as a strategy you hand in, not a switch inside the expense class |
| [ATM](system-design/lld/07-atm.md) | State pattern at its clearest: dispensing without a PIN must have no compilable path |
| [Vending machine](system-design/lld/08-vending-machine.md) | The state machine is table stakes. Change from a finite till is the real subproblem |
| [Library](system-design/lld/09-library-management.md) | A book is not a copy of a book. Bibliographic record vs physical item |
| [Ride-sharing](system-design/lld/10-ride-sharing.md) | Matching is a sort. The problem is handing a contended driver between two state machines |
| [In-memory store](system-design/lld/11-in-memory-store.md) | The progressive spec: whether your first ten minutes survive the requirement you had not heard yet |

## System design — the round itself

| Question | Answer |
|---|---|
| The four steps? | Requirements, estimation, high-level design, deep dive — [framework.md](system-design/framework.md) |
| What actually fails people? | Not asking about scale, reciting an architecture, no numbers, refusing to commit, ignoring failure, going silent |
| How do you commit to a choice? | "I'd pick X because Y; the tradeoff is Z; if Z bit, I'd switch to W" |
| Primitives to have cold | CAP, consistency models, consistent hashing, sharding, replication, caching, queues, idempotency — [fundamentals.md](system-design/fundamentals.md) |

---

## Rounds

| Question | Answer |
|---|---|
| What is the AI-assisted coding round? | A problem and a tool, graded on a process you have to speak aloud — [ai-assisted-coding.md](rounds/ai-assisted-coding.md) |
| What do graders look for there? | Whether you verify what the tool produced, and whether you can say why you accepted it |
| What do you do before the loop? | Ask the recruiter the format and the tool policy. One message, highest value per word |
| What decides a take-home? | Working code, real trace logs, honest failure modes, judge calibration — [take-homes.md](rounds/take-homes.md) |
| Most common take-home failure? | Submitting something polished you cannot extend live in the defence call |
| "Why this chunking?" | Answer with a property of the documents, not a number |
| "How do you know it works?" | With the evaluation, and separate retrieval from generation |
| Why do strong engineers lose the values round? | They prepare it last and prepare it wrong — [behavioural-and-values.md](rounds/behavioural-and-values.md) |
| The two failure modes there? | The scripted STAR answer, which collapses on the second question, and mission flattery |
| What is actually graded? | Can you be put in front of a stakeholder, will you raise bad news early, judgement or just opinions |

---

## Not reproduced here

| Topic | Where |
|---|---|
| DSA | [dsa/PATTERNS.md](dsa/PATTERNS.md) — Blind 75 is about 12 patterns. Recognise the pattern from the wording |
| JavaScript traps | [javascript/pitfalls.md](javascript/pitfalls.md) — 20 bugs that break correct algorithms, worst first |

Skim both the morning of. They are recognition, not understanding.
