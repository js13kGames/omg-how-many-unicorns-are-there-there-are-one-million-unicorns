import {new_progress, parse_progress, purchase, run_reward, upgrade_cost} from "../src/progress.js";

function check(ok: boolean, message: string) {
    if (!ok) throw new Error(message);
}

const progress = new_progress();
check(!purchase(progress, "damage"), "No purchase without funds");
progress.stars = 25;
check(purchase(progress, "damage"), "Purchase applies");
check(progress.damage === 1 && progress.stars === 0, "Purchase spends exact cost");
check(upgrade_cost(1) === 50, "Upgrade costs double");
check(parse_progress(JSON.stringify(progress)).damage === 1, "Version 2 round trip");
const legacy = parse_progress(
    '{"version":1,"sparkles":80,"damage":2,"rate":3,"runs":4,"best":8,"range":1,"fortress":0,"chain":0}',
);
check(
    legacy.stars === 80 && legacy.damage === 2 && legacy.rate === 3 && legacy.range === 1,
    "Version 1 save migrates",
);
for (const raw of [
    "{",
    '{"version":3}',
    JSON.stringify({...progress, stars: -1}),
    JSON.stringify({...progress, missile: 21}),
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
check(run_reward(0, false) === 20, "Every run earns upgrade Stars");
check(run_reward(990_000, true) > run_reward(500_000, false), "Kills and victory increase reward");
console.log("Single-stage progress migration, purchases, costs, and rewards passed.");
