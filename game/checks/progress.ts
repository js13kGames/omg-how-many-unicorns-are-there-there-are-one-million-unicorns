import {new_progress, parse_progress, purchase, run_reward} from "../src/progress.js";
function check(ok: boolean, message: string) {
    if (!ok) throw new Error(message);
}
const p = new_progress();
check(!purchase(p, "damage"), "No purchase without funds");
p.sparkles = 20;
check(purchase(p, "damage") && p.sparkles === 10 && p.damage === 1, "Purchase applies once");
check(parse_progress(JSON.stringify(p)).damage === 1, "Save round trip");
for (const raw of [
    "{",
    '{"version":2}',
    JSON.stringify({...p, sparkles: -1}),
    JSON.stringify({...p, rate: 51}),
]) {
    let rejected = false;
    try {
        parse_progress(raw);
    } catch {
        rejected = true;
    }
    check(rejected, "Reject unsafe save");
}
check(run_reward(0, 0, false) >= 10, "Short run buys an upgrade");
check(run_reward(200, 2, false) > run_reward(100, 1, false), "Longer progress pays more");
const legacy = parse_progress('{"version":1,"sparkles":20,"damage":0,"rate":0,"runs":0,"best":0}');
check(legacy.range === 0 && legacy.fortress === 0, "Old saves gain default upgrade fields");
check(purchase(legacy, "range") && purchase(legacy, "fortress"), "New upgrade purchases");
console.log("Progress validation, purchases and rewards passed.");
