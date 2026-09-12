import {Crowd} from "../src/crowd.js";
import {MAP_HEIGHT, MAP_WIDTH, meadow_field, blocked} from "../src/navigation.js";

const field = meadow_field();
for (let y = 2; y < 34; y++)
    if (field[y * MAP_WIDTH + 2] < 0) throw new Error("Maze spawn is unreachable");
if (field[18 * MAP_WIDTH + 57] !== 0) throw new Error("Fortress goal is invalid");
for (let y = 0; y < MAP_HEIGHT; y++)
    for (let x = 0; x < MAP_WIDTH; x++)
        if (blocked(x, y) !== field[y * MAP_WIDTH + x] < 0)
            throw new Error("Maze collision and flow field differ");
const crowd = new Crowd();
if (!crowd.Build(12, 10)) throw new Error("Wall placement rejected");
if (crowd.Build(12, 10)) throw new Error("Duplicate placement accepted");
if (crowd.Build(10, 10)) throw new Error("Path placement accepted");
if (crowd.Build(57, 18)) throw new Error("Fortress placement accepted");
if (crowd.Build(-1, 10) || crowd.Build(12.5, 10)) throw new Error("Invalid placement accepted");
crowd.Start();
for (let i = 0; i < 500; i++) crowd.Tick(0.05);
if (crowd.WallCount()) throw new Error("Fluid entered maze walls");
console.log("Maze route, collision, free wall placement, and fluid exclusion passed.");
