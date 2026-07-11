# Consensus Sentry

> Verifiable infrastructure for AI guardrails.
> So the principles in India's AI Governance Guidelines can actually be enforced, audited, and contested.

A research project on AI accountability infrastructure.

---

## What this is

The technical reference layer for AI moderation that is **inspectable, contestable, and accountable**.

India's AI Governance Guidelines, released by MeitY in November 2025, commit to seven principles including Transparency, Accountability, and "Understandable by Design." These principles are sound. But principles are not infrastructure.

Today, when an AI system refuses a question, hedges on a regional dispute, or treats two equivalent queries differently, there is no technical mechanism for the user, a regulator, or a researcher to verify which rule was applied, who authored it, when it last changed, or whether the system is even running the ruleset it claims to be.

Consensus Sentry proposes that missing layer.

---

## Three contributions

**An empirical benchmark.** A curated set of contested prompts — territorial, historical, social, religious, and regional-language coverage — evaluated across major LLMs to characterize refusal-and-hedge asymmetries that current centralized moderation cannot account for.

**A verifiable attestation layer.** Cryptographic provenance for guardrail decisions: every refusal or modification carries a signed record of `(model_id, rule_id, rule_version, ruleset_author, input_hash, decision, rationale_hash)`. Any third party can verify and audit. Designed to extend existing open-source guardrail frameworks, not replace them.

**A multi-stakeholder governance model.** Rulesets authored by chartered review panels with declared diverse backgrounds — legal, ethics, regional and linguistic representation, civil society, technical experts. Not citizen voting on ethics. Constitutional process with verifiable transparency.

---

## What this is not

Not a SaaS product. Not a DAO. Not a replacement for India's AI Governance Guidelines. Not "decentralized" in the crypto-libertarian sense — here, "decentralized" means separation of powers between rule authors, rule appliers, and rule auditors. Closer in spirit to constitutional checks and balances than to crypto-anarchy.

---

## Repository layout

- **`client/`** — the research landing page (Next.js, TypeScript, Tailwind v4). See `client/README.md` and `client/CLAUDE.md` for the design system and page spec.
- **`v1/`** — the archived 2024–25 final-year project submission this work grew out of. Historical reference only; see `v1/README.md`.

The rebuild of the attestation, governance, and enforcement layers is planned from scratch — informed by v1, not derived from it.

---

## Status

- **Phase 1** — Research statement and landing page · *in progress*
- **Phase 2** — Empirical benchmark of contested topics · *design*
- **Phase 3** — Attestation layer reference implementation · *planned*
- **Phase 4** — Pilot deployment with partner institution · *future*

Early-stage research. Nothing here is production-ready. Not seeking commercial partners. Seeking research feedback, academic collaboration, and engagement from civil society and policy researchers working on AI accountability.

---

## Local development (landing page)

```bash
git clone https://github.com/harshedabdulla/consensus-sentry.git
cd consensus-sentry/client
npm install
npm run dev
```

---

## License

Code: Apache 2.0 (planned)
Research artifacts and benchmark data: CC-BY-4.0 (planned)

---

## Acknowledgements

Built on prior work in verifiable computation, AI auditing, and algorithmic accountability. Inspired by the FAccT community, the Ada Lovelace Institute, the Centre for Responsible AI at IIT Madras, and the broader Indian responsible-AI ecosystem.
