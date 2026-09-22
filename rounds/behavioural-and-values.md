# The behavioural and values round

The round strong engineers lose. Reportedly, at the frontier AI labs, this is
where people with clean technical loops get rejected. It catches them because
they prepare it last and prepare it wrong: five memorised STAR stories,
delivered fluently, downgraded for being unreadable. The interviewer is not
checking whether you have a story. They are checking whether you can be argued
with.

Three things are actually being graded:

| What they write down | What produces it |
|---|---|
| Can I put this person in a room with a stakeholder? | You describing a disagreement without making the other person stupid |
| Will this person tell me bad news early? | A failure story you volunteer, with the cost attached |
| Does this person have judgement, or just opinions? | A decision where you say what you traded away |

If an answer of yours does not move one of those, it is filler.

---

## The two failure modes

**1. The scripted STAR answer.** Sentences too clean, timeline too tidy, ending
too happy. Ask it something the script did not anticipate — "what did the other
person say when you told them?" — and it collapses into vagueness. A rehearsed
answer fails on the *second* question, not the first. That is the whole tell.

**2. Mission flattery.** "I'm so aligned with your mission." At a lab whose
staff argues about the mission internally, a candidate who only agrees with it
is not useful. Values questions there reportedly probe whether you have thought
about the tradeoffs, not whether you endorse them.

### What to do instead

| Instead of | Do this |
|---|---|
| A polished narrative arc | Facts in order, including the boring ones, with dates and numbers |
| "We improved performance significantly" | "p99 went from 4.2s to 1.1s; it took three weeks; the first fix did nothing" |
| A story where you were right | A story where you were right *late*, or right about the wrong thing |
| "I'd do the same again" | One thing you would do differently, and why you did not see it then |
| "I love the mission" | One thing the company does that you think is genuinely hard or unresolved |

**The number is the credibility.** People who did the work remember numbers;
people reconstructing a story do not. "Roughly 8% of sessions" beats "a lot of
users", and "I don't remember exactly, single-digit percent" beats an invented
one. And say the "differently" part unprompted — cheapest seniority signal in
the round, and most candidates wait to be asked.

---

## The questions

What is tested, the shape of a real answer, and the follow-up that breaks a
weak one. Shapes only — fill them with things that happened to you.

### 1. An ethical or policy concern raised under pressure

**Tested:** whether you escalate, or go quiet and tell yourself it was not your
call.

**Shape:**

1. The concern in one sentence, as you stated it then — not as you understand it now.
2. Who had power in the room, and what the pressure actually was.
3. What you did *first*, and it should be small. Senior people ask a question
   that makes the risk visible rather than opening with a moral stand — a values
   argument turned into a compliance question is harder to wave through.
4. What happened when you raised it, including if the answer was no.
5. What you did after the answer was no.

**Follow-up that breaks people:** *"What if they had overruled you?"* Strong
answer: document it in writing, name the specific risk, escalate one level, then
comply unless it crosses a line you can name. Say where your line is. "I would
have quit" is only believable if you have.

**Trap:** being the only ethical person in the story. If everyone else was
reckless and you alone were principled, you cannot read a room.

### 2. Executive pressure on a timeline

**Tested:** whether you negotiate scope or negotiate reality. Good engineers
push back on *what*, not on *when*.

**Shape:** the commitment, what it actually required, the gap in units the
executive cares about, a menu of two or three options with a recommendation, and
who decided. Bringing it early is what makes it work.

**Listening for:** you gave the decision to the person who owns it, with enough
information to decide well. That is escalation. Working weekends silently is
not, and neither is refusing.

**Follow-up:** *"What did you cut?"* If you cannot name the cut item and who was
unhappy about it, you did not do this.

### 3. A belief you changed your mind about

**Tested:** whether new information can move you. At an AI lab this is close to
a core competence, because the ground moves quarterly.

**Shape:** the old belief, why it was reasonable then, the specific evidence
that broke it, what you do differently now. The last two are where answers fail.
"I used to think X and now I think Y" with no mechanism is a fashion change.
Strongest version: something you argued for publicly — it costs something to
say, which is why it lands.

**Trap:** the fake mind change. "I used to think I could do everything myself
and now I value teamwork" is a humblebrag in a costume.

### 4. A genuine critique of the company

**Tested:** whether you can say a hard thing to someone who works there without
being rude or performatively contrarian. Most candidates either refuse ("I can't
think of anything") or overreach into something unearned.

**Shape:**

1. A real, specific tension, preferably one the company acknowledged publicly.
2. Why it is genuinely hard, not just bad. Show you understand the constraint.
3. What you'd want to understand from inside before having a real opinion.

Safer and equally legitimate: critique the product you have used. "The docs make
it hard to find X." "The failure mode when Y happens is silent and cost me an
afternoon." That proves you used the thing, worth more than a strategic take.

**Trap:** an insult dressed as feedback, and its opposite — a "critique" that is
secretly a compliment ("you move so fast it must be hard to keep up").

### 5. Why this company specifically

**Tested:** whether you are choosing them or are simply available.

**Rule: your answer must be false for at least two other companies you could
plausibly be interviewing at.** Three things make it specific:

- **A decision they made that you disagree with less than the alternatives.**
  Named, with your reasoning about why it was the right call.
- **The work, not the brand.** The concrete problem you want to be in the room
  for, in enough detail that it maps onto a real team.
- **What you want out of it.** Honest self-interest is credible. "I've built on
  these models for three years and guessed at half the internals; I'd like to
  stop guessing" beats anything about impact.

**Trap:** mission flattery. The mission is why the company exists, not why *you*
should be hired, and it does not distinguish you from everyone else who read the
website.

### 6. When did you override a model's output, and why

The AI-fluency question, reportedly now appearing even for non-AI roles. The
real read is not "do you use AI tools" but whether you have a *calibrated*
relationship with model output: where it is reliable, where it is not, and how
you check.

**Shape:** the task, what the model produced, the signal that made you distrust
it, how you verified, what you changed about your process after. The strongest
versions turn on context the model was never given.

**Three override categories worth one story each:**

| Category | What you demonstrate |
|---|---|
| Confidently wrong on a fact | You verify rather than trust fluency |
| Correct but wrong for the context | You hold context the model does not have |
| Correct and I still didn't ship it | Taste and accountability |

**Trap in both directions.** "I don't really use AI tools" reads as incurious.
"The model does most of my work now" reads as someone who will merge what they
do not understand. You are accountable for everything you ship.

### 7. The offline metric improved and the business metric fell

The technical answer is well known; the behavioural one is not. What did you do
when your own win turned out not to be one?

**Technical content is separate:** proxy-metric mismatch, stale evals, lenient
judges, segment effects hidden by an aggregate, novelty effects, measurement
bugs — see [../ai/09-scenarios.md](../ai/09-scenarios.md), scenarios 3 and 6.

**Five beats:**

1. **The claim.** What you told people it would do, and the offline number.
2. **The surprise.** Which business metric moved the wrong way, by how much, and
   how long it took anyone to notice. The "how long" is the part people skip.
3. **What you did first.** Not the fix — the first check. "I assumed the
   measurement was broken, because it usually is," then how you ruled that out.
4. **The real cause**, and whether you had reason to anticipate it. Usually you
   did, faintly, and ignored it.
5. **What you changed structurally.** A control, not "we were more careful": a
   guardrail metric on every A/B, a segment breakdown replacing the aggregate.

**Listening for:** whether you told people the win was not a win, and how fast.
Volunteering "I had already presented this as a win, so I had to go back and
correct it" is the part that scores.

---

## Building a story bank

Do not write scripts. Write **fact sheets** and talk from them — facts survive
being asked from any angle, because you are recalling rather than reciting.
One page per situation, seven fields:

| Field | Why it is there |
|---|---|
| The situation in one line | Forces you to know what the story is about |
| Your actual role | Prevents "we" inflation, which interviewers probe hard |
| The constraint | Time, people, missing information, money |
| The decision you made | Singular. No nameable decision, no story |
| Two or three numbers | Size, duration, delta, blast radius. Approximate is fine; say so |
| The outcome, including the bad part | Every real story has one |
| What you would do differently | The seniority signal, offered unprompted |

Under each, add **three details you would only know if you were there**: what
someone said, what the dashboard looked like, what you were wrong about on day
one. That is what you reach for when a follow-up goes off-script.

### The situations to cover

| Situation | What it proves | Follow-up to be ready for |
|---|---|---|
| Conflict with a peer | You disagree without escalating to a manager first | "What was their strongest argument?" |
| A real failure you caused | Accountable without theatre | "What did it cost?" / "who found it, you or a customer?" |
| Influence without authority | You move people who don't report to you | "What did you give up to get their agreement?" |
| A judgement call under uncertainty | You decide on incomplete information | "What would have changed your decision?" |
| Shipping something you weren't sure about | You ship with a safety net | "What was your rollback plan and did you test it?" |
| Ethics or policy concern raised | You escalate rather than comply silently | "What if you'd been overruled?" |
| A mind changed, yours or theirs | You update on evidence | "What convinced you specifically?" |

Six is enough if they are genuinely different; twelve means you are writing
scripts. Reuse is expected — one strong situation answers conflict, influence
and judgement depending on which thread you pull.

### Rehearsing without sounding rehearsed

- Say each out loud once, to a person or a recording. Once, not ten times.
- Two minutes for the core, then stop and let them ask.
- Have someone ask the hostile follow-up: *"That sounds like it worked out —
  what was the part that didn't?"*
- Practise saying "I don't remember the exact number" without apologising.

---

## For a senior AI role specifically

Three recurring themes. Behavioural questions in technical clothes: they want
your judgement, not your architecture.

### Shipping under model uncertainty

You cannot prove a model-backed feature is correct before launch. A strong
answer contains:

- A bounded first population, and you say which bound — internal users, one
  customer, one document type, 1% of traffic.
- What "bad" looked like *before* launch, as a number, with a rollback
  threshold. Pick a trigger measurable live: abstention rate is, accuracy only
  after labelling.
- A fallback that was not the model — a form, a human, a rule, a refusal.
- What you were wrong about, and whether instrumentation caught it. Quiet
  failure modes like over-refusal take longest to notice.

### Pushing back on a cost or a safety concern

**Cost.** Did you make the cost legible before you made it an argument? Weak:
"I told them it was too expensive." Strong: "Nobody had cost per request. I
added it, and the number changed the conversation on its own." Have ready the
cost per unit a business person cares about — per request, per resolved ticket —
and what you proposed instead. Best version: someone else made the call because
you gave them the number.

**Safety.** Same structure, higher stakes. The tell for an unserious answer is a
safety concern with no cost attached; everyone agrees with free safety. A real
story has a tradeoff — the guardrail cost latency, precision, or the launch date
— and you argued for it anyway. The strong move is empirical: count how often
the risk actually occurred in real traffic, then scope the guardrail to that
subset instead of debating it in the abstract.

### Disagreeing about a model choice

A test of whether you convert a preference argument into an empirical one. Ask
what result would change each of your minds, write it down before running
anything, run both on real queries from your own traffic, and report the result
even when it goes against the side you argued for.

| Weak | Strong |
|---|---|
| "I thought the bigger model was better" | "We defined what would settle it before running anything" |
| Benchmark citations | Your own eval set, on your own traffic |
| Won the argument | Proposed the experiment, reported the result against yourself |
| Only quality | Quality, cost per request, latency at p99, and deprecation risk |

**Trap:** treating model choice as taste. It is measurable on four axes —
quality on *your* data, cost, latency, and the risk of depending on a version
you do not control.

Reported experience ages. If a process detail matters — how many behavioural
rounds, whether there is a dedicated values interview — ask the recruiter. And
inside an answer, "I don't know how you do it here, and I'd want to understand
that before having an opinion" is strong, and completely different from having
no opinion.

---

## The short version

1. Facts, not scripts. Scripts break on the second question.
2. Numbers, approximate and honest, beat adjectives.
3. Volunteer what you would do differently, before being asked.
4. Give a real critique. Refusing to critique is itself a failed answer.
5. Never praise the mission as your reason for applying. Name the work.
6. In every disagreement story, state the other person's best argument fairly.
7. Every AI story ends the same way: what control you left behind so the next
   failure is caught by you and not by a customer.
