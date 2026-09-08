import {beam_segments} from "../src/beam.js";
function check(ok: boolean, message: string) {
    if (!ok) throw new Error(message);
}
const stop = beam_segments(25, 10, 1, 0, 15, 0);
check(stop.length === 1 && stop[0].bx < 30, "Ordinary walls stop the beam");
const bounce = beam_segments(25, 18, -1, 0, 15, 3);
check(
    bounce.length >= 2 && bounce[1].bx > bounce[1].ax && bounce[1].power === 0.8,
    "Canyon wall reflects with damage loss",
);
check(beam_segments(2, 2, 0, 0, 10, 0).length === 0, "Reject zero direction");
const total = bounce.reduce((sum, s) => sum + Math.hypot(s.bx - s.ax, s.by - s.ay), 0);
check(total <= 15.001, "Reflections share the range budget");
console.log("Beam obstruction, reflection and range checks passed.");
