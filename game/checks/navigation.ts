import {blocked, fixed_steps, flow_field, meadow_field, MAP_WIDTH} from "../src/navigation.js";
function check(ok: boolean, message: string) {
    if (!ok) throw new Error(message);
}
const field = flow_field(3, 3, new Uint8Array(9), 8);
check(field[0] === 4 && field[8] === 0, "Equal-cost shortest route");
const split = flow_field(3, 3, Uint8Array.from([0, 1, 0, 0, 1, 0, 0, 1, 0]), 8);
check(split[0] === -1 && split[1] === -1, "Unreachable cells and walls");
const corner = flow_field(2, 2, Uint8Array.from([0, 1, 1, 0]), 3);
check(corner[0] === -1, "No diagonal corner cutting");
const meadow = meadow_field();
check(meadow[18 * MAP_WIDTH + 4] > 0 && blocked(31, 4) && !blocked(31, 18), "Meadow choke");
function ticks(speed: number, frames: number) {
    let remainder = 0,
        count = 0;
    for (let i = 0; i < frames; i++) {
        const step = fixed_steps(remainder, 1 / 60, speed);
        remainder = step.remainder;
        count += step.count;
    }
    return count;
}
check(ticks(1, 120) === ticks(2, 60), "Equivalent simulation time");
check(ticks(0, 60) === 0, "Pause");
check(fixed_steps(0, 10, 2).count === 12, "Bounded catch-up");
console.log("Navigation and fixed-step checks passed.");
