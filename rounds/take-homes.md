# Take-home assignments

Reportedly present in roughly a third of AI-engineering processes, and where it
appears it is reported to **replace** an onsite round rather than add one. That
second part changes how you should treat it. It is not homework you do on top of
the loop — it is one of your interviews, and the conversation about it is the
part that is graded.

Everything below comes from candidate-reported experience, not from any
company's published process. Processes change. Say "as of recently, reportedly"
if you ever repeat a number from this page out loud, and ask your recruiter what
*their* current format is rather than assuming this one.

---

## The typical shape

A few hours of work. Build something small and real — an end-to-end slice, not a
component. You are given a dataset or an API, a loose goal, and a deadline
measured in days rather than hours of wall-clock.

Two things follow from "small and real":

- **End-to-end beats deep.** A thin system that ingests, retrieves, answers and
  logs beats an excellent retriever with nothing around it. They are testing
  whether you can produce a working system, and every reported grading
  conversation walks the whole path.
- **Real means it runs on their machine.** A README with an exact command, fixed
  dependency versions, and a small committed sample of data. If they cannot run
  it in five minutes they will grade the code by reading it, which is a worse
  deal for you.

---

## What you get asked to build

The reported mix, most common first:

| Assignment | What it usually is | What it is really testing |
|---|---|---|
| **RAG** | Index a corpus, answer questions over it with citations | Chunking and retrieval judgement; whether you evaluate retrieval separately from generation |
| **Agentic** | A loop with two or three tools that completes a multi-step task | Bounds, failure handling, and whether you knew to use a workflow instead |
| **Conversational** | Multi-turn assistant with state across turns | Context management and what you do when history outgrows the window |
| **Evaluation harness** | An LLM-as-judge pipeline that scores some existing system | Whether you calibrate the judge, or just trust it |

*Reported frequencies, not a permanent ranking.* The useful signal is that RAG
dominates, so if you prepare one deeply, prepare that one.

Notice that the four overlap. A RAG take-home graded well needs the evaluation
harness anyway. An agentic one needs the retrieval. Build the habit once.

---

## The delivery checklist

This is the part that decides the outcome. Four items, in order of how much they
move the grade:

| # | Deliverable | Why it outranks polish |
|---|---|---|
| 1 | **Working code** | The floor. If it does not run, nothing else is read |
| 2 | **Trace logs from a handful of real runs** | Proves the system ran on real input, and gives you something to point at in the defence |
| 3 | **A written paragraph on failure modes you found and did not fix** | The single strongest seniority signal in the packet |
| 4 | **Judge calibration against human labels**, for anything with a judge | Turns a number you asserted into a number you earned |

### 1. Working code

Runs from a clean clone with one documented command. Pinned versions. A sample
corpus or fixture committed so nothing depends on a key they do not have, or
fails closed with a clear message if it does.

**What you say out loud:** "Clone it, `cp .env.example .env`, one command, it
runs on the twenty sample documents in `data/`."

**What they are listening for:** that you thought about someone else running it.
That is the same instinct as thinking about someone else operating your service.

### 2. Trace logs from real runs

Ten or twenty real runs, saved. For each: the input, what was retrieved or which
tools were called, the prompt that went to the model, the output, tokens, cost
and latency. Commit them as files. Do not screenshot them.

Why this moves the grade more than a nicer UI: a UI shows the happy path once. A
trace file shows what the system actually does, including the runs where it did
something odd. It also changes the defence conversation from "what would you
expect it to do?" to "here is what it did" — and the second is a conversation you
cannot be caught out in.

**What you say out loud:** "Every run writes a trace. Run 7 is the interesting
one — the retriever pulled the right chunk ranked third, and the answer used the
first two."

**What they are listening for:** that you can debug your own system from
evidence rather than intuition. See
[../ai/06-observability.md](../ai/06-observability.md) for what a trace should
contain.

### 3. The failure modes you did not fix

One honest paragraph. Three or four specific failures you observed, what you
believe causes each, and why you left it — time, or a deliberate tradeoff.

Specific, not generic. Not "it sometimes hallucinates". Instead:

> "Questions that name two products retrieve chunks from both and the answer
> blends them. I think this is the chunker splitting product-name context away
> from the spec table. A parent-document retriever would probably fix it; I did
> not have time to re-index and re-measure, so I left it and it is the first
> thing I would do next."

This outranks polish because polish is cheap and self-knowledge is not. Anyone
can spend the last hour on styling. Knowing precisely where your own system is
weak requires you to have looked, which requires the traces in item 2, which
requires the thing to actually work. The paragraph is evidence that the whole
chain happened.

It also protects you. A failure you named is a failure you own. The same failure
found by the interviewer while you claim the system works is a very different
moment.

**What they are listening for:** calibration. Do you know how good your own work
is? A candidate who overclaims by 20% is a candidate whose future estimates are
worth 20% less.

### 4. Judge calibration

If any part of your submission scores outputs with a model, you must show that
the judge agrees with a human — and the human is you.

The minimum honest version: label 30 to 50 cases yourself, run the judge on the
same cases, report agreement, and report where it disagrees.

**What you say out loud:** "I hand-labelled 50 cases. The judge agrees on 43. All
seven disagreements are the judge passing an answer I called unfaithful — it is
lenient on partial citations. So my faithfulness number is optimistic, and I'd
trust it for comparing two versions, not as an absolute."

That last clause is the whole point. An uncalibrated judge score is a number with
no known relationship to the truth, and quoting it confidently is worse than
having no number at all. Calibration converts it into a number with stated
error bars. The mechanics — rubrics, pairwise versus absolute, the bias table —
are in [../ai/05-evaluation.md](../ai/05-evaluation.md).

---

## The current failure mode

**Reported most often: submitting something polished that you cannot extend live
in the follow-up conversation.**

The pattern is a submission with an abstraction layer for every provider, a
config system, a plugin registry, a clean UI — built partly by a coding agent,
and not fully in the candidate's head. Then the interviewer says "add a
reranking step" or "make it handle a follow-up question that refers to the
previous answer", and the candidate cannot do it in ten minutes on a call,
because they would first have to re-read their own indirection.

What this means in practice:

| Do | Do not |
|---|---|
| One file per stage, called in a line you can point at | A registry that resolves the stage at runtime |
| Config as constants at the top of the file | A layered config system |
| One model provider, hard-coded | A provider abstraction "for later" |
| The retrieval step as a function that takes a query and returns chunks | An interface hierarchy with three implementations |
| Spend the last hour on traces and the failure paragraph | Spend it on the UI |

**Keep the design simple enough that you can change it on a call.** The test is
concrete: pick the two most likely extensions — for RAG, adding a reranker and
adding hybrid search — and time yourself doing one. If it takes more than fifteen
minutes in your own codebase, the design is too clever for the round.

The corollary about agent-written code: use whatever tools you want, but do not
submit a line you cannot explain. Read every file before you send it. The defence
conversation is where unexplained code is found, and being unable to explain your
own submission is the one failure that no amount of quality recovers from.

---

## The defence conversation

This is the real round. The code is the artefact; the conversation is the
interview. Four questions come up reliably.

### "Why this chunking?"

**Answer with the property of the documents, not the number.** The number is the
consequence.

> "These are API reference pages, so the meaningful unit is a section under an
> H2 — a method plus its parameters. I split on headings and only fall back to a
> token cap when a section runs past about 800 tokens, with a small overlap so a
> split section keeps its lead-in. Fixed-size chunking cut parameter tables in
> half, which showed up as answers missing half the arguments."

**They are listening for:** whether you looked at the corpus. "512 with 50
overlap because that is standard" says you did not. Depth in
[../ai/02-rag.md](../ai/02-rag.md).

### "How do you know it works?"

**Answer with the evaluation, and separate retrieval from generation.** This is
where most candidates lose the round, by answering with a vibe.

> "Twenty questions with the correct source document labelled by hand. Retrieval
> gets recall@5 — currently 17 of 20. Generation is scored separately for
> faithfulness by a judge, calibrated against my own labels on those same cases.
> Separating them matters: two of my three bad answers were retrieval failures,
> so tuning the prompt would have done nothing."

If you did not have time for an eval set, say exactly that and say what you did
instead. "I did not build one; I ran fifteen questions by hand and read every
trace, and here is the sheet" is a real answer. "It seemed good" is not.

### "What breaks at 100x?"

**Pick the first thing that breaks, name the number that breaks it, and say what
you would do.** One specific bottleneck beats a survey.

> "First thing to break is index build time — it is single-threaded and
> synchronous, about four minutes for 20k chunks, so 2M chunks is hours and no
> incremental update path. I'd move ingestion to a queue with workers and make
> re-indexing per-document. Second is the reranker: it is a per-query model call
> over 50 candidates, so it dominates p99 latency and cost. I'd cut candidates to
> 20 and cache by query hash. The vector store is fine — flat search is fine at
> 20k and I'd switch to HNSW at a million, trading a few points of recall for the
> latency."

**They are listening for:** that you know which dimension actually grows. Answer
the same way as the scaling question in
[../system-design/framework.md](../system-design/framework.md) — derive it, do
not guess it.

### "What would you do with another week?"

**A ranked list of three, with the reason each is ranked there.** Ranked, because
the ranking is the signal. Start with the first item from your failure-modes
paragraph — it shows the two documents are one mind.

> "One, fix the two-product retrieval failure, because it is the only failure I
> saw that produces a confidently wrong answer rather than a weak one. Two,
> triple the eval set, because at twenty cases a one-case change is noise and I
> cannot tell small improvements apart. Three, add caching — it does not change
> quality but it is what makes the cost sane, and it is the cheapest of the
> three."

Never answer this with "more features". The good answer is almost always
correctness, then measurement, then efficiency.

---

## Scoping: what to cut

Assume the assignment is bigger than the time given. That is usually deliberate —
they are watching you prioritise.

**Cut in this order:**

| Priority | Keep | Cut first |
|---|---|---|
| 1 | One end-to-end path that runs | Breadth of features |
| 2 | Traces for real runs | Any UI beyond a CLI |
| 3 | A small eval set, even 20 cases | Large-scale ingestion |
| 4 | The failure-modes paragraph | Provider abstractions, config layers |
| 5 | A README with the run command | Auth, multi-user, persistence beyond a local file |

**Say what you cut and why, in the README, at the top.** Three or four lines:

> **Scope.** Four hours. I built ingest → retrieve → answer → trace for a single
> corpus with a CLI. I cut: hybrid search (I'd add BM25 first if the eval showed
> keyword misses — it did not, in these 20 cases); any UI; multi-user. I spent
> the time I saved on the eval set and on the failure notes below.

This earns more than silently shipping less for a simple reason: a small
submission with no note reads as *all you could build*. The same submission with
the note reads as *what you chose to build*, and the choice is the thing being
graded. It also pre-empts the obvious criticism — an interviewer who was going to
ask "why no hybrid search?" now reads that you considered it and had a reason.

The failure to avoid is the inverse: starting everything, finishing nothing, and
submitting four half-paths. One complete path plus an honest list of what is
missing beats four stubs every time.

---

## What to ask the recruiter

Ask before you start. None of these are awkward questions, and the answers
change what you build:

- How many hours is this meant to take, and is there a hard cap you would like me
  to respect?
- Is the follow-up a code walkthrough, a live extension, or both? (This directly
  sets how simple your design needs to be.)
- Does it replace a round, and which one?
- Am I allowed to use coding assistants? (Usually yes; ask anyway, and either way
  do not submit code you cannot explain.)
- Is there an API key or budget provided, or am I using my own?

---

## Related

- [../ai/02-rag.md](../ai/02-rag.md) — chunking, hybrid search, reranking,
  retrieval evaluation
- [../ai/03-agents.md](../ai/03-agents.md) — tool design, bounds, error
  compounding, agent evaluation
- [../ai/05-evaluation.md](../ai/05-evaluation.md) — eval sets, LLM-as-judge,
  rubrics, judge bias and calibration
