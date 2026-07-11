# v1 — Archived final-year project submission (2024–25)

This folder is the original Consensus Sentry final-year project, built between
November 2024 and March 2025 as a university submission. It is archived here
**for history and reference, not for active work**. Nothing in this folder is
maintained, and the rebuild (see the repo root) is written from scratch —
informed by this work, but not derived from it.

The original root README is preserved as [`ORIGINAL_README.md`](./ORIGINAL_README.md).

## What each subfolder was

| Folder | What it was |
|---|---|
| `api/` | Two backend microservices: `rule-engine/` (Python rule-matching engine with a Locust load-test file) and `toxic-classifier/` (Dockerized FastAPI service serving the DistilBERT toxicity model, deployed to Google Cloud Run) |
| `data/` | The fine-tuned DistilBERT toxicity model converted to ONNX, its tokenizer assets, inference scripts, and a Hugging Face upload script |
| `docs/` | Submission-era documentation: design docs, setup guides, and the user manual |
| `experiments/` | Exploratory spikes: ICP embeddings (`ic-embedding/`), model testing, rule prototyping, a partial Rust port (`rust_port/`), and spaCy experiments |
| `icp/` | The Internet Computer (ICP) dapp — Rust canisters plus a Vite/React frontend — used for community rule validation and voting. Contains its own `LICENSE` from the ICP project template |
| `ree/` | An earlier standalone Python rule-engine prototype (`gaurd.py`, `rules.json`, Dockerfile) that preceded `api/rule-engine/` |
| `sentry/` | The published npm SDK (TypeScript + Jest) that client applications used to call the moderation pipeline |

Loose files (`dfx.json`, `dump.rdb`, `package.json`, `package-lock.json`,
`pnpm-lock.yaml`) were the old repo-root build/config leftovers that belonged
to this submission.

## Why it is archived

The idea was right; the implementation was rough. It was built under deadline
pressure, before the team had professional blockchain experience. It is kept
because it documents the project's origin and contains ideas worth revisiting
(the rule taxonomy, the ONNX classifier pipeline, the ICP voting experiments),
but it must not clutter or constrain the new engineering work.

## Known issues that motivated the rebuild

*(From the original author's perspective.)* The system was a set of loosely
coupled services — Python rule engine, Cloud Run classifier, npm SDK, ICP
canisters — with no shared schemas or interfaces, so nothing was verifiable
end-to-end: the "blockchain" layer recorded votes but produced no cryptographic
provenance for actual moderation decisions. The ICP app was largely
template-derived and the community-voting governance model was the wrong
framing entirely — the rebuild replaces it with chartered review panels and
signed, auditable rulesets. Test coverage was thin, code quality was uneven
(e.g. `ree/gaurd.py`), and the whole pipeline reimplemented guardrail
mechanics instead of extending existing guardrail frameworks.

## Rules for this folder

- Do not modify files here; it is a historical snapshot.
- Do not port code from here into the rebuild — re-derive from the
  architecture docs instead.
- If something here turns out to be genuinely reusable, discuss it first and
  rewrite it in the new structure rather than copying it.
