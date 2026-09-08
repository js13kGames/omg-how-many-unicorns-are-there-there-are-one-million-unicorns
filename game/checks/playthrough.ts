import {Battle} from "../src/battle.js";
const battle = new Battle();
battle.Build(2, 1);
battle.Build(0, 0);
let steps = 0;
while (!battle.Won && battle.Integrity > 0 && steps < 60000) {
    for (let pad = 0; pad < 6; pad++) battle.Build(pad, pad % 3);
    if (battle.Preparing > 0) battle.StartWave();
    if (battle.MissileCooldown === 0 && battle.Enemies.length) {
        const e = battle.Enemies.reduce((a, b) => (a.x > b.x ? a : b));
        battle.Explode(e.x, e.y);
    }
    battle.Tick();
    steps++;
}
if (!battle.Won && battle.Integrity > 0) throw new Error("Run did not reach a terminal state");
console.log(
    JSON.stringify({
        won: battle.Won,
        wave: battle.Wave,
        cleared: battle.Cleared,
        kills: battle.Kills,
        seconds: steps / 60,
        integrity: battle.Integrity,
    }),
);
