---
layout: distill
title: Using GPT 5.6 Sol to formalize Caratheodory's existence theorem in Lean4
description: a (personal) first try in using an LLM to formalize a result
tags: GPT, lean
date: 2026-07-21

---

For a while I've been flirting with the idea to take a shot at Lean 4 and with the most recent [machine victory](https://x.com/__alpoge__/status/2079028340955197566) I went on searching for the open tab containing [Alex Kontorovich's very nice and brief introduction](https://www.youtube.com/watch?v=I2zaPoj3G50). After reading through Lean's and Mathlib's documentation the decision to be made was to choose some result that wasn't in Mathlib code to see how well GPT could do it.

Considering that Picard–Lindelöf was already formalized, I decided to try Caratheodory's theorem which, in short, guarantees the existence of a solution for the ODE $\dot x(t) = f(t,x)$, when $f$ is measurable in $t$, for fixed $x$, and continuous in $x$. After setting up the [project](https://github.com/gabrieldlm/caratheodory-ode-lean) the problem was described in the `program.md` file, which contained the overall description of what was needed from the agent (explicitly stating that the code should compile and without any sorrys). 

To test the model's Lean proficiency I took a screenshot of the theorem and proof from Hale's Ordinary Differential Equation book, asked Gemini to produce a markdown/LaTeX version and saved as `caratheodory.md`. After firing up, Codex was instructed to solve the problem described in `program.md` which he eventually did in 14 minutes and 10 seconds (GPT 5.6 Sol on High). The lake build command ran without errors, although with a plethora of warnings about deprecated functions and unused variables. Those warnings were resolved with two more prompts, one per warning type, resulting in a clean build:

```
$ lake build
Build completed successfully (8668 jobs)
```

Some point that I'll just leave here:
1. The proof relies on Schauder's fixed point theorem, which isn't in Mathlib core so I pointed to [this lean eval submission](https://github.com/leanprover/lean-eval-submissions/issues/752) and hoped for the best.
2. Claude Opus 4.8 was used to validate the results and stated that the proof is sound, only complaining about "cosmetic linter/deprecation warnings" even after Codex solved it. 
3. The main theorem is [__caratheodory_exists__](https://github.com/gabrieldlm/caratheodory-ode-lean/blob/main/CaratheodoryODE.lean#L1367)