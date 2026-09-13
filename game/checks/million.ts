import {
    Crowd,
    CROWD_LIMIT,
    CROWD_RATE,
    ESCAPE_LIMIT,
    hit_pitch,
    KILL_TARGET,
} from "../src/crowd.js";
import {MAP_WIDTH} from "../src/navigation.js";

function check(ok: boolean, message: string) {
    if (!ok) throw new Error(message);
}

const crowd = new Crowd();
check(crowd.Start() && !crowd.Start(), "Starts once");
crowd.Tick(1);
check(crowd.Spawned === CROWD_RATE && crowd.Count === CROWD_RATE, "Spawns exact population");
for (let i = 0; i < 40; i++) crowd.Tick(0.05);
check(crowd.Spawned === crowd.Count + crowd.Kills + crowd.Arrived, "Population is conserved");
check(crowd.WallCount() === 0, "Population never enters walls");
const occupiedRows = new Set<number>();
const occupiedColumns = new Set<number>();
for (let cell = 0; cell < crowd.Population.length; cell++)
    if (crowd.Population[cell] >= 10) {
        occupiedRows.add(Math.floor(cell / MAP_WIDTH));
        occupiedColumns.add(cell % MAP_WIDTH);
    }
check(occupiedRows.size >= 24, "Crowd fills the corridor height");
check(occupiedColumns.size >= 8, "Crowd forms a broad front instead of a line");
check(
    crowd.UpdatePrefix() && crowd.Prefix.at(-1) === crowd.Count,
    "Prefix stores exact live count",
);
const beforeBlast = crowd.Count;
check(crowd.Explode(5, 18) > 0 && crowd.Count < beforeBlast, "Missile removes local population");
check(
    crowd.Effects.length === 3 && crowd.Effects.some((effect) => effect.kind === "missile"),
    "Missile emits streak and impact rays",
);
check(
    hit_pitch({fromX: 0, fromY: 0, x: 10, y: 0, life: 1, duration: 1, width: 1, kind: "laser"}) >
        hit_pitch({fromX: 0, fromY: 0, x: 1, y: 0, life: 1, duration: 1, width: 1, kind: "laser"}),
    "Far tower hits have a higher pitch",
);
const diffusion = new Crowd();
const center = 18 * MAP_WIDTH + 20;
const neighbours = [center - 1, center + 1, center - MAP_WIDTH, center + MAP_WIDTH];
diffusion.Population[center] = diffusion.Count = diffusion.Spawned = 10_000;
diffusion.Relax();
check(
    neighbours.every((cell) => diffusion.Population[center] > diffusion.Population[cell]),
    "Density relaxation does not swap into a checkerboard",
);
check(
    diffusion.Population.reduce((sum, count) => sum + count, 0) === 10_000,
    "Density relaxation conserves population",
);
const tower = new Crowd();
tower.Population[10 * MAP_WIDTH + 21] = 10_000;
tower.Count = tower.Spawned = 10_000;
check(tower.Build(22, 10) && !tower.Build(22, 10), "Builds one tower per wall cell");
tower.FireTowers(0.05);
check(tower.Count === 9_750 && tower.Kills === 250, "Tower destroys population");
check(tower.Towers[0].clock === 2, "Default tower interval is two seconds");
check(tower.Effects.length === 1 && tower.Effects[0].kind === "laser", "Tower emits laser");
const nearest = new Crowd();
nearest.Towers.push({x: 22.5, y: 10.5, clock: 0, kind: 0});
const nearCell = 10 * MAP_WIDTH + 21;
const farCell = 18 * MAP_WIDTH + 29;
nearest.Population[nearCell] = nearest.Population[farCell] = 1_000;
nearest.Count = nearest.Spawned = 2_000;
nearest.FireTowers(0.05);
check(nearest.Population[nearCell] === 750, "Tower targets nearest occupied cell");
check(nearest.Population[farCell] === 1_000, "Tower ignores farther occupied cell");
const range = new Crowd();
range.Towers.push({x: 22.5, y: 10.5, clock: 0, kind: 0});
const outsideBaseRange = 10 * MAP_WIDTH + 20;
range.Population[outsideBaseRange] = range.Count = range.Spawned = 1_000;
range.FireTowers(0.05);
check(range.Kills === 0, "Base tower range reaches adjacent cells only");
range.TowerRange = 3;
range.FireTowers(0.05);
check(range.Kills === 250, "Range upgrade reaches farther cells");
const mortar = new Crowd();
mortar.Towers.push({x: 22.5, y: 10.5, clock: 0, kind: 1});
for (const cell of [10 * MAP_WIDTH + 20, 10 * MAP_WIDTH + 19, 9 * MAP_WIDTH + 20])
    mortar.Population[cell] = 1_000;
mortar.Count = mortar.Spawned = 3_000;
mortar.FireTowers(0.05);
check(mortar.Kills > 250 && mortar.Effects[0].kind === "blast", "Mortar damages an area");
const coil = new Crowd();
coil.Towers.push({x: 22.5, y: 10.5, clock: 0, kind: 2});
for (let x = 17; x <= 21; x++) coil.Population[10 * MAP_WIDTH + x] = 1_000;
coil.Count = coil.Spawned = 5_000;
coil.FireTowers(0.05);
check(coil.Kills === 875 && coil.Effects.length === 5, "Coil chains across five cells");
const prism = new Crowd();
prism.Towers.push({x: 22.5, y: 10.5, clock: 0, kind: 3});
for (let x = 16; x <= 21; x++) prism.Population[10 * MAP_WIDTH + x] = 1_000;
prism.Count = prism.Spawned = 6_000;
prism.FireTowers(0.05);
check(prism.Kills === 1_200 && prism.Effects[0].kind === "prism", "Prism cuts a line");
const vertical = new Crowd();
for (let x = 14; x <= 21; x++) vertical.Population[30 * MAP_WIDTH + x] = 10_000;
vertical.Count = vertical.Spawned = 80_000;
for (let i = 0; i < 80; i++) vertical.Flow();
let verticalWidth = 0;
for (let x = 14; x <= 21; x++) verticalWidth += +(vertical.Population[8 * MAP_WIDTH + x] >= 10);
check(verticalWidth >= 6, "Vertical corridor keeps a broad fluid front");
check(vertical.WallCount() === 0, "Vertical spreading stays outside walls");
const arrival = new Crowd();
arrival.Population[18 * MAP_WIDTH + 56] = 123;
arrival.Count = arrival.Spawned = 123;
arrival.Flow();
check(arrival.Arrived === 123 && arrival.Count === 0, "Fortress arrivals are removed");
check(arrival.Spawned === arrival.Count + arrival.Kills + arrival.Arrived, "Arrival conservation");
const loss = new Crowd();
loss.Population[18 * MAP_WIDTH + 56] = ESCAPE_LIMIT + 500;
loss.Count = loss.Spawned = ESCAPE_LIMIT + 500;
loss.Running = true;
loss.Flow();
check(
    loss.Result === -1 && loss.Arrived === ESCAPE_LIMIT && !loss.Running,
    "Loss clamps at one percent escaped",
);
check(loss.Count === 500, "Population beyond loss threshold stays visible");
const multiGate = new Crowd();
for (const y of [17, 18, 19]) multiGate.Population[y * MAP_WIDTH + 56] = 4_000;
multiGate.Count = multiGate.Spawned = 12_000;
multiGate.Running = true;
multiGate.Flow();
check(
    multiGate.Arrived === ESCAPE_LIMIT && multiGate.Count === 2_000,
    "Simultaneous gate arrivals clamp to one percent",
);
const win = new Crowd();
win.Population[18 * MAP_WIDTH + 20] = KILL_TARGET + 500;
win.Count = win.Spawned = KILL_TARGET + 500;
win.Running = true;
win.Remove(18 * MAP_WIDTH + 20, CROWD_LIMIT);
check(
    win.Result === 1 && win.Kills === KILL_TARGET && !win.Running,
    "Win clamps at 99 percent killed",
);
check(win.Count === 500 && win.Explode(20, 18) === 0, "Combat stops after victory");
const full = new Crowd();
full.Start();
full.Tick(CROWD_LIMIT / CROWD_RATE);
check(full.Spawned === CROWD_LIMIT, "Caps at one million spawned unicorns");
console.log("Fluid crowd conservation, walls, attacks, arrivals, and million cap passed.");
