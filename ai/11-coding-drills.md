# Coding drills

The implementation round, and the one file here that is code-first. Three
exercises account for most of what gets asked: **attention from scratch** (a ladder
inside one hour — attention → multi-head → KV cache → grouped-query), **debug a
broken transformer**, and **concurrency against a rate-limited model API**.

It is still not a code file. The candidate is talking the whole time, and the grade
comes from the narration as much as from the code. Two people can write the same
forty lines and get opposite decisions: one said why the scale factor is there, the
other typed quietly and finished early. So: say the plan before you type, annotate
shapes as comments rather than in your head, state complexity unprompted, name the
trap you are avoiding, and never go silent — deriving it out loud beats recalling
it silently.

**On sourcing.** From a sweep of candidate-reported interviews — "reported as common
recently", not a fixed syllabus, and unattributed because the source material was.
Ask the recruiter for a specific loop's format; they usually tell you. Sections 1
and 2 are NumPy and section 3 is JavaScript, which is how they are reportedly most
often done; the Python has been run under NumPy and the JavaScript under Node against
the stub in section 3, and every quoted number is measured, not estimated.

---

# Section 1 — Attention from scratch

The most common implementation exercise, usually a ladder: plain attention
(10–15 min), multi-head with a causal mask (15–20 min), a KV cache (the filter),
grouped-query (the bonus). Most people reach step 2. Step 3 separates candidates,
because it needs you to understand what the cache is *for*.

| Symbol | Meaning | Typical |
|---|---|---|
| `B` | batch size | 1–64 |
| `L` | sequence length (tokens) | 512–128k |
| `d_model` | model width | 768–8192 |
| `h` | number of query heads | 12–64 |
| `d_k` | per-head width, `d_model / h` | 64–128 |
| `h_kv` | number of key/value heads (GQA) | 1–`h` |
| `t` | current position during decoding | — |

---

## Drill 1.1 — Scaled dot-product attention

> "Implement attention. NumPy is fine, no frameworks. Start wherever you like."

The vagueness is deliberate. **Ask three questions, then start:** batched or single
sequence, causal or bidirectional, single-head first or multi-head straight away.
Then propose single-head unbatched first. It is not testing the formula: it is
testing whether you hesitate at `K.T`, whether `1/√d_k` is an incantation or a
derivation, and whether you volunteer O(L²) before being asked. The third is the
senior signal.

```python
import numpy as np

NEG = -1e9   # additive mask value; see the trap note below


def softmax(x, axis=-1):
    """Numerically stable: subtract the max before exponentiating."""
    x = x - x.max(axis=axis, keepdims=True)
    e = np.exp(x)
    return e / e.sum(axis=axis, keepdims=True)


def causal_mask(Lq, Lk):
    """
    True where a query may attend to a key.  Lq == Lk during prefill; during
    decode Lq == 1 and Lk == t+1, so the query's absolute position is
    (Lk - Lq) + its index — the most common off-by-one in this drill.
    """
    i = np.arange(Lq)[:, None] + (Lk - Lq)   # (Lq, 1)  absolute query position
    j = np.arange(Lk)[None, :]               # (1, Lk)  absolute key position
    return j <= i                            # (Lq, Lk) note <=, not <


def sdpa(Q, K, V, mask=None):
    """
    Q: (..., Lq, d_k)   K: (..., Lk, d_k)   V: (..., Lk, d_v)
    mask: (Lq, Lk) boolean, True = allowed
    """
    d_k = Q.shape[-1]
    scores = Q @ K.swapaxes(-1, -2) / np.sqrt(d_k)    # (..., Lq, Lk)
    if mask is not None:
        scores = np.where(mask, scores, NEG)          # (..., Lq, Lk)
    W = softmax(scores, axis=-1)                      # (..., Lq, Lk) rows sum to 1
    return W @ V, W                                   # (..., Lq, d_v)
```

The leading `...` means it batches and multi-heads for free. **The trap in `NEG`:**
`-np.inf` gives `nan` the moment a row is fully masked — which happens with a padding
mask on a padded-out position, and with an off-by-one causal mask. `-1e9` makes that
row uniform: still wrong, but visible in a plot instead of poisoning every gradient.

**What you say.** "I'm masking the *scores*, before the softmax, not the
probabilities after it — mask after and you zero out entries of a distribution that
already summed to one, so the future has leaked into the denominator. It trains fine
and evaluates wrong." Then, unprompted: "time is O(`L²·d_k`), memory is O(`L²`), and
the memory bites first — at 4k context, 32 heads, fp16, that score matrix is about a
gigabyte per layer, which is why FlashAttention exists." Then pre-empt the scale
follow-up: "`q·k` sums `d_k` products, so its standard deviation grows with √`d_k`;
feed a softmax values with std 11 and it saturates to one-hot, and a saturated
softmax has near-zero gradient." Measured on random unit-variance vectors, 64 keys:

| `d_k` | score std | √`d_k` | entropy unscaled | entropy scaled |
|---|---|---|---|---|
| 16 | 4.04 | 4.0 | 1.34 | 3.68 |
| 64 | 8.06 | 8.0 | 0.59 | 3.69 |
| 128 | 11.15 | 11.3 | 0.42 | 3.70 |

Uniform attention over 64 keys is `ln 64 ≈ 4.16` nats; unscaled at `d_k = 128` it is
at 0.42 before training starts. **The sentence that lands:** "without the scale the
bug gets worse as the model gets wider, so it looks fine in your toy test and fails
at real size."

**Follow-ups.** *Why softmax, not plain normalisation?* A positive distribution with
well-behaved gradients — a differentiable argmax; raw scores let negative weights
flip the sign of a value vector. *Bidirectional?* Drop the mask. *Padding?* A second
mask `(B, 1, 1, Lk)`, logical-and with the causal one; the trap is a fully-padded
row, the nan case again. *128k context?* Quadratic, so 32× the length is 1024× the
score memory; name FlashAttention (tile it), sliding-window (bound `Lk`) or linear
attention (lose some quality), and say what the one you pick costs.

---

## Drill 1.2 — Multi-head attention

> "Now make it multi-head, with a causal mask, and batched."

**It is testing the reshape, almost entirely.** `split` and `merge` are where this
is won and lost, because the wrong version has *the right shape* and silently
produces garbage. Second: whether you know what the output projection is for.

```python
class MHA:
    """n_kv_heads: None or h -> MHA, 1 -> multi-query, between -> grouped-query."""

    def __init__(self, d_model, n_heads, n_kv_heads=None, seed=0):
        assert d_model % n_heads == 0, "d_model must divide evenly into heads"
        self.d_model = d_model
        self.h = n_heads
        self.d_k = d_model // n_heads
        self.h_kv = n_heads if n_kv_heads is None else n_kv_heads
        assert self.h % self.h_kv == 0, "query heads must group evenly"
        self.rep = self.h // self.h_kv          # queries per kv head

        rng = np.random.default_rng(seed)
        s = d_model ** -0.5
        self.Wq = rng.normal(0, s, (d_model, self.h * self.d_k))       # (d_model, d_model)
        self.Wk = rng.normal(0, s, (d_model, self.h_kv * self.d_k))    # (d_model, h_kv*d_k)
        self.Wv = rng.normal(0, s, (d_model, self.h_kv * self.d_k))    # (d_model, h_kv*d_k)
        self.Wo = rng.normal(0, s, (self.h * self.d_k, d_model))       # (d_model, d_model)

    def split(self, x, n):
        """(B, L, n*d_k) -> (B, n, L, d_k).  Reshape FIRST, then transpose."""
        B, L, _ = x.shape
        return x.reshape(B, L, n, self.d_k).transpose(0, 2, 1, 3)

    def merge(self, x):
        """(B, h, L, d_k) -> (B, L, h*d_k).  Exact inverse of split."""
        B, h, L, dk = x.shape
        return x.transpose(0, 2, 1, 3).reshape(B, L, h * dk)

    def __call__(self, x, cache=None):
        """x: (B, L, d_model) -> (B, L, d_model)"""
        B, L, _ = x.shape
        Q = self.split(x @ self.Wq, self.h)        # (B, h,    L, d_k)
        K = self.split(x @ self.Wk, self.h_kv)     # (B, h_kv, L, d_k)
        V = self.split(x @ self.Wv, self.h_kv)     # (B, h_kv, L, d_k)

        if cache is not None:                      # drill 1.3
            if cache.get("K") is not None:
                K = np.concatenate([cache["K"], K], axis=2)   # (B, h_kv, t+L, d_k)
                V = np.concatenate([cache["V"], V], axis=2)
            cache["K"], cache["V"] = K, V

        if self.rep > 1:                           # drill 1.4
            K = np.repeat(K, self.rep, axis=1)     # (B, h, Lk, d_k)
            V = np.repeat(V, self.rep, axis=1)

        m = causal_mask(Q.shape[2], K.shape[2])    # (Lq, Lk)
        out, W = sdpa(Q, K, V, m)                  # (B, h, Lq, d_k)
        return self.merge(out) @ self.Wo, W        # (B, Lq, d_model)
```

Writing `Wk`/`Wv` at width `h_kv * d_k` from the start costs nothing and means drill
1.4 is already done. Say so while you type it.

**The most important sentence in the section**, at the reshape: "Reshape first, then
transpose. Memory is token-major — `(B, L, d_model)` is token 0's whole 768-dim
vector, then token 1's. Reshaping to `(B, L, h, d_k)` re-labels those floats as 12
groups of 64 without moving anything, and *then* I transpose. Reshaping straight to
`(B, h, L, d_k)` gives the same shape with completely different data: the first
`L*d_k` floats land in head 0, which is tokens, not features. That version runs,
trains, and quietly caps your quality." And at `Wo`: "without it, head `i`'s output
only lands in output dims `i*d_k` to `(i+1)*d_k` — the heads never mix."

**Follow-ups.** *Why not one head of width `d_model`?* One softmax, one weighted
average, one thing attended to; a token needing both its syntactic parent and an
earlier mention gets the average and neither. It is not more compute either —
`h · d_k = d_model`, same FLOPs for `h` attention patterns. *Why 12 heads and not
96?* `d_k` has a floor below which the per-head subspace cannot represent a useful
matching criterion; it is empirical, and hardware tile sizes often decide it.
*Residual and norm?* Pre-norm, `x = x + attn(norm(x))` then `x = x + mlp(norm(x))`,
which keeps the residual path clean. *Parameters?* `4·d_model²` for MHA,
`2·d_model² + 2·d_model·h_kv·d_k` for GQA.

---

## Drill 1.3 — KV cache for incremental decoding

> "Now I want to generate text one token at a time. Make that efficient."

**This is the filter**, and not because of the code — it is the four lines already in
`MHA.__call__`. What is tested is whether you can articulate **what changes between
prefill and decode**, because that one distinction explains why input tokens are
cheaper than output tokens, why time-to-first-token and inter-token latency need
different fixes, why batching helps decode more than prefill, and why long context
stays expensive after the prompt is processed.

**What is cached:** the projected keys and values — not the raw tokens, not the
attention output. For a fixed position they never change, since `K[j]` depends only
on token `j`. Queries are not cached; you only need the one you are generating.

| | Prefill | Decode |
|---|---|---|
| Query length | `L` (whole prompt) | 1 |
| Key/value length | `L` | `t+1`, growing |
| Score matrix | `(B, h, L, L)` | `(B, h, 1, t+1)` |
| Arithmetic per step | O(`L² · d`) | O(`t · d`) |
| Weights read per step | once, amortised over `L` tokens | once, for **one** token |
| Bound by | compute | memory bandwidth |
| Parallelism | high — all positions at once | none within a sequence |
| Causal mask | required | trivially all-True |
| Batching | awkward, lengths differ | easy, one token each |

> "Prefill is one big matmul, compute-bound, parallelises beautifully — that is why
> input tokens are cheap. Decode does tiny arithmetic per step but still reads the
> entire model's weights from HBM plus the whole cache to produce one token, so it is
> bandwidth-bound. That asymmetry is the whole reason output tokens cost more."

Then the size: `2 × n_layers × h_kv × d_k × seq_len × bytes` per sequence. 32 layers,
32 KV heads, `d_k` 128, 8k context, fp16 → about 4.3 GB for **one** sequence. Batch 8
users and the cache is bigger than the weights. Do that arithmetic on the board.

**Follow-ups.** *Position offset wrong?* With absolute embeddings every generated
token gets position 0 and it degenerates immediately; with RoPE you rotate the query
by the wrong angle and get coherent text that drifts — worse, and the reason to test
against a full forward pass rather than by reading output. *How do you know the cache
is right?* Diff incremental decode against the uncached path (check 3 below); nothing
else catches every version of the bug. *Why does batching help decode?* Reading the
weights once for 32 sequences instead of 32 times is a 32× bandwidth win at nearly
the same latency. *Sampling?* Greedy is argmax, temperature divides the logits before
softmax, top-p keeps the smallest set exceeding `p` — none of it touches the cache.
*The cache grows without bound?* In order of quality cost:

| Approach | What it does | Cost |
|---|---|---|
| Paged attention | Fixed blocks instead of one contiguous buffer | None; removes fragmentation |
| Prefix sharing | One copy of a shared system prompt | None, when prefixes match |
| Quantise the cache | fp16 → int8 halves it | Small quality loss, needs care |
| Sliding window | Keep only the last `W` tokens | The model cannot see past `W` |
| Eviction / H2O-style | Drop low-attention positions | Unpredictable |

Name paged attention and prefix sharing first. They are free, and knowing they are
free is the signal.

---

## Drill 1.4 — Grouped-query attention

> "The KV cache is too big. What would you change?"

A bonus round, which makes getting it disproportionately valuable. It tests that
cache size depends on `h_kv`, not `h`, and that this buys *bandwidth*, not FLOPs.
Candidates who call GQA "faster" without saying why get a follow-up they fail. The
implementation is the two `np.repeat` lines in `MHA.__call__` plus the narrower
`Wk`/`Wv`. That is the entire change.

| Variant | `h_kv` | Cache vs MHA | Cost |
|---|---|---|---|
| MHA | `h` | 1× | — |
| GQA | `h / rep` | `1/rep` | Small quality loss, reportedly minor at rep 4–8 |
| MQA | 1 | `1/h` | Noticeable quality loss, can be unstable to train |

**The trap:** `np.repeat`, not `np.tile`. `repeat` with `rep=2` on heads `[0, 1]`
gives `[0, 0, 1, 1]`; `tile` gives `[0, 1, 0, 1]`. Query heads 0 and 1 form group 0
and must share KV head 0, so `tile` runs, has the right shape, and pairs every query
head with the wrong key head.

> "GQA does not reduce the arithmetic — I repeat K and V back up to `h` heads, so the
> matmuls are identical. What shrinks is the cache and the bytes moved per decoded
> token, and decode is bandwidth-bound, so that is exactly the axis that matters.
> That 4.3 GB becomes about 1.1 GB with 8 KV heads instead of 32, which is four times
> the concurrent sequences on the same GPU."

**Follow-ups.** *Why not MQA?* Reportedly loses more quality and is harder to train
stably — be honest that you are repeating a result, not deriving it. *Does GQA help
prefill?* Barely; prefill is compute-bound. It shrinks the cache written during
prefill, which helps the *next* phase. *What else shrinks the cache?* The table in
1.3 — but GQA is a training-time architecture change and the rest are serving-time
choices, so you cannot retrofit it without retraining. In a real kernel you would
broadcast the KV head index rather than materialise the repeat; say that too.

---

## The correctness checks

Volunteer these. Nobody hands you a harness, and writing your own is a plus. All
three pass against the code above.

```python
B, L, d_model, h = 2, 6, 16, 4
x = np.random.default_rng(1).normal(0, 1, (B, L, d_model))
m = MHA(d_model, h)
y, W = m(x)

# 1. Shape, distribution, causal mask.
assert y.shape == (B, L, d_model) and W.shape == (B, h, L, L)
assert np.allclose(W.sum(-1), 1.0)
assert np.allclose(np.triu(W, 1), 0, atol=1e-7)

# 2. Causality as a property: perturbing token 4 must not move outputs 0..3.
x2 = x.copy(); x2[:, 4, :] += 5.0
y2, _ = m(x2)
assert np.allclose(y[:, :4], y2[:, :4])     # past unchanged
assert not np.allclose(y[:, 4], y2[:, 4])   # its own output DID change

# 3. KV cache: incremental decode reproduces the full forward pass.
cache = {"K": None, "V": None}
inc = np.concatenate([m(x[:, t:t+1, :], cache=cache)[0] for t in range(L)], 1)
assert np.allclose(inc, y, atol=1e-10)
```

"Lower-triangular weights test my mask. A future token not changing a past output
tests causality. Those are different things, and the second is what I'd put in CI."
Check 3 is the only thing that reliably catches KV cache bugs.

---

# Section 2 — Debug a broken transformer

Increasingly common, and a better predictor of the job: you will spend far more time
reading a model implementation that almost works than writing one from scratch. Two
variants — bugged code (3–6 planted bugs, 30–45 min), and a broken notebook that
errors on run. **The method is the grade:** someone who finds four of six bugs
systematically beats someone who finds five by staring. State it before you scroll.

| Step | What you do | What it catches |
|---|---|---|
| 0. Run it | Read the traceback | The free ones |
| 1. Shapes | Assert — not print — after every line that changes one | Reshape order, wrong axis, broadcast-instead-of-error |
| 2. One token by hand | `B=1, L=2, d_model=2, h=1`, `Wq=Wk=Wv=Wo=I` | Missing scale, missing projection, wrong operand order |
| 3. Properties | Rows sum to 1, causality, cache == full | Mask bugs, off-by-one, position bugs |
| 4. Reference diff | Against torch or a known-good path | Everything left, but tells you least about *why* |

An assertion stops; a print scrolls past. Step 4 is last: it tells you *that* you are
wrong and almost nothing about *where*. **What most candidates do instead** is read
top to bottom looking for something that seems off — that finds the obvious bug,
misses the subtle three, and gives the interviewer nothing to grade but luck. Say it
out loud: "I'd rather find these with assertions than by reading, because reading is
how they got in."

**The listing, compressed.** A real one runs to a few hundred lines; this is stripped
to just the six. Find them before you read the table.

```python
def softmax(x, axis=-1):
    e = np.exp(x - x.max(axis=axis, keepdims=True))
    return e / e.sum(axis=axis, keepdims=True)

def causal_mask(L):
    i, j = np.arange(L)[:, None], np.arange(L)[None, :]
    return j < i

def split(x, h):
    B, L, D = x.shape
    return x.reshape(B, h, L, D // h)

def merge(x):
    B, h, L, d_k = x.shape
    return x.reshape(B, L, h * d_k)

def block(x, pos, Wq, Wk, Wv, Wo, h=4):
    Q, K, V = split(x @ Wq, h), split(x @ Wk, h), split(x @ Wv, h)
    scores = Q @ K.swapaxes(-1, -2)
    P = softmax(scores, axis=-1)
    P = np.where(causal_mask(x.shape[1]), P, 0.0)
    return merge(P @ V) + pos
```

## The fix log — the six bugs usually planted in a decoder block

| # | Bug | Symptom | Root cause | Minimal fix | Assertion |
|---|---|---|---|---|---|
| 1 | Mask applied after softmax | Trains, loss falls *faster* than it should, evaluates worse | Softmax already normalised over the future, so zeroing afterwards removes mass, not candidates — and the future leaks through the denominator | `scores = np.where(mask, scores, NEG)` before the softmax | `assert np.allclose(P.sum(-1), 1.0)` |
| 2 | `j < i` instead of `j <= i` | With `-1e9`, row 0 goes uniform over the whole sequence including the future; with `-inf`, `nan` after one step | A token must attend to itself: position `i` sees keys `0..i` inclusive | `j <= i` | `assert m.sum(-1).tolist() == list(range(1, L+1))` |
| 3 | Reshape without the transpose | Runs, right shape, trains, quality silently capped | Memory is token-major, so a head-major reshape fills head 0 with the first few *tokens*, not the first feature group of every token | `x.reshape(B, L, h, d_k).transpose(0, 2, 1, 3)`, inverted on the way out | Per-head slice: `assert np.allclose(split(x,h)[:, i], x[:, :, i*d_k:(i+1)*d_k])` |
| 4 | No output projection | Works, trains, quality capped | Head `i`'s result stays in output dims `[i·d_k, (i+1)·d_k)`; nothing mixes them | `return merge(out) @ Wo` | Perturb one head's V, assert every output dim moves |
| 5 | No `1/√d_k` | Loss plateaus high and early; **worse as the model gets wider**, so a toy test at `d_k=8` looks fine | Score variance grows with `d_k`, and a saturated softmax has near-zero gradient | Divide by `np.sqrt(d_k)` | `assert scores.std() < 2.0` at init, or entropy `> 0.7 * np.log(L)` |
| 6 | Positions added after attention | Learns something, but word-order-sensitive evaluation is bad | Attention is permutation-equivariant; only positions in Q/K before the scores (or the mask) make it order-aware | Add to the embeddings before the projections, or RoPE on Q and K after projection | Shuffle the input, assert the weights are not merely permuted |

Bugs 1 and 2 usually appear together, and the combination is the loudest thing in the
file: row 0 keeps nothing, so **every attention weight for token 0 is exactly zero**,
for any input and any seed. That is the argument for running before reading — visible
in one `print`, pointing straight at the mask.

Three traps the table cannot hold. **The round-trip test is not enough for bug 3**:
if the author made the mirrored mistake on the way out, split-then-merge is the exact
identity and the test passes, so you need a check that pins the semantics of a head.
**RoPE rotates Q and K, never V** — V carries content, not a matching criterion.
**RoPE during decode** must use absolute position `t`, not 0; getting it wrong gives
fluent output that loses the plot, which is what check 3 above catches.

## The environmental class

From the broken-notebook variant, where the bug is plumbing rather than maths. The
dangerous shape bugs broadcast instead of throwing: a mask of `(L,)` where you meant
`(B, 1, L, L)` gives every query the same mask, `(L, 1)` for `(L, L)` masks whole
queries instead of whole keys, and `(B, L, 1) × (B, 1, L)` produces `(B, L, L)` and
looks deliberate. Assert the shape you expect at every boundary, with the actual
shape in the message.

| Class | The subtle version | Assertion |
|---|---|---|
| Wrong device | A tensor built inside `forward` defaults to CPU — pass `device=x.device`. `.to()` is not in place for tensors but *is* for models, and an optimizer built before the move holds the old CPU parameters | `assert x.device == mask.device == next(model.parameters()).device` |
| Detached gradient | A leftover `.detach()`, an `.item()` mid-computation, an over-wide `no_grad()`, a `.numpy()` round trip, `p.data = ...`, or `requires_grad=False` on a layer you meant to train | After one `backward()`, loop `named_parameters()` and assert every `p.grad` is not None and not all zero |
| Missing `zero_grad()` | Not detached — accumulating. Different bug, same "loss looks weird" | The same loop |

**What you say while debugging.** On finding one: "Found one. I'll note it and keep
looking rather than fix it now, because if there are several I'd rather see them all
before I change behaviour." When unsure: "let me check rather than guess" — then run
a three-line experiment. Close on the control, not the patch: shape assertions at
each boundary, rows-sum-to-one, a causality test that perturbs a future token, and
incremental-equals-full for the cache.

---

# Section 3 — Concurrency against a rate-limited model API

> "You need to run one model call over tens of thousands of documents. The API allows
> about a hundred concurrent requests. It intermittently returns 429s and sometimes
> just hangs. Write it."

**Four things are tested, only the first is concurrency:** whether you bound concurrency,
whether you separate concurrency from rate, whether one bad document kills 40,000 good
ones, and whether resumption comes up before they ask — the seniority signal, because
anyone who has run a 40,000-item batch knows it dies at item 31,000. **Say the wrong
answer first:** `Promise.all` opens 40,000 sockets, one rejection discards every
success, and a process death leaves nothing. "Bound the concurrency, isolate, checkpoint."

**1. The bounded worker pool.**

```js
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function runPool(items, worker, { concurrency = 8 } = {}) {
  const results = new Array(items.length)
  let next = 0
  const lanes = Math.min(concurrency, items.length)

  async function lane() {
    for (;;) {
      const i = next++
      if (i >= items.length) return
      results[i] = await worker(items[i], i)   // worker must never throw
    }
  }

  await Promise.all(Array.from({ length: lanes }, lane))
  return results
}
```

"`N` lanes pulling from a shared cursor, not chunks of `N` — chunking stalls the whole
batch on its slowest item. Fifteen lines; in production I'd use `p-limit`."

**2. Retry with exponential backoff and full jitter.**

```js
const RETRYABLE = new Set([408, 409, 425, 429, 500, 502, 503, 504])
const isRetryable = (e) => RETRYABLE.has(e.status) || e.code === 'ETIMEDOUT'

async function withRetry(fn, { retries = 5, baseMs = 50, capMs = 8000 } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn(attempt)
    } catch (err) {
      if (!isRetryable(err) || attempt >= retries) throw err
      const ceiling = Math.min(capMs, baseMs * 2 ** attempt)
      await sleep(err.retryAfterMs ?? Math.random() * ceiling)   // full jitter
    }
  }
}
```

"I only retry what can succeed — a 400 is a malformed document, so retrying is five
times the cost for the same failure. Without the cap, attempt 10 sleeps 51 seconds and
the job looks hung. And `Retry-After` beats my backoff: mine is a guess, theirs is truth."

**Jitter is not optional**: a 429 is a *synchronising event* — it takes independent
clients and puts them in lockstep, and every backoff step preserves it. Full jitter
breaks the correlation. Simulated — 500 clients blocked at t=0, a server admitting 50
per 10ms slot, `withRetry`'s own `baseMs = 50` and `capMs = 8000`, retried until drained:

| | Total attempts for 500 items | Wasted calls | Biggest later collision |
|---|---|---|---|
| Backoff, no jitter | 2750 (exact, it is deterministic) | 2250 | 450 clients in one slot |
| Backoff, full jitter | 1190–1196 over four seeds | ~690 | 110–120 clients |

**Jitter is not politeness, it is 2.3× fewer calls for the same work.**

**3. A timeout that actually cancels.**

```js
async function withTimeout(fn, ms) {
  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), ms)
  try {
    return await fn(ac.signal)
  } catch (err) {
    if (ac.signal.aborted) {
      const e = new Error(`timed out after ${ms}ms`)
      e.code = 'ETIMEDOUT'
      throw e
    }
    throw err
  } finally {
    clearTimeout(t)
  }
}
```

"`Promise.race` abandons the local promise but the HTTP request is still open and the
server is still working. When my lane retries I have two requests in flight for one
item — my pool says eight, the provider sees nine." Ten runs against the stub below,
pool size 8, 300 documents, 60ms timeout. Real timers, so the race row moves per run:

| Timeout style | Peak concurrency at the API | 429s received | Total calls |
|---|---|---|---|
| `Promise.race`, no abort | 9 | 57–77 | 382–399 |
| `AbortController`, signal passed through | 8 | 0 | 326, identical every run |

Abandoned requests keep occupying the provider's slots, and the extra load causes 429s
a bounded pool never sees. "Assert on observed concurrency at the provider, not my
pool's configured size — only one of those is real."

**4. Per-item error isolation and resumable checkpointing.**

```js
const fs = require('fs')

class Checkpoint {
  constructor(file) {
    this.file = file
    this.done = new Map()
    if (fs.existsSync(file)) {
      for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
        if (line) { const r = JSON.parse(line); this.done.set(r.id, r) }
      }
    }
    this.out = fs.createWriteStream(file, { flags: 'a' })
  }
  has(id) { return this.done.has(id) }
  record(rec) { this.done.set(rec.id, rec); this.out.write(JSON.stringify(rec) + '\n') }
  close() { return new Promise((r) => this.out.end(r)) }
}
```

"Append-only JSONL, one line per terminal outcome, keyed by document id. Append because
a partial write costs one corrupt trailing line I drop on load, where rewriting a whole
blob every item risks everything to one bad shutdown and is O(n²) writes besides. On
startup I filter the work list by it, which makes the job idempotent."

**5. Putting it together.**

```js
async function processCorpus(docs, api, opts) {
  const { concurrency = 8, checkpointFile, bucket, estimateTokens } = opts
  const cp = new Checkpoint(checkpointFile)
  const todo = docs.filter((d) => !cp.has(d.id))
  const stats = { ok: 0, failed: 0, skipped: docs.length - todo.length, attempts: 0 }

  await runPool(todo, async (doc) => {
    try {
      const res = await withRetry(async () => {
        stats.attempts++
        const est = estimateTokens ? estimateTokens(doc) : 1
        if (bucket) await bucket.take(est)
        const out = await withTimeout((signal) => api.summarise(doc, { signal }), 60)
        if (bucket && estimateTokens) bucket.refund(est - out.tokens)  // reconcile
        return out
      })
      cp.record({ id: doc.id, status: 'ok', summary: res.summary })
      stats.ok++
    } catch (err) {
      // Per-item isolation. One poisoned document must not kill the batch.
      cp.record({ id: doc.id, status: 'failed', error: String(err.status ?? err.code) })
      stats.failed++
    }
  }, { concurrency })

  await cp.close()
  return stats
}
```

**The most important line is the `catch`.** It turns a throw into a recorded outcome,
which is what makes `runPool`'s "worker must never throw" contract hold. And failures
are checkpointed too — a failed document is a *terminal outcome*, not a gap. Record
only successes and every rerun retries the malformed dozen forever, never converging.

**6. The token bucket.** A pool bounds how many requests are *in flight*, not how many
you *start per second*. Providers enforce both, and the distinction is the signal.

```js
class TokenBucket {
  constructor({ ratePerSec, burst = ratePerSec }) {
    this.rate = ratePerSec
    this.capacity = burst
    this.tokens = burst
    this.last = Date.now()
  }
  #refill() {
    const now = Date.now()
    this.tokens = Math.min(this.capacity, this.tokens + ((now - this.last) / 1000) * this.rate)
    this.last = now
  }
  async take(n = 1) {
    if (n > this.capacity) throw new Error(`request of ${n} exceeds burst ${this.capacity}`)
    for (;;) {
      this.#refill()
      if (this.tokens >= n) { this.tokens -= n; return }
      await sleep(Math.max(2, ((n - this.tokens) / this.rate) * 1000))
    }
  }
  refund(n) { this.tokens = Math.min(this.capacity, this.tokens + n) }
}
```

"Lazy refill — what accrued since the last call, instead of a timer, so there is no
background interval to leak. The guard matters: a request needing more tokens than the
bucket can ever hold never terminates. That is a deadlock, not an error, and it shows
up on your longest document at 2am." Eight concurrent requests that each take 10ms is
800 per second, which a concurrency limit does not constrain at all.

**The stub.** Every measured number in this section comes from the code above run
against this, under Node — scaled down to a budget of 8 so it finishes in seconds.

```js
function stubApi({ cap = 8, seed = 1 } = {}) {
  let live = 0, peak = 0, calls = 0
  const seen = new Set()
  const rand = () => (seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31
  const err = (s) => Object.assign(new Error(`HTTP ${s}`), { status: s })
  return {
    stats: () => ({ peak, calls }),
    async summarise(doc, { signal } = {}) {
      calls++; live++; peak = Math.max(peak, live)
      const hang = doc.id % 11 === 0 && !seen.has(doc.id)   // hangs once, then recovers
      seen.add(doc.id)
      try {
        if (doc.id % 25 === 0) throw err(400)               // permanently malformed
        if (live > cap) throw err(429)                      // the concurrency budget
        await new Promise((ok, no) => {
          const t = setTimeout(ok, hang ? 400 : 5 + rand() * 15)
          signal?.addEventListener('abort', () => { clearTimeout(t); no(err(499)) })
        })
      } finally { live-- }
      return { summary: doc.id, tokens: 120 }
    },
  }
}
```

Peak is counted on entry, so a request you abandoned still occupies a slot — that is
what makes the timeout table measurable. **The run:** 500 documents, do the first 300,
kill it, restart over all 500. Pacing is a second run — 200 documents, a bucket at 4000
tokens/s, reserving 300 per document against an actual 120.

```
  ok   peak concurrency at the API was 8, never above the pool size
  ok   12 permanent failures isolated, 288 successes kept
  ok   resume skipped the 300 already-finished docs
  ok   exactly one terminal record per doc (500), no duplicated work
  ok   token bucket paced 200 docs over 6.8s — 15.4s with the refund removed
```

Volunteer the tests — those properties are what is being graded. Then close on
observability: "attempts, retries by status code, observed concurrency, items per
second. The first question is always 'stuck or slow', and from outside they look alike."

### Follow-up 1 — "Now make it distributed across workers"

**Lead with the boring answer.** "Ten workers against a 100-concurrency budget, each
given a static limit of 10, needs zero coordination, has no shared failure mode, and
cannot exceed the budget. It wastes capacity when workers idle. I'd ship that and add
a shared limiter only if the waste is real." Jumping straight to a distributed
semaphore skips whether the complexity is earned. Then show you can build it: a token
bucket in Redis, as a Lua script so refill-and-take is atomic. Four traps:

| Trap | Why it bites | What to do |
|---|---|---|
| Clock skew | Workers' clocks differ by seconds; tokens appear and vanish | Use Redis's own `TIME` inside the script |
| Non-atomic read-modify-write | Two workers both read 1 token and both take it | Lua script, or `WATCH`/`MULTI` |
| Every call is a network hop | The limiter becomes the bottleneck | Lease tokens in blocks and spend locally |
| Redis dies | Do you stop, or flood the provider? | Decide deliberately; fail closed to a small static per-worker limit |

Then three sentences worth saying out loud: "a semaphore with a **lease**, not a lock
— a worker that dies holding a lock holds it forever, a lease expires"; "at 40,000
items the work goes in a queue and the checkpoint becomes the queue's bookkeeping, so
what I need is at-least-once delivery plus an idempotent write keyed on document id";
and "is the limit per key or per organisation? If it's per key, the simplest
distributed rate limiter is more keys."

### Follow-up 2 — "Make the limit token-based, not request-based"

This separates people who have integrated with a model provider from people who have
read about it. "Requests per minute is usually the less binding limit — the real
constraint is tokens per minute, input and output. Two requests can differ a
hundredfold in cost, so a request-based limiter is calibrated for the average document
and 429s on the long ones." You cannot know the output length before you call, so two
buckets, take from both, and reserve-then-reconcile:

```js
const requests = new TokenBucket({ ratePerSec: 50, burst: 50 })
const tokens = new TokenBucket({ ratePerSec: 100_000 / 60, burst: 20_000 })
await Promise.all([requests.take(1), tokens.take(est)])
const res = await call(doc)
tokens.refund(est - (res.usage.input + res.usage.output))   // give back the slack
```

The `refund` in `processCorpus` is load-bearing: the 200-document run above takes 6.8s
with it, 15.4s without. Over-reserving without refunding throttles your paid throughput.

| Estimate | Effect |
|---|---|
| Mean of recent outputs | Under-reserves half the time, so you 429 |
| `max_tokens` | Never 429s, wastes most of your quota |
| p90 of recent outputs, refunded | The practical answer |

"Reserve at the p90 of a rolling distribution of actual output lengths, refund the
difference, and alarm on the ratio of estimated to actual — if it drifts my throughput
is quietly falling and nothing else will tell me. But the provider knows the truth:
remaining-quota headers and `Retry-After`. My bucket only avoids the round trip."

**Say what you would ask:** "per key or per org, sliding window or fixed, one token
budget or two, and does a rejected request still count. Those four change the design."

---

# What the research did not find

Three topics appear frequently in AI-interview prep content but did **not** appear in
sourced candidate reports of actual interviews in the window swept: implementing
speculative decoding, on-device quantisation exercises, and writing CUDA or Triton
kernels. **Absence of evidence is not evidence of absence** — those reports come from
people who chose to write up their interviews, and they skew toward what surprised or
annoyed the candidate. For a role explicitly about inference optimisation or GPU
work, assume kernels are in scope regardless.

So do not spend a week implementing speculative decoding, but carry one paragraph on
each as a *discussion* topic. **Speculative decoding**: a small draft model proposes
`k` tokens, the large model verifies all `k` in one forward pass, you keep the
longest accepted prefix; output is distributionally identical to the large model
alone, and because verification is parallel while generation is sequential it attacks
exactly the bandwidth-bound decode phase from drill 1.3 — the win depends entirely on
acceptance rate. **Quantisation**: fewer bits per weight, mostly a memory and
bandwidth win rather than an arithmetic one, which is why it helps decode most; int8
is usually near-free, 4-bit needs per-task evaluation, and weights and the KV cache
quantise independently. **Kernels**: FlashAttention matters not for a better
algorithm but for better memory movement — tile the computation so the `L × L` score
matrix is never written to HBM.

**And ask the recruiter** what the coding round looks like and in which language.
That changes what you practise far more than any list.

---

## The one-page version

| | |
|---|---|
| **Attention** | Mask the scores, not the probabilities. Reshape then transpose. `1/√d_k` because score variance grows with `d_k`. O(L²) time *and* memory; the memory bites first. |
| **KV cache** | Prefill is compute-bound and parallel; decode is bandwidth-bound and sequential. That one sentence answers five follow-ups. Test it by diffing incremental against full. |
| **GQA** | Shrinks the cache, not the FLOPs. Decode is bandwidth-bound, so that is the axis that matters. `repeat`, not `tile`. |
| **Debugging** | Shapes, then one token by hand, then properties, then a reference. State the method before you touch the code. |
| **Concurrency** | Concurrency and rate are two different limits needing two different mechanisms. Jitter is a 2.3× cost difference. A timeout that does not abort leaks past your pool. Checkpoint failures, not just successes. |
| **Everything** | Narrate. Say the complexity unprompted. Name the trap you are avoiding. End on the control, not the patch. |
