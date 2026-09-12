import {Crowd, CROWD_LIMIT, CROWD_RATE, ESCAPE_LIMIT, KILL_TARGET} from "../src/crowd.js";
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
const tower = new Crowd();
tower.Population[18 * MAP_WIDTH + 20] = 10_000;
tower.Count = tower.Spawned = 10_000;
check(tower.Build(22, 10) && !tower.Build(22, 10), "Builds one tower per wall cell");
tower.FireTowers(0.05);
check(tower.Count === 9_750 && tower.Kills === 250, "Tower destroys population");
check(tower.Effects.length === 1 && tower.Effects[0].kind === "laser", "Tower emits laser");
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
