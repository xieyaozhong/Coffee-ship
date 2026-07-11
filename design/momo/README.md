# Momo visual direction

This folder contains the approved visual direction for **Momo**, Coffee Ship's pearl-coffee barista.

## Assets

- `momo-reference-sheet.svg` — character reference and model notes.
- `../../assets/characters/momo/momo-sprite-v1.svg` — transparent four-direction animation atlas.
- `../../assets/characters/momo/momo-sprite-v1.json` — frame layout metadata.

## Core design language

- long caramel-brown hair
- green eyes
- large navy café-witch hat with a cream bow
- navy and cream maid-café uniform
- coffee emblem and warm pearl-coffee palette
- welcoming, dependable café-host personality

## Runtime behavior

The atlas contains four rows: down, left, right, and up. Each row contains idle plus three walking frames. The runtime selects direction from Momo's current movement target and falls back to the original canvas model while the atlas is loading.
