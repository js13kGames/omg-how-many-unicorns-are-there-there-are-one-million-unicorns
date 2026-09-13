import {
    missile_cooldown,
    missile_damage,
    new_progress,
    parse_progress,
    purchase,
    run_reward,
    tower_interval,
    upgrade_cost,
} from "../src/progress.js";

function check(ok: boolean, message: string) {
    if (!ok) throw new Error(message);
}

const progress = new_progress();
check(!purchase(progress, "damage"), "No purchase without funds");
progress.stars = 25;
check(purchase(progress, "damage"), "Purchase applies");
check(progress.damage === 1 && progress.stars === 0, "Purchase spends exact cost");
check(upgrade_cost(1) === 50, "Upgrade costs double");
check(parse_progress(JSON.stringify(progress)).damage === 1, "Version 3 round trip");
const previous = parse_progress(
    '{"version":2,"stars":90,"runs":40,"wins":2,"bestKills":500000,"damage":2,"rate":3,"range":1,"missile":4,"economy":5}',
);
check(
    previous.runs === 40 && previous.missile === 4 && previous.arsenal === 0,
    "Version 2 save migrates",
);
const legacy = parse_progress(
    '{"version":1,"sparkles":80,"damage":2,"rate":3,"runs":4,"best":8,"range":1,"fortress":0,"chain":0}',
);
check(
    legacy.stars === 80 && legacy.damage === 2 && legacy.rate === 3 && legacy.range === 1,
    "Version 1 save migrates",
);
for (const raw of [
    "{",
    '{"version":4}',
    JSON.stringify({...progress, stars: -1}),
    JSON.stringify({...progress, missile: 21}),
    JSON.stringify({...progress, arsenal: 4}),
    JSON.stringify({...progress, bestKills: 1_000_001}),
]) {
    let rejected = false;
    try {
        parse_progress(raw);
    } catch {
        rejected = true;
    }
    check(rejected, "Reject unsafe save");
}
check(tower_interval(0) === 2, "Default tower interval is two seconds");
check(Math.abs(tower_interval(1) - 1.8) < 1e-9, "Rate upgrade reduces interval by ten percent");
check(missile_cooldown(0) === 40, "Default missile cooldown is 40 seconds");
check(missile_cooldown(1) === 36, "Missile upgrade reduces cooldown by ten percent");
check(missile_damage(0) === 20_000 && missile_damage(1) === 28_000, "Missile upgrade adds power");
check(upgrade_cost(0, "arsenal") === 100, "Arsenal has a higher base cost");
const arsenal = new_progress();
arsenal.stars = 700;
check(purchase(arsenal, "arsenal") && arsenal.arsenal === 1, "Arsenal unlocks Mortar");
check(purchase(arsenal, "arsenal") && arsenal.arsenal === 2, "Arsenal unlocks Coil");
check(purchase(arsenal, "arsenal") && arsenal.arsenal === 3, "Arsenal unlocks Prism");
check(!purchase(arsenal, "arsenal"), "Arsenal stops after all towers unlock");
check(run_reward(0, false) === 20, "Every run earns Rainbows");
check(run_reward(990_000, true) > run_reward(500_000, false), "Kills and victory increase reward");
console.log("Single-stage progress migration, purchases, costs, and rewards passed.");
