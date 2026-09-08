import {Battle} from "../src/battle.js";
function damage(interval: number) {
    const b = new Battle();
    b.Campaign = false;
    b.Rate = 0;
    b.FireInterval = interval;
    b.Build(0);
    const e = {x: 39, y: 23, vx: 0, vy: 0, hp: 100000, id: 0, frozen: 10};
    b.Enemies.push(e);
    for (let i = 0; i < 60; i++) b.Tick();
    return 100000 - e.hp;
}
const normal = damage(0.06),
    fast = damage(0.006);
if (fast < normal * 9 || fast > normal * 11)
    throw new Error(`Fire rate failed: ${normal}, ${fast}`);
console.log(JSON.stringify({normal, fast}));
