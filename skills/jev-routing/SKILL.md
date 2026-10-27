---
name: Jev routing
description: Route decisions to TypeSafe Jev/Laya instead of LLM prose. Use for yes-no, choice, score, and browser triage calls.
---

# Jev routing (tokens: ~0 for decisions)

Jev is NOT a chat model. Shape: `state + typed questions -> constrained answers + probabilities -> your code branches`.

## Prefer `laya_ask` (local, offline, ~100ms) when

- yes/no, choice among N, or 0-1 score over text you already have
- triage: which subagent, which file, retry or stop, approve or escalate
- any loop making the same judgment repeatedly

## Prefer `jev_search` (browser MCP) when

- live page read, price/product lookup, form fill, scrape
- Never use LLM prose to guess page content. Fetch via Jev, then decide via `laya_ask`.

## Do NOT use Jev when

- writing code, prose, or summaries (use worker/docs)
- the question needs explanation, not a value (use LLM once, then encode the rule as future Jev questions)

## Calibration

Split compound judgments into atomic questions and combine in code.
Never trust counts/dates/multi-hop inference from one Jev call.
