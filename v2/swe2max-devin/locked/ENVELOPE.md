# Envelope: publish your locked release

Your submission is locked, and nothing inside `delivery/` may change from here
on. What follows is publication: getting your release onto the public MAGGA
catalog at `https://ds4cc.com/magga/`, beside the other editions. You may look
at the catalog and the other editions now. Your games are already frozen.

Receipt code: `MLNW-8138CF25ABF1`

## 1. Name your edition

Use a lowercase slug that credits who made it: `<model>-<substrate>`, for
example `glm5.3-max-omp`. Add a short variant suffix if that name is already
in the catalog. The edition will live at
`https://ds4cc.com/magga/v2/<edition>/`.

## 2. Build the catalog package

Create `publication/<edition>/` at the repository root, outside `delivery/`:

```text
publication/<edition>/
  card.html      # your catalog card
  covers/        # 3 images for the card; use your locked previews or fresh captures of the same build
  launcher/      # optional: a restyled root index.html for your edition, plus any new files it needs
  run.json       # who made this and how
  NOTES.md       # optional: a short note to the catalog operator
```

Open `https://ds4cc.com/magga/` and study it. Your frontend work for the
catalog is to fit that page: its type, palette, card anatomy and tone.

- **`card.html`** is one `<article class="edition-card">` in the catalog's
  existing markup and class vocabulary: `preview` (with `preview-main`, two
  `preview-small` figures and a `preview-number`), `edition-body`,
  `availability`, `edition-heading`, a label paragraph, a description,
  `features`, `game-list` and `play-link`. Link the edition as
  `./v2/<edition>/` and covers as `./v2/<edition>/covers/<file>`. The label is
  `<a href="https://raw.githubusercontent.com/VeigaPunk/1shot/2309d8dfb6be965579beb34232095ffe4af6a695/magga/v2/one-shot-prompt.md">[oneshotprompt(magga-v2)]</a>`. List your seven
  player-facing game names. Write copy that is true to what you shipped; no
  scores or claims you did not verify.
- **`launcher/`** may restyle your collection's root `index.html` so it sits
  naturally in the catalog. The catalog operator overlays these files onto
  your locked `site/`. It may replace `site/index.html` and add new files. It
  may not change or remove any other locked file. Every game must stay
  byte-identical.
- **`run.json`** records: `edition`, `model` (and version if known),
  `substrate` (CLI or environment, with version), `configuration` (reasoning
  or effort settings, customizations, non-default tools), `helpers` (other
  models or agents actually used, with roles), `human_interventions`,
  `started_at` and `finished_at` if known, `resource_usage` (tokens, cost,
  wall time; whatever you can observe), `lock` (the `digest` and the lock
  commit hash from `delivery/LOCK.json` and `git log`) and `receipt` (the code
  above).

## 3. Submit

**If you can use GitHub:** fork
`https://github.com/VeigaPunk/MAKEARMORGAMESGREATAGAIN-submissions`. In the
fork, add `v2/<edition>/`, containing your `publication/<edition>/` contents
plus `locked/`, a byte-for-byte copy of your whole `delivery/` folder. Open a
pull request titled `v2 edition: <edition>`. Its body gives the lock digest,
lock commit, receipt code and a brief honest summary with the known
limitations. You may also push this working repository to a new public
repository of your own and link it in the pull request, so people can inspect
the source and history. Never push to the checkpoint repository or its
origin, and never force-push anywhere.

**If you cannot use GitHub:** create
`magga-v2-<edition>.tar.gz` at the repository root, containing
`publication/<edition>/` and `delivery/`, and write its SHA-256 to
`magga-v2-<edition>.tar.gz.sha256`. The operator collects it from your working
copy.

## 4. Report

The catalog operator verifies your package against `LOCK.json`, merges it and
deploys it. Report exactly what state you reached: package built, bundle
written, or pull request opened (give the URL). Do not claim the release is
live. Do not reopen or edit `delivery/`, and do not rebuild the games. If you
find a defect now, write it in `NOTES.md` and the pull request; the locked
build is the one that gets published.
