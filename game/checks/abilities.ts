import {Battle} from "../src/battle.js";
function check(ok: boolean, message: string) {
    if (!ok) throw new Error(message);
}
for (const kind of ["flyby", "divine", "apocalypse"]) {
    const b = new Battle();
    b.Campaign = false;
    b.Rate = 0;
    b.Enemies.push({x: 10, y: 10, vx: 0, vy: 0, hp: 1000, id: 0, frozen: 10});
    check(b.Special(kind, 8, 10, 12, 10), "Ability accepted");
    check(!b.Special(kind, 8, 10, 12, 10), "Cooldown rejects duplicate");
    for (let i = 0; i < 20; i++) b.Tick();
    check(b.Enemies[0].hp === 1000, "Warning before damage");
    for (let i = 0; i < 100; i++) b.Tick();
    check(b.Enemies[0].hp < 1000, "Ability damages target");
}
const invalid = new Battle();
check(
    !invalid.Special("toString", 1, 1) && !invalid.Special("flyby", NaN, 1),
    "Reject invalid ability input",
);
console.log("Special ability delay, damage and cooldown checks passed.");
