# Rapid-fire definitions

For the part of the interview where someone says "quick one — what's X?" and moves
on in ninety seconds. One sentence that answers it, plus the contrast that stops you
confusing it with its neighbour. The twelve pairs people reliably mix up are in the
table at the bottom — if you have five minutes, read that.

---

## Model and inference

- **Token** — the unit of text the model reads and writes, roughly a word-piece.
  Tokenisation is why the model cannot count letters: it never sees characters.
- **Context window** — the maximum tokens attended to in one request, prompt plus output, shared
  by system prompt, tools, retrieved documents, history and answer.
  *Contrast — KV cache:* the window limits what the model may look at; the KV cache is the memory
  holding what it already looked at. A rule versus bytes.
- **KV cache** — stored key and value tensors for processed tokens, so a new token does not
  recompute attention over the prefix. It grows with context length times concurrent requests, and
  KV memory rather than compute is what caps concurrency and decides how much GPU you need.
- **Attention** — lets each token depend on every other token in context, with work
  growing as the square of sequence length; why long context is expensive, not just slow.
- **Temperature, top-p, top-k** — temperature scales the distribution before sampling, top-k keeps
  the k likeliest tokens, top-p the smallest set summing to p.
  *Contrast — temperature vs top-p:* temperature reshapes the distribution, top-p truncates it.
  Temperature 1.5 leaves an unlikely token reachable; top-p 0.9 makes it unreachable however hot
  things get. Change one, not both; for extraction and tool use, temperature 0.
- **Embedding** — a fixed-length vector of meaning, from a different model than the one that
  generates text.
  *Contrast — token:* tokens are chunks of text that go into the model and that you are billed for;
  embeddings are vectors you store in an index.
- **Fine-tuning** — continuing training on your examples so weights change; good at teaching form
  and at compressing a long prompt into learned behaviour.
  *Contrast — RAG:* fine-tuning changes how the model behaves, RAG changes what it knows at request
  time. "It doesn't know our October pricing" is not a fine-tuning problem: the answer goes stale
  and you cannot cite a source.
- **LoRA** — freezes the original weights and trains small low-rank adapters, so you keep many
  adapters per base model and swap per tenant or task.
  *Contrast — full fine-tuning:* full updates every weight — more capacity, expensive, one
  model-sized artefact, real risk of degrading unrelated capability. Start with LoRA.
- **RLHF** — humans rank outputs, a reward model learns the rankings, the policy is optimised
  against that reward. Where refusal behaviour and tone come from.
  *Contrast — DPO:* DPO skips the reward model and optimises on preference pairs directly, simpler
  and cheaper; the separate reward model is more flexible.
- **Quantisation** — lower numeric precision to cut memory and raise throughput. Degradation is
  uneven, hitting the hardest inputs first, and it is what makes on-device deployment possible.
- **Mixture of experts (MoE)** — each token is routed to a few of many expert
  subnetworks, so total parameters are large and parameters used per token are not.
- **Reasoning tokens** — tokens spent before the visible answer, billed as output and
  consuming context. A response that "returned nothing" often spent its budget thinking.
- **Speculative decoding** — a draft model proposes tokens, the large model verifies them
  in one pass. Pure latency win, same output distribution.

---

## Prompting and context

- **System prompt** — the instruction block framing every request, sent on every call and competing
  with retrieved context. The system role is more authoritative, so never put untrusted text there.
- **Context engineering** — deciding what goes into the context on each call and what
  does not; the win is usually removing material, not rewording it.
- **Context rot** — reliability degrades as context grows: middle instructions are followed
  less than first or last, and retrieval accuracy drops before the limit. Put the governing
  instruction last and test at the length you run at.
- **Chain of thought** — intermediate reasoning before the answer; costs output tokens and is
  redundant on a reasoning model. Trap: it is a generated artefact, not an audit trail.
- **Few-shot prompting** — examples so the model infers the pattern. Cheapest fix for
  format, near-useless for facts; three diverse correct examples beat ten similar ones.
- **Structured output and constrained decoding** — constrained decoding restricts the sampler
  so only schema-legal tokens are possible, making invalid structure impossible rather than
  unlikely. Valid structure is still not correct content.
- **Prompt template and versioning** — a parameterised prompt pinned to an id recorded
  with every request, or you cannot attribute a regression or roll back. Log the rendered
  prompt too: the bug is usually in what the slots filled with.
- **Compaction** — replacing older turns with a summary so a long session fits. Decide what
  survives verbatim — identifiers, decisions, constraints — or the agent contradicts itself.

---

## Retrieval

- **RAG** — fetch relevant material at request time and put it in the prompt. The value is
  freshness, attribution and access control, not intelligence.
- **RAG failure modes** — roughly in order of frequency: nothing relevant retrieved, the right chunk
  ranked below the cutoff, the chunk unreadable out of context, a stale index, and only then the
  model departing from good context. Diagnose by reading the retrieved set, not the answer.
- **Chunking** — splitting sources into retrievable units: too small and a chunk is uninterpretable,
  too large and one sentence drags in a page of noise. Most retrieval problems are chunking problems.
- **Embedding model** — chosen separately from the generation model. Its version is part of
  your index, and queries must be embedded with the same model as documents.
- **Hybrid search** — lexical and vector retrieval fused, usually by reciprocal rank
  fusion. The default, because one misses paraphrases and the other misses exact strings.
- **BM25** — lexical ranking on the actual words, weighted by term rarity and document
  length. Strong where embeddings are weak: product codes, error strings, identifiers.
- **ANN index** — approximate nearest-neighbour search (HNSW, IVF) trading tunable recall
  for speed. Trap: lost recall is invisible in your logs, the document never shows up.
- **Reranker** — a second-stage cross-encoder scoring each candidate against the query jointly: more
  accurate, much slower, so retrieve broadly and rerank a short list. Often beats a new embedding model.
- **Query rewriting** — turning the user's message into better search queries by resolving
  pronouns and splitting compound questions. The fix for "what about the second one?".
- **Access control on retrieval** — filter by tenant and permissions in the query itself, never by
  telling the model to ignore what it was given. Index documents with their ACL, re-check at answer
  time because permissions change after indexing, and an embedding of a secret is still the secret.
- **Recall@k and nDCG** — recall@k asks whether the right document is in the top k, nDCG rewards
  ranking it near the top. Measure both separately from answer quality.

---

## Agents and tools

- **Agent** — a system where the model decides control flow: which tool to call next,
  whether to call one, and when the task is done.
- **Workflow** — a system where you write the control flow and call the model at fixed points.
  *Contrast — agent vs workflow:* steps decided by code versus by the model. Workflows are cheaper,
  faster, testable and predictable; agents handle tasks whose shape you cannot enumerate. Most
  production "agents" should be workflows, and you add model-decided control flow only where
  branching is genuinely open-ended.
- **Agent loop** — send context, get text or a tool call, execute, append the result, repeat until a
  final answer or a stop condition. Every trip re-sends the growing context, so cost outruns steps.
- **Error compounding** — per-step reliability multiplies: 95% correct over twenty steps is
  a coin flip on the run. The argument for fewer steps, checkpoints that verify, and for
  not using an agent when a workflow can enumerate the branches.
- **Bounding an agent** — step limit, token budget, wall-clock timeout, no-progress
  detection, spend cap per session. Every agent needs several, because the interesting
  failure is not crashing, it is looping politely and expensively forever.
- **Tool calling (function calling)** — the model returns a structured request to invoke a named function
  and your code executes it. The model never executes anything; authorisation and validation are yours.
- **Tool schema** — the name, description and parameters the model sees: prompt text in a JSON costume.
  Vague descriptions and overlapping tools are the commonest cause of wrong tool choice, and the fix is
  editing descriptions, not changing models.
- **MCP (Model Context Protocol)** — an open protocol for exposing tools and resources over one
  interface, so a server written once works with any client. Security angle: an MCP server is
  third-party code with tool access whose descriptions enter your prompt, so pin versions and scope
  credentials per server.
  *Contrast — function calling:* function calling is the model capability; MCP is a packaging and
  transport standard for where the functions come from, changing who hosts the integration.
- **Sandbox** — the isolated environment tools run in: constrained filesystem and network,
  no ambient credentials, resource limits. Treat every tool result as untrusted input.
- **Trajectory** — the full ordered record of one run: every message, tool call, result and
  decision. Scoring the trajectory is a different question from scoring the output, because
  an agent can reach the right answer through an unsafe or wasteful path.
- **Subagent** — a nested agent invoked as a tool, with its own context and a summary returned.
  The value is context isolation; the risk is a summary that drops what the parent needed.
- **Multi-agent** — work split across model instances with distinct prompts and tools. Buys
  parallelism and context isolation, costs coordination and much harder debugging.
- **Memory** — state carried beyond the current context, written down and retrieved later,
  which makes it a retrieval problem with every retrieval failure mode attached.
- **Human in the loop** — an explicit approval step where an action is irreversible or
  externally visible. Approving every step trains people to click yes.

---

## Serving, cost and performance

- **Prefill phase** — the model processes the whole input prompt before emitting anything:
  compute-bound, parallel across tokens, the main determinant of TTFT.
- **Decode phase** — one forward pass per output token, memory-bandwidth bound. Prefill is
  read, decode is write, and only decode is sequential, which is why output is expensive.
- **TTFT (time to first token)** — how long the user stares at nothing, dominated by prompt
  length, prefill and queueing. Prompt caching moves it more than a smaller model does.
- **Inter-token latency** — the gap between output tokens once streaming starts; it sets
  perceived reading speed and multiplies by output length.
  *Contrast — TTFT:* different causes, different fixes. TTFT is prompt length, queueing and
  prefill; inter-token latency is model size, decode efficiency and batch pressure. A
  product can have excellent TTFT and still feel sluggish, so ask which one the complaint
  is about before optimising.
- **Output token asymmetry** — output tokens are priced well above input and are the sequential
  part, so verbosity costs twice. Capping output usually beats trimming the prompt.
- **Prompt caching** — reusing the computed KV cache for an identical prompt prefix, cutting TTFT and
  input cost. It needs the stable material — system prompt, tool schemas, few-shot examples — at the
  front and unchanged; a timestamp at the top invalidates it every request and only the bill notices.
  *Contrast — semantic caching:* prompt caching is exact-prefix and lossless, the model still runs.
  Semantic caching matches a new question to an old one by embedding similarity and returns the stored
  answer without calling the model, so it can be confidently wrong.
- **The cost ladder, in pull order** — cap output length, cache the prompt prefix, shorten the system
  prompt and tool set, route or cascade to a cheaper model, batch anything nobody is waiting for, then
  consider fine-tuning or self-hosting. Measure cost per successful task, not per call.
- **Router** — a cheap first stage that classifies the request and sends it to the right
  model or path. Measure its own error rate: a misroute is invisible downstream.
- **Cascade** — try a cheap model first, escalate when the answer fails a check. The economics depend
  entirely on the check: escalating badly costs both calls and gives the worse answer.
- **Batch API** — submit many requests asynchronously and collect later at a large discount.
  The right home for evals, backfills and enrichment.
- **Token budget** — an explicit cap on tokens spent, enforced in code, at the session level
  and not just per call, because the agent failure mode is many reasonable calls.
- **Rate limit and concurrency limit** — caps on tokens per minute and in-flight requests. When
  they bind, your latency is queueing and the fix is backpressure, not a faster model.

---

## Evaluation, observability and safety

- **The eval levels** — deterministic checks first (schema valid, citation resolves, number
  matches), then a model judge on a rubric, then human review on a sample, then online
  metrics. Use the cheapest level that can detect the failure you care about.
- **Building the first suite** — take twenty to fifty real inputs, label what a good answer is, write
  the cheapest grader per case, and accept the first version is wrong; it earns its keep by being
  fixed when it disagrees with you.
- **Golden set** — the curated, human-agreed subset you trust as ground truth. Mine it from
  production traces, weight it toward failures you have seen, refresh it as traffic shifts,
  and give any bug that reaches production a permanent row.
- **Eval-driven development** — write the eval before the change, so a prompt edit is accepted or
  rejected by a number rather than three playground examples.
- **Offline eval and the regression subset** — the fixed set run before shipping, with a fast subset on
  every change that must not go down. It is systematically optimistic because it holds only the inputs
  you thought of: a good score is permission to run a canary, not evidence users are better off.
- **A/B test, canary and shadow** — a canary sends a small share of live traffic to the new version
  and watches metrics; a shadow sends a copy and discards the output; an A/B test splits traffic
  and compares outcomes. Shadow is safest and cannot measure user reaction.
- **LLM-as-judge** — scoring outputs against a rubric with a model, trustworthy only once you have
  measured agreement with human labels on a sample. Calibrate on a set humans already labelled and
  re-check whenever the judge model or rubric changes; an unvalidated judge is a random number
  generator with good prose.
- **Judge biases** — position (prefers first or last), verbosity (prefers longer) and
  self-preference (prefers its own family). Mitigate by randomising order, scoring against an
  explicit rubric with worked examples, and keeping criteria separate from one overall score.
- **Pairwise preference** — ask which of two outputs is better rather than scoring each alone. People and
  models are far more consistent at comparison, so it is the default for open-ended quality.
- **Failure taxonomy** — a named list of how your system gets things wrong: wrong retrieval, right
  document wrong extraction, refusal, format violation, tool misuse, truncation. Counts per class.
- **Faithfulness** — whether the answer is supported by the context supplied, measured separately
  from correctness. An answer can be true and unfaithful, which in a cited product is a bug.
- **Hallucination** — a fluent, confident statement the model was not entitled to make; reduced with
  grounding and detected by verification.
  *Contrast — retrieval failure:* retrieval failure is that the right document was never fetched;
  hallucination is that it was right there and the answer departed from it. Identical to the user,
  completely different fixes — chunking and ranking versus prompt constraints and citation
  enforcement. In mature RAG systems most reported hallucinations are the first thing.
- **Trace** — the tree of spans for one request or agent run, tied by an id that also appears in your
  logs and in user-visible errors. The hierarchy is session, then request or run, then a span per
  model call, retrieval and tool execution.
- **What to log per model call** — the rendered prompt and response, prompt and model version, token
  counts in and out, latency split into TTFT and total, cost, stop reason, and for retrieval the
  document ids. Log the rendered prompt, not just the template id: that is what you can reproduce.
- **Record and replay** — storing enough of a run (inputs, retrieved documents, tool results) to
  re-execute it against a new prompt or model. It is how a production trace becomes an eval row.
- **Feedback and sampling for review** — explicit signals are sparse and biased toward the annoyed;
  implicit ones (copy, accept, retry, rephrase, abandon) are denser and noisier. Review a stratified
  sample, not just complaints: the expensive failures are the ones nobody flagged.
- **Quality alerting** — page on signals that move when answers get worse while errors do not:
  refusal rate, truncation, citation-resolution failures, guardrail blocks, tool errors, retries,
  a sampled judge score. Watch distributions, not requests.
- **Drift** — quality changing without your code changing: the provider updates the model, your corpus
  changes underneath you, users shift toward new inputs. Pin versions, run the eval set on a schedule.
- **Guardrail** — a check outside the model, on input or output, that can block or modify; valuable
  because it is deterministic. The trap is calling a guardrail that is itself a prompt a control.
- **Prompt injection** — instructions planted in content the model reads that hijack an action taken on
  behalf of a trusting user. Direct injection arrives in the user's own message; indirect arrives
  through a web page, document, email or tool result, and is the dangerous one because nobody chose to
  trust it. What only sounds like a defence: telling the model to ignore instructions in documents,
  delimiting or escaping untrusted text, and a classifier flagging suspicious content — all suggestions
  an attacker gets to write around. What helps: least privilege on tools, human approval on
  irreversible or outbound actions, and treating model output as untrusted input downstream.
  *Contrast — jailbreak:* in a jailbreak the user is the attacker, talking the model out of its own
  rules — a content-policy problem. Injection is a third party, and a privilege and exfiltration
  problem that gets much worse once the model has tools.
- **Red teaming** — attacking your own system before users do: injection, jailbreaks, exfiltration
  through tools, harmful content. Findings become permanent eval rows.
- **PII redaction** — stripping personal data before it is logged, sent to a provider, or stored in
  an eval set. Hard because the payload you most want to keep is where the personal data is.

---

## The twelve confusions, in one line each

| Pair | The one line that separates them |
|---|---|
| Fine-tuning vs RAG | Changes how it *behaves* vs changes what it *knows right now* |
| Temperature vs top-p | Reshapes the distribution vs truncates it |
| Agent vs workflow | The model decides the next step vs your code does |
| Context window vs KV cache | A limit on what it may look at vs the memory of what it already did |
| Embedding vs token | A vector of meaning you index vs a chunk of text you are billed for |
| Prompt caching vs semantic caching | Reuse computation on an identical prefix vs skip the model for a similar question |
| TTFT vs inter-token latency | How long the user waits for anything vs how fast text flows after that |
| Injection vs jailbreak | A third party hijacks via content the model reads vs the user talks the model out of its rules |
| RLHF vs DPO | Learn a reward model then optimise vs optimise on preference pairs directly |
| LoRA vs full fine-tuning | Small added adapters, cheap and swappable vs all weights, powerful and expensive |
| Function calling vs MCP | The model capability to request a call vs the standard for shipping the tools |
| Hallucination vs retrieval failure | It had the source and departed from it vs it never got the source |

---

Say the first sentence, stop, and let them ask. These questions check that the word means
something specific to you, not that you can lecture. Where something is contested or moving
— pricing ratios, which model is best at what, how much a technique buys — say that it moves
and say what you would measure.
