# Unicorn Flood

A single-stage tower defense game with one million GPU-rendered unicorns and an exact integer fluid simulation.

## Play locally

Run these commands from `game/`:

```sh
npm ci
npm --prefix play ci
npm start
```

Open `http://localhost:1234/src/`.

## Check and build

```sh
npm run ts:check
for check in million maps navigation progress; do
  npx esbuild checks/$check.ts --bundle --platform=node --outfile=/tmp/$check.cjs
  node /tmp/$check.cjs
done
make -C play
wc -c play/index.html
```

`play/index.html` is the complete texture-free release. Keep it below 13,312 bytes.
