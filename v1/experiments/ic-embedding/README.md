# IC-Model-Deployment

This folder implements distilbert model classification  using **DFX**  in ICP chain.

---

## **Setup Instructions**


Follow the official [DFX installation guide](https://internetcomputer.org/docs/current/developer-docs/quickstart/local-quickstart#step-1-install-dfx).

Verify installation:
```bash
dfx --version
```

Start the DFX local environment with a clean state:

```bash
dfx start --clean --background
dfx build
dfx deploy
./scripts/upload_model.sh
dfx deploy
```

