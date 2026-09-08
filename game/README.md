# Unicorn Flood

This game uses the Goodluck `Platformer2D` source template. The source was created with Goodluck's `bootstrap.sh` in a separate copy. The upstream license is in `LICENSE`.

## Local build

Run these commands from `game/`:

```sh
npm ci
npm --prefix play ci
npm start
```

The development page is at `http://localhost:1234/src/`.

## Checks and release

```sh
npm run ts:check
make -C play
wc -c play/index.html
```

The release page is `play/index.html`. It contains the code, styles, and sprite atlas. Use its byte count in each commit message.

See `../BUILD-PLAN.md` for task status and resume steps.
