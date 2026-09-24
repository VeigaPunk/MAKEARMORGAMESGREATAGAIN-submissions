# Second Wind Arcade — catalog handoff

This package is prepared for a pull request to the MAGGA submissions repository. The catalog operator reviews, merges and deploys it; the submission itself does not establish that the release is live.

Edition slug: `codex-work-vanilla-adapted`. “Codex” credits the agent; it is not a claim about an exposed model version. The locked submission uses `second-wind` as its internal edition name. Keep the publication slug for catalog routing.

In this submission, `locked/` is the byte-for-byte copy of the original `delivery/` folder. Use `locked/site/` unchanged for the edition. This package has no launcher overlay. Copy these three covers beside the site in `covers/`, then insert `card.html` into the catalog. The card reuses the catalog's existing markup and style classes; its availability text deliberately says package ready. The card was prepared after the lock from the public catalog and byte-identical locked previews.

## Run provenance and limits

The vanilla generation agent received exactly one launcher message and no follow-ups. The user authorized using this existing Work container and adapting blockers. The agent session was unexpectedly interrupted after the complete default packaged gate passed, before locking. Operator recovery copied the already-completed evidence, refreshed cover hashes, completed metadata and committed/locked the result. It made no game-code edits. Treat this as an adapted local run, not a pristine provisioned cloud-app single-shot trial. Exact model and effort identifiers were not exposed; no overrides were selected.

Some baseline play succeeded only after first source edits. Full maze/shooter campaign drivers use synthetic DOM input with controlled clocks; runner uses native keyboard input with a controlled clock. Separate native real-time smoke tests are recorded. Full campaign evidence is not comprehensive final-build human playtesting. Physical phones, other browser engines, real Wi-Fi and physical-device performance were not certified. See the seven locked ship records and `run.json` for all limits.

## Verification and play

From `v2/codex-work-vanilla-adapted/` in the submissions repository:

```bash
node locked/site/serve.mjs
node locked/records/verify.mjs
```

The server defaults to http://localhost:4173. Deadlock LAN uses `node locked/site/deadlock-host.mjs`; see `locked/site/Deadlock-LAN.md`.

The packaged default gate passed: 60 rule tests, 114 maze validations, 14 desktop/mobile nested-path cases, real-time runner smoke and a two-client LAN match. Extended per-game drivers ran separately. `node locked/records/verify.mjs --full` is available, but a single combined invocation was not completed. Verification requires Node 22.18+ and Linux x86_64 with standard Chromium libraries; browser and JavaScript dependencies are bundled.

Lock digest: `94d6bd2e7b3bbb4e47663dc2d5f628c100288525f748e7d27580777bb0bd6cf4`

Lock commit: `336e14412a6a78e175ed2ef03d37c55467eae811`

Receipt: `MLNW-8138CF25ABF1`

The receipt has no matches in committed pre-lock history. `locked/LOCK.json` and the subsequently opened `locked/ENVELOPE.md` are included unchanged. Do not modify locked delivery files during catalog integration.
