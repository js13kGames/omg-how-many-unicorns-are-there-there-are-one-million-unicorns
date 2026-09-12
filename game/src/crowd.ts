import {blocked, MAP_HEIGHT, MAP_WIDTH, meadow_field} from "./navigation.js";

export const CROWD_LIMIT = 1_000_000;
export const CROWD_RATE = 50_000;
export const CROWD_CELLS = MAP_WIDTH * MAP_HEIGHT;
const FLOW_STEP = 1 / 20;

export interface CrowdTower {
    x: number;
    y: number;
    clock: number;
}

export class Crowd {
    Population = new Uint32Array(CROWD_CELLS);
    Next = new Uint32Array(CROWD_CELLS);
    Prefix = new Float32Array(CROWD_CELLS);
    Field = meadow_field();
    Towers: CrowdTower[] = [];
    Count = 0;
    Spawned = 0;
    Kills = 0;
    Arrived = 0;
    Time = 0;
    Clock = 0;
    SpawnRemainder = 0;
    Running = false;
    Dirty = true;

    Start() {
        if (this.Running || this.Spawned === CROWD_LIMIT) return false;
        this.Running = true;
        return true;
    }

    Reset() {
        this.Population.fill(0);
        this.Next.fill(0);
        this.Prefix.fill(0);
        this.Towers.length = 0;
        this.Count = this.Spawned = this.Kills = this.Arrived = this.Time = this.Clock = 0;
        this.SpawnRemainder = 0;
        this.Running = false;
        this.Dirty = true;
    }

    Build(x: number, y: number) {
        if (this.Towers.some((tower) => tower.x === x && tower.y === y)) return false;
        this.Towers.push({x, y, clock: 0});
        return true;
    }

    Tick(delta: number) {
        if (!this.Running || delta <= 0) return;
        this.Time += delta;
        this.SpawnRemainder += delta * CROWD_RATE;
        const spawn = Math.min(CROWD_LIMIT - this.Spawned, Math.floor(this.SpawnRemainder));
        if (spawn > 0) {
            this.SpawnRemainder -= spawn;
            this.Spawned += spawn;
            this.Count += spawn;
            const rows = 32;
            const each = Math.floor(spawn / rows);
            let rest = spawn - each * rows;
            for (let y = 2; y < 34; y++)
                this.Population[y * MAP_WIDTH + 2] += each + (rest-- > 0 ? 1 : 0);
            this.Dirty = true;
        }
        this.Clock += delta;
        while (this.Clock >= FLOW_STEP) {
            this.Clock -= FLOW_STEP;
            this.Flow();
            this.FireTowers(FLOW_STEP);
        }
    }

    Flow() {
        this.Next.fill(0);
        let arrived = 0;
        for (let cell = 0; cell < CROWD_CELLS; cell++) {
            const count = this.Population[cell];
            if (!count) continue;
            const x = cell % MAP_WIDTH,
                y = Math.floor(cell / MAP_WIDTH);
            if (x >= 56 && y >= 17 && y <= 19) {
                arrived += count;
                continue;
            }
            let best = cell,
                distance = this.Field[cell];
            for (const next of [cell + 1, cell - 1, cell + MAP_WIDTH, cell - MAP_WIDTH])
                if (
                    next >= 0 &&
                    next < CROWD_CELLS &&
                    Math.abs((next % MAP_WIDTH) - x) +
                        Math.abs(Math.floor(next / MAP_WIDTH) - y) ===
                        1 &&
                    this.Field[next] >= 0 &&
                    this.Field[next] < distance
                ) {
                    best = next;
                    distance = this.Field[next];
                }
            const moved = best === cell ? 0 : Math.max(1, Math.floor(count * 0.14));
            this.Next[cell] += count - moved;
            this.Next[best] += moved;
        }
        const swap = this.Population;
        this.Population = this.Next;
        this.Next = swap;
        if (arrived) {
            this.Arrived += arrived;
            this.Count -= arrived;
        }
        this.Dirty = true;
    }

    FireTowers(delta: number) {
        for (const tower of this.Towers) {
            tower.clock -= delta;
            if (tower.clock > 0) continue;
            let target = -1,
                best = Infinity;
            for (let cell = 0; cell < CROWD_CELLS; cell++) {
                if (!this.Population[cell]) continue;
                const x = (cell % MAP_WIDTH) + 0.5,
                    y = Math.floor(cell / MAP_WIDTH) + 0.5,
                    distance = (x - tower.x) ** 2 + (y - tower.y) ** 2;
                if (distance <= 144 && this.Field[cell] < best) {
                    target = cell;
                    best = this.Field[cell];
                }
            }
            if (target >= 0) {
                this.Remove(target, 250);
                tower.clock = 0.12;
            }
        }
    }

    Explode(x: number, y: number, radius = 5) {
        if (!Number.isFinite(x + y) || x < 0 || y < 0 || x >= MAP_WIDTH || y >= MAP_HEIGHT)
            return 0;
        let killed = 0;
        for (
            let cy = Math.max(0, Math.floor(y - radius));
            cy <= Math.min(MAP_HEIGHT - 1, Math.floor(y + radius));
            cy++
        )
            for (
                let cx = Math.max(0, Math.floor(x - radius));
                cx <= Math.min(MAP_WIDTH - 1, Math.floor(x + radius));
                cx++
            ) {
                const distance = Math.hypot(cx + 0.5 - x, cy + 0.5 - y);
                if (distance > radius) continue;
                const cell = cy * MAP_WIDTH + cx;
                killed += this.Remove(cell, Math.ceil((1 - distance / radius) * 20_000));
            }
        return killed;
    }

    Remove(cell: number, amount: number) {
        const removed = Math.min(this.Population[cell], Math.max(0, Math.floor(amount)));
        if (!removed) return 0;
        this.Population[cell] -= removed;
        this.Count -= removed;
        this.Kills += removed;
        this.Dirty = true;
        return removed;
    }

    UpdatePrefix() {
        if (!this.Dirty) return false;
        let total = 0;
        for (let cell = 0; cell < CROWD_CELLS; cell++)
            this.Prefix[cell] = total += this.Population[cell];
        if (total !== this.Count) throw new Error("Crowd population mismatch");
        this.Dirty = false;
        return true;
    }

    WallCount() {
        let count = 0;
        for (let y = 0; y < MAP_HEIGHT; y++)
            for (let x = 0; x < MAP_WIDTH; x++)
                if (blocked(x, y)) count += this.Population[y * MAP_WIDTH + x];
        return count;
    }
}
