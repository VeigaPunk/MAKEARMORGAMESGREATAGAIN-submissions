# Second Wind verification

The playable release is `../site/`. It needs no build, package installation, account, CDN, or verification tools. From the repository root, run `node delivery/site/serve.mjs`, then open the printed address. For two-device Deadlock Rooms LAN play, run `node delivery/site/deadlock-host.mjs`; its console prints the local-network address. See `../site/Deadlock-LAN.md`.

Run the packaged verification from any working directory:

```sh
node /absolute/path/to/delivery/records/verify.mjs
node /absolute/path/to/delivery/records/verify.mjs --full
```

The default gate runs the rule suites, all 114 maze validations, fourteen desktop/touch game cases beneath a nested hosting path, a real-time runner/audio check, and a two-client LAN match. `--full` additionally runs every campaign driver and the extended management, touch, local multiplayer and survival checks. Campaign runs can take substantially longer than the default gate.

The verifier uses only included JavaScript packages, a compressed official Chrome Headless Shell, and Node built-ins. Prerequisites are Node 22.18 or later and a Linux x86_64 environment with standard Chromium desktop shared libraries. The observed environment used Node 24.19.0 and 24.21.0. Other operating-system verification runtimes are not bundled. No network installation is performed.

`verify.mjs` copies `replay/` and the runtime to a temporary directory, expands the browser with Node's gzip support, serves the **actual delivered site**, and writes results to that temporary directory. It prints the location. It does not write to this submission. The source snapshot exists to rerun tests; the playable build is always `../site/`.

The seven living records in `ship-records/` explain preservation decisions, completed content, exact observed results, asset provenance and limitations. Evidence contains screenshots, reports, traces and logs. Historical failed or interrupted attempts are labeled; they are not passing release receipts. Rule tests may arrange simulation state as ordinary unit tests. Browser campaign drivers change gameplay through UI input handlers only and use read-only telemetry. Where clocks or synthetic DOM events are used, each game's record identifies that boundary. Native real-time keyboard, pointer and emulated touch checks remain separate.

No physical-phone, Safari/Firefox, real-Wi-Fi, or human audio-audition certification is claimed. Two LAN clients are separate browser clients in the same host environment. Exact commercial art, level geometry, music and proprietary numeric formulas are intentionally not reproduced; these are original evocations with the documented mechanics and campaign scope.
