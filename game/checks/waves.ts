import {Battle} from "../src/battle.js";
function check(ok: boolean, message: string) {
    if (!ok) throw new Error(message);
}
const b = new Battle();
b.Tick();
check(b.Spawned === 0 && b.Wave === 0, "Preparation does not spawn");
check(b.StartWave() && !b.StartWave(), "Start exactly once");
check(b.Limit === 240, "First wave budget");
for (let wave = 1; wave <= 8; wave++) {
    b.Spawned = b.Limit;
    b.Enemies = [];
    const stars = b.Stars;
    b.Tick();
    check(b.Cleared === wave && b.Stars === stars + 40 + wave * 10, "Wave reward once");
    b.Tick();
    check(b.Stars === stars + 40 + wave * 10, "No duplicate reward");
    if (wave < 8) check(b.StartWave(), "Next wave starts");
}
check(b.Won && !b.StartWave() && !b.Build(0) && !b.Explode(10, 10), "Win blocks gameplay actions");
const lost = new Battle();
lost.Integrity = 0;
lost.Tick();
check(!lost.StartWave() && lost.Spawned === 0, "Loss stops director");
console.log("Wave preparation, budgets, rewards, win and loss checks passed.");
