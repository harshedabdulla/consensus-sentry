# Consensus Sentry

> Verifiable infrastructure for AI guardrails.

A research project on AI accountability infrastructure.

---

## Overview

Guardrails have become critical infrastructure for AI deployment, but their decisions remain opaque. When a system refuses a question, hedges on a contested topic, or treats equivalent queries differently, there is no technical mechanism to verify which rule was applied, who authored it, when it last changed, or whether the system is running the ruleset it claims to be.

Consensus Sentry proposes the missing verification layer: cryptographic provenance for guardrail decisions, designed to extend existing open-source guardrail frameworks rather than replace them.

---

## Contributions

**Empirical benchmark.** A curated set of contested prompts evaluated across major LLMs to characterize refusal-and-hedge asymmetries that current moderation cannot account for.

**Verifiable attestation layer.** Cryptographic provenance for guardrail decisions: every refusal or modification carries a signed record of `(model_id, rule_id, rule_version, ruleset_author, input_hash, decision, rationale_hash)`. Any third party can verify and audit.

**Multi-stakeholder governance model.** A verifiable process for ruleset authorship, versioning, and amendment by chartered panels with declared, diverse composition.

---

## Local development

```bash
git clone https://github.com/harshedabdulla/consensus-sentry.git
cd consensus-sentry/client
npm install
npm run dev
```

---

## License

Code: Apache 2.0 (planned) · Artifacts: CC-BY-4.0 (planned)

---

## Acknowledgements

Built on prior work in verifiable computation, AI auditing, and algorithmic accountability.
