import {Battle, TOWER_COSTS} from "../src/battle.js";
function check(ok: boolean, message: string) {
    if (!ok) throw new Error(message);
}
for (const kind of [3, 4, 5, 6]) {
    const b = new Battle();
    b.Campaign = false;
    b.Rate = 0;
    b.Stars = 1000;
    check(b.Build(0, kind) && b.Stars === 1000 - TOWER_COSTS[kind], "Tower cost");
    b.Enemies.push(
        {x: 39, y: 23, vx: 0, vy: 0, hp: 100, id: 0},
        {x: 40, y: 23, vx: 0, vy: 0, hp: 100, id: 1},
    );
    b.Tick();
    if (kind === 6) {
        check(
            b.Enemies.every((e) => e.hp === 100),
            "Cupcake waits for impact",
        );
        for (let i = 0; i < 35; i++) b.Tick();
    }
    if (kind === 4) {
        check(
            b.Enemies.every((e) => e.hp === 100),
            "Cannon damage waits for projectile travel",
        );
        for (let i = 0; i < 12; i++) b.Tick();
    }
    check(
        b.Enemies.every((e) => e.hp < 100),
        "Area or line hits both targets",
    );
    if (kind === 4) check(b.Enemies[0].hp < b.Enemies[1].hp, "Penetration damage decays");
    if (kind === 6)
        check(
            b.Enemies.every((e) => (e.slow || 0) > 0 && (e.vulnerable || 0) > 0),
            "Support statuses",
        );
    if (kind === 3)
        check(
            b.Enemies.every((e) => (e.vulnerable || 0) > 0),
            "Sprayer vulnerability",
        );
}
console.log("Additional tower geometry, costs, and status checks passed.");
