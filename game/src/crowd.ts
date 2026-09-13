import {blocked, MAP_HEIGHT, MAP_WIDTH, meadow_field} from "./navigation.js";

export const CROWD_LIMIT = 1_000_000;
export const ESCAPE_LIMIT = 10_000;
export const KILL_TARGET = 990_000;
export const CROWD_RATE = 50_000;
export const CROWD_CELLS = MAP_WIDTH * MAP_HEIGHT;
const FLOW_STEP = 1 / 20;

export interface CrowdTower {
    x: number;
    y: number;
    clock: number;
}

export interface CrowdEffect {
    fromX: number;
    fromY: number;
    x: number;
    y: number;
    life: number;
    duration: number;
    width: number;
    kind: "laser" | "missile" | "blast";
}

export class Crowd {
    Population = new Uint32Array(CROWD_CELLS);
    Next = new Uint32Array(CROWD_CELLS);
    Prefix = new Float32Array(CROWD_CELLS);
    Field = meadow_field();
    Towers: CrowdTower[] = [];
    Effects: CrowdEffect[] = [];
    Count = 0;
    Spawned = 0;
    Kills = 0;
    Arrived = 0;
    Time = 0;
    Clock = 0;
    SpawnRemainder = 0;
    Running = false;
    Result = 0;
    TowerDamage = 250;
    TowerInterval = 2;
    TowerRange = 1.5;
    MissileDamage = 20_000;
    Dirty = true;

    Start() {
        if (this.Result || this.Running || this.Spawned === CROWD_LIMIT) return false;
        this.Running = true;
        return true;
    }

    Reset() {
        this.Population.fill(0);
        this.Next.fill(0);
        this.Prefix.fill(0);
        this.Towers.length = 0;
        this.Effects.length = 0;
        this.Count = this.Spawned = this.Kills = this.Arrived = this.Time = this.Clock = 0;
        this.SpawnRemainder = 0;
        this.Running = false;
        this.Result = 0;
        this.Dirty = true;
    }

    Build(x: number, y: number) {
        if (
            !Number.isInteger(x) ||
            !Number.isInteger(y) ||
            x < 0 ||
            x >= 56 ||
            y < 0 ||
            y >= MAP_HEIGHT ||
            !blocked(x, y) ||
            this.Towers.some((tower) => Math.floor(tower.x) === x && Math.floor(tower.y) === y)
        )
            return false;
        this.Towers.push({x: x + 0.5, y: y + 0.5, clock: 0});
        return true;
    }

    Tick(delta: number) {
        if (delta <= 0) return;
        for (const effect of this.Effects) effect.life -= delta;
        this.Effects = this.Effects.filter((effect) => effect.life > 0);
        if (!this.Running) return;
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
                const escaped = Math.min(count, ESCAPE_LIMIT - this.Arrived - arrived);
                arrived += escaped;
                this.Next[cell] += count - escaped;
                continue;
            }
            const distance = this.Field[cell],
                candidates = [-1, -1, -1, -1];
            let candidateCount = 0;
            for (const next of [cell + 1, cell - 1, cell + MAP_WIDTH, cell - MAP_WIDTH])
                if (
                    next >= 0 &&
                    next < CROWD_CELLS &&
                    Math.abs((next % MAP_WIDTH) - x) +
                        Math.abs(Math.floor(next / MAP_WIDTH) - y) ===
                        1 &&
                    this.Field[next] >= 0 &&
                    this.Field[next] < distance
                )
                    candidates[candidateCount++] = next;
            const moved = candidateCount && count >= 64 ? Math.floor(count * 0.2) : 0;
            this.Next[cell] += count - moved;
            for (let i = 0, remaining = moved; i < candidateCount; i++) {
                const share = Math.floor(remaining / (candidateCount - i));
                this.Next[candidates[i]] += share;
                remaining -= share;
            }
        }
        const swap = this.Population;
        this.Population = this.Next;
        this.Next = swap;
        for (let pass = 0; pass < 3; pass++) this.Relax();
        if (arrived) {
            this.Arrived += arrived;
            this.Count -= arrived;
            if (this.Arrived >= ESCAPE_LIMIT) {
                this.Result = -1;
                this.Running = false;
            }
        }
        this.Dirty = true;
    }

    Relax() {
        this.Next.set(this.Population);
        for (let cell = 0; cell < CROWD_CELLS; cell++) {
            if (this.Field[cell] < 0 || !this.Population[cell]) continue;
            const x = cell % MAP_WIDTH;
            for (const next of [cell + 1, cell + MAP_WIDTH]) {
                if (
                    next >= CROWD_CELLS ||
                    (next === cell + 1 && x === MAP_WIDTH - 1) ||
                    this.Field[next] < 0
                )
                    continue;
                const difference = this.Population[cell] - this.Population[next];
                if (Math.abs(difference) < 32) continue;
                const source = difference > 0 ? cell : next,
                    target = difference > 0 ? next : cell,
                    transfer = Math.floor(Math.abs(difference) * 0.15);
                if (transfer < 8) continue;
                this.Next[source] -= transfer;
                this.Next[target] += transfer;
            }
        }
        const swap = this.Population;
        this.Population = this.Next;
        this.Next = swap;
    }

    FireTowers(delta: number) {
        for (const tower of this.Towers) {
            if (this.Result) break;
            tower.clock -= delta;
            if (tower.clock > 0) continue;
            let target = -1,
                best = Infinity;
            for (let cell = 0; cell < CROWD_CELLS; cell++) {
                if (!this.Population[cell]) continue;
                const x = (cell % MAP_WIDTH) + 0.5,
                    y = Math.floor(cell / MAP_WIDTH) + 0.5,
                    distance = (x - tower.x) ** 2 + (y - tower.y) ** 2;
                if (distance <= this.TowerRange ** 2 && distance < best) {
                    target = cell;
                    best = distance;
                }
            }
            if (target >= 0) {
                const removed = this.Remove(target, this.TowerDamage);
                if (removed) {
                    const x = (target % MAP_WIDTH) + 0.5,
                        y = Math.floor(target / MAP_WIDTH) + 0.5;
                    this.Effect(tower.x, tower.y, x, y, 0.18, 0.14, "laser");
                }
                tower.clock = this.TowerInterval;
            }
        }
    }

    Explode(x: number, y: number, radius = 5) {
        if (this.Result) return 0;
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
                killed += this.Remove(
                    cell,
                    Math.ceil((1 - distance / radius) * this.MissileDamage),
                );
            }
        if (killed) {
            this.Effect(x - 10, y - 12, x, y, 0.35, 0.22, "missile");
            this.Effect(x - 3, y, x + 3, y, 0.4, 0.18, "blast");
            this.Effect(x, y - 3, x, y + 3, 0.4, 0.18, "blast");
        }
        return killed;
    }

    Effect(
        fromX: number,
        fromY: number,
        x: number,
        y: number,
        duration: number,
        width: number,
        kind: CrowdEffect["kind"],
    ) {
        this.Effects.push({fromX, fromY, x, y, life: duration, duration, width, kind});
        if (this.Effects.length > 64) this.Effects.splice(0, this.Effects.length - 64);
    }

    Remove(cell: number, amount: number) {
        const removed = Math.min(
            this.Population[cell],
            KILL_TARGET - this.Kills,
            Math.max(0, Math.floor(amount)),
        );
        if (!removed) return 0;
        this.Population[cell] -= removed;
        this.Count -= removed;
        this.Kills += removed;
        if (this.Kills >= KILL_TARGET) {
            this.Result = 1;
            this.Running = false;
        }
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
