# The AI-assisted coding round

Reported as the biggest change to the coding interview format recently: a round
where you are given a model, or an AI-enabled editor, and expected to use it.

Everything in this file about company-specific formats comes from
candidate-reported experiences gathered from public write-ups. Treat it as *as
of recently, reportedly* — not as a permanent description of anyone's process.
Interview formats change quietly and often. A candidate who repeats a stale
claim about a company's process sounds worse than one who says "this is what I
understood as of a few months ago; has it changed?"

---

## What the round is

You get a problem and a tool. You are allowed — sometimes required — to prompt a
model for code. The interviewer watches the whole session, including your
prompts.

**The shift in what is being graded.** The old round tested whether you could
produce correct code from memory under time pressure. That signal is now cheap
to fake and cheap to buy. So the question moved one level up: given a tool that
produces plausible code in seconds, can you *direct* it at the right problem, and
can you *tell whether what came back is right*?

Those two verbs — direct and verify — are the entire round. Code production is
assumed. Judgement about produced code is the thing under test.

**Why companies added it.** The stated reasoning in most reports is simple: it
is now closer to the actual job. If an engineer will spend their working day
reviewing model output, an interview that forbids model output is measuring
something the company no longer buys. There is a second, less-stated reason —
an interview where AI is banned is an interview that is hard to invigilate,
especially remotely. Permitting the tool and grading the usage sidesteps the
policing problem entirely.

**What you say out loud if asked why they do this:**

> "Producing a first draft of code is not the scarce skill any more. Knowing
> which draft to keep is. I'd expect this round to grade my review instincts more
> than my recall."

---

## The reported Meta format: three phases

Reported as a roughly hour-long session in three parts, escalating. Each phase
grades a different thing, which is why the phases are in this order.

| Phase | The task | What it actually grades |
|---|---|---|
| 1 | Fix a bug in code you did not write | Can you read unfamiliar code and localise a fault? |
| 2 | Implement a feature, roughly a hundred-odd lines — AI use expected | Can you direct the tool, and do you verify what it returns? |
| 3 | Optimise it against larger tests | Do you understand the complexity of code you did not author? |

**Phase 1 — the bug fix.** Comprehension, not generation. You are being watched
for whether you form a hypothesis before editing. The AI can read the file as
fast as you can; what it cannot do is tell you which of three plausible causes
matches the failing case in front of you. Reproduce, narrow, then fix.

**Phase 2 — the implementation.** This is the phase the round exists for. A
hundred-odd lines is deliberately chosen: big enough that typing it by hand
wastes the clock, small enough that you have no excuse for not reading every
line that comes back. Generating it is not the achievement. Catching the off-by-
one in the middle of it is.

**Phase 3 — the optimisation.** Larger tests mean the naive version times out.
This phase is hard to fake with prompting because you must first know *why* it is
slow — which requires having understood the code from phase 2. Candidates who
prompted their way through phase 2 without reading the output tend to fall over
here, because they are now asked to optimise something they never read.

**Read the three phases as one trap.** Phase 2 rewards speed. Phase 3 punishes
the shortcut that speed tempted you into. If you skim the generated code in
phase 2, phase 3 is where it costs you.

---

## What the graders reportedly look for

This is the useful part of the whole file. Four behaviours come up repeatedly in
candidate reports.

| Behaviour | What it looks like when you have it | What it looks like when you don't |
|---|---|---|
| **Verification** | You run it, you read it, you test the edge case before saying it works | "That looks right" and you move on |
| **Ownership of unfamiliar code** | You can explain any line the model wrote, on request | You scroll back and go quiet |
| **Noticing subtle wrongness** | You stop on the one branch that is plausible but incorrect | You accept it because it compiles and the sample passes |
| **Driving through failure** | It breaks, you diagnose, you fix it yourself or steer precisely | You re-prompt the same request with different wording |

**The named failure mode: prompting your way out of a problem you do not
understand.** The interviewer sees it as a loop — the code fails, you paste the
error back into the model, you get slightly different code, it fails differently,
you paste again. Each iteration looks like progress and none of it is. It is the
most legible negative signal in the round because the transcript shows it
plainly.

The escape is to stop and say what you actually know:

> "Third attempt, and the failure moved rather than went away. Let me stop
> prompting and read this. I'll add a print at the boundary condition and find
> out what the state actually is before I ask for anything else."

That sentence, said once, converts the worst signal in the round into a good one.

**On explaining code you did not write.** Assume you will be asked "why is this
line here?" about a line the model produced. There is only one safe habit: read
the output as it arrives, and if a line is doing something you cannot justify,
ask about it *before* the interviewer does.

> "It's reached for a set here to dedupe. I don't think we need it — the input is
> already unique by construction, so that's a pass and an allocation we're paying
> for nothing. I'll take it out."

That single observation demonstrates comprehension, verification and judgement
at once, in about ten seconds.

**On subtle wrongness.** The failure case models are good at producing is code
that is right in shape and wrong in detail: the correct algorithm with an
inclusive bound where it should be exclusive, correct logic that mishandles the
empty input, a solution that is right for the example and wrong for the general
case. Your defence is not vigilance in general; it is a fixed checklist you run
on every block that comes back.

| Check | The question |
|---|---|
| Boundaries | What happens at zero, one element, and the last index? |
| Assumptions | What is this code assuming about the input that nobody promised? |
| Error paths | What happens when the thing it calls fails? |
| Complexity | What is this actually, in big-O, and does it match what I asked for? |

Four questions. Say them out loud as you run them. The interviewer cannot grade
a checklist you run silently.

---

## The reported Google code-comprehension pilot

Separately reported: a pilot round focused on code comprehension, graded on
**prompt quality** and **output validation** rather than on whether you produced
a working program unaided.

The framing matters more than the details. If prompt quality is a graded axis,
then a vague prompt is a wrong answer even when the returned code happens to
work. The implied standard is that your prompt carries the constraints — the
input shape, the edge cases, the complexity target, the interface it must fit —
rather than the model guessing them and you accepting the guess.

**Weak prompt:** "write a function to merge these intervals"

**Prompt that reads as senior:**

> "Merge overlapping intervals. Input is an array of `[start, end]` pairs, not
> guaranteed sorted, ends inclusive, may be empty. Touching intervals like
> `[1,2]` and `[2,3]` should merge. Return a new array; don't mutate the input.
> Target O(n log n)."

Same request. The second one states the four things that would otherwise become
bugs, and it gives you something to check the output *against*. That is the real
reason to write it that way: a prompt with explicit constraints is also a test
plan.

Treat this as a pilot as reported, not as Google's standard process. If it
matters to your loop, ask.

---

## The policy split

**As reported, and clearly subject to change.** This is the area where stale
information does the most damage, because the penalty for getting it wrong is not
a weak signal — it is disqualification.

| Policy | What it means in the room | How to handle it |
|---|---|---|
| **AI permitted and graded** | Tool use is part of the rubric; not using it may read as avoidance | Narrate your prompts and your checks; make the usage visible |
| **AI permitted in one round only** | Typically the AI-assisted round; the other rounds stay traditional | Confirm exactly which round, and do not carry the habit into the others |
| **AI prohibited, disqualifying** | Using it is treated as cheating, not as a style choice | Close the tools. Assume screen share and clipboard are observed |

One research lens reported a survey figure that **a majority of organisations
still prohibit AI use in interviews** — reported around the 60% mark. Carry that
number carefully: it is a single reported survey, the sampling and the definition
of "prohibit" are not something you can inspect from the outside, and adoption in
this area is moving fast enough that any such figure ages in months. The useful
takeaway from it is directional, not numeric — *the permissive format is the
newsworthy exception, not yet the default*. Do not walk into a loop assuming the
tool is allowed.

### The takeaway: ask the recruiter

Before the loop, send one message. This is the single most valuable thing in
this file.

> "Quick logistics question before the loop — for each round, is AI assistance
> allowed, expected, or not permitted? And if it is allowed, which tool should I
> use, and will it be in your environment or mine?"

Four things come back from that one question: the policy, the per-round
variation, the tool, and the environment. All four change how you prepare. None
of them can be safely guessed. And asking costs you nothing — it reads as
preparation, not as anxiety.

If the answer is ambiguous, resolve it in the room before you type:

> "Before I start — am I allowed to use the assistant for this one? Happy either
> way, I just want to be on the right side of the rule."

---

## How to narrate this round well

The round is graded on a process that is invisible unless you speak it. Three
things need to be audible: **what you asked for, why you rejected what came back,
and what you checked.**

**Before prompting — say the constraints you are about to encode.**

> "Before I ask for anything, let me pin down the shape. Unsorted input, empty is
> legal, ends are inclusive so touching intervals merge, and I want n log n. I'm
> putting all four of those in the prompt so I have something to check the answer
> against."

**On reading the output — react to it, specifically.**

> "Right — the sort and the sweep are what I wanted. Two things I'm not happy
> with. It returns early on empty input, which is fine but untested. And this
> comparison is `<` where I think it needs `<=`, otherwise `[1,2]` and `[2,3]`
> come back as two intervals when we said they should merge. Let me check that
> one first."

**On rejecting something — give the reason, not a vibe.**

> "I'm going to throw this version away. It's building a hash map keyed on the
> start value, which breaks the moment two intervals share a start — and nothing
> in the problem says they can't. Simpler to sort and sweep."

**On verifying — state what you ran and what it proved.**

> "Passing on the sample. That doesn't tell me much, so I've added three: empty
> input, a single interval, and the touching case. Touching was the one I was
> worried about and it's green now. I'd also want a case where one interval fully
> contains another before I'd call this done."

**When it goes wrong — switch from prompting to diagnosing, audibly.**

> "That's the second failure and the error moved rather than cleared, which
> usually means my mental model is wrong, not the code. I'm going to stop
> prompting and trace it. Printing the accumulator at each step."

**What the interviewer is listening for underneath all of it:** that you treat
model output the way you would treat a pull request from a competent stranger —
useful, probably mostly right, and not merged until you have read it. Say that
out loud once, in your own words, and much of the rubric is satisfied:

> "I use these the same way I review a PR from someone good. I assume it's a
> reasonable first draft, and I don't ship it until I've read every line and
> checked the edges."

---

## The traps, in one place

| Trap | Why it costs you |
|---|---|
| Re-prompting a failure you have not diagnosed | The named failure mode; visible in the transcript |
| Accepting code that compiles and passes the sample | The sample is the one case the model optimised for |
| Going quiet while reading generated code | Comprehension you don't voice is comprehension they can't grade |
| Refusing to use the tool in a round that grades tool use | Reads as avoidance, not as rigour |
| Using the tool in a round that prohibits it | Not a weak signal — a disqualification |
| Optimising in phase 3 without having read phase 2's output | You cannot speed up code you never understood |
| Asserting a company's current policy from something you read | Ask the recruiter instead; processes change |
