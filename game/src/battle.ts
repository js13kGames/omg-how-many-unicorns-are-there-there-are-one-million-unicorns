import {blocked, MAP_WIDTH as W, MAP_HEIGHT as H, meadow_field, STEP} from "./navigation.js";

export const PADS = [
    [37, 23],
    [37, 12],
    [25, 24],
    [25, 11],
    [47, 23],
    [47, 12],
];
export interface Enemy {
    x: number;
    y: number;
    vx: number;
    vy: number;
    hp: number;
    id: number;
    kx?: number;
    ky?: number;
}
export class Battle {
    Enemies: Enemy[] = [];
    Field = meadow_field();
    Cells: number[][] = Array.from({length: W * H}, () => []);
    Integrity = 100;
    Kills = 0;
    Spawned = 0;
    Time = 0;
    SpawnClock = 0;
    Damage = 3;
    FireInterval = 0.06;
    FireClock = 0;
    Shots: {x: number; y: number; life: number; fromX: number; fromY: number}[] = [];
    Stars = 180;
    MissileCooldown = 0;
    Blast: {x: number; y: number; life: number} | null = null;
    Explode(x: number, y: number) {
        if (
            !Number.isFinite(x + y) ||
            blocked(Math.floor(x), Math.floor(y)) ||
            this.Integrity <= 0 ||
            this.Won ||
            this.MissileCooldown > 0
        )
            return false;
        this.Grid();
        for (const i of this.Query(x, y, 5)) {
            const e = this.Enemies[i],
                dx = e.x - x,
                dy = e.y - y,
                d = Math.hypot(dx, dy),
                strength = 1 - d / 5;
            e.hp -= 12 * strength;
            if (e.hp <= 0) {
                this.Kills++;
                this.Stars++;
            }
            const angle = e.id * 2.399;
            e.kx = (e.kx || 0) + (d ? dx / d : Math.cos(angle)) * strength * 12;
            e.ky = (e.ky || 0) + (d ? dy / d : Math.sin(angle)) * strength * 12;
        }
        this.MissileCooldown = 8;
        this.Blast = {x, y, life: 0.5};
        return true;
    }
    Towers: {x: number; y: number; clock: number}[] = [];
    Build(pad: number) {
        if (
            !Number.isInteger(pad) ||
            pad < 0 ||
            pad >= PADS.length ||
            this.Integrity <= 0 ||
            this.Won ||
            this.Stars < 60
        )
            return false;
        const [x, y] = PADS[pad];
        if (this.Towers.some((t) => t.x === x && t.y === y)) return false;
        this.Stars -= 60;
        this.Towers.push({x, y, clock: 0});
        return true;
    }
    Wave = 0;
    Cleared = 0;
    Preparing = 8;
    WaveTime = 0;
    Won = false;
    Campaign = true;
    StartWave() {
        if (!this.Campaign || this.Won || this.Integrity <= 0 || this.Preparing <= 0) return false;
        this.Wave++;
        this.WaveTime = 0;
        this.Preparing = 0;
        this.SpawnClock = 0;
        this.Limit = this.Spawned + Math.round(240 * 1.48 ** (this.Wave - 1));
        return true;
    }
    Limit = 0;
    Rate = 100;
    TowerEnabled = true;
    Seed = 12345;
    Random() {
        this.Seed = (Math.imul(this.Seed, 1664525) + 1013904223) >>> 0;
        return this.Seed / 4294967296;
    }
    Spawn() {
        const e = {
            x: 1 + this.Random() * 3,
            y: 2 + this.Random() * 32,
            vx: 0,
            vy: 0,
            hp: 3,
            id: this.Spawned++,
        };
        this.Enemies.push(e);
        return e;
    }
    Grid() {
        for (const cell of this.Cells) cell.length = 0;
        for (let i = 0; i < this.Enemies.length; i++) {
            const e = this.Enemies[i];
            if (e.hp > 0) this.Cells[Math.floor(e.y) * W + Math.floor(e.x)].push(i);
        }
    }
    Query(x: number, y: number, r: number) {
        const result: number[] = [];
        for (
            let cy = Math.max(0, Math.floor(y - r));
            cy <= Math.min(H - 1, Math.floor(y + r));
            cy++
        )
            for (
                let cx = Math.max(0, Math.floor(x - r));
                cx <= Math.min(W - 1, Math.floor(x + r));
                cx++
            ) {
                for (const i of this.Cells[cy * W + cx]) {
                    const e = this.Enemies[i];
                    if (e.hp > 0 && (e.x - x) ** 2 + (e.y - y) ** 2 <= r * r) result.push(i);
                }
            }
        return result;
    }
    Tick() {
        if (this.Integrity <= 0 || this.Won) return;
        if (this.Campaign && this.Preparing > 0) {
            this.Preparing = Math.max(0, this.Preparing - STEP);
            if (this.Preparing === 0) {
                this.Preparing = STEP;
                this.StartWave();
            }
            return;
        }
        this.WaveTime += STEP;
        if (this.Campaign)
            this.Rate =
                (30 + this.Wave * 12) *
                (this.WaveTime % 12 < 4 ? 0.65 : this.WaveTime % 12 < 9 ? 1.6 : 0.35);
        this.Time += STEP;
        this.MissileCooldown = Math.max(0, this.MissileCooldown - STEP);
        if (this.Blast && (this.Blast.life -= STEP) <= 0) this.Blast = null;
        this.SpawnClock += STEP * this.Rate;
        while (this.SpawnClock >= 1 && this.Spawned < this.Limit) {
            this.Spawn();
            this.SpawnClock--;
        }
        this.Grid();
        for (const e of this.Enemies) {
            if (e.hp <= 0) continue;
            const cx = Math.floor(e.x),
                cy = Math.floor(e.y),
                cell = cy * W + cx;
            let tx = 0,
                ty = 0;
            for (const [dx, dy] of [
                [1, 0],
                [0, 1],
                [0, -1],
                [-1, 0],
            ]) {
                const nx = cx + dx,
                    ny = cy + dy;
                if (
                    !blocked(nx, ny) &&
                    this.Field[ny * W + nx] >= 0 &&
                    this.Field[ny * W + nx] < this.Field[cell]
                ) {
                    tx += dx;
                    ty += dy;
                }
            }
            let dx = tx,
                dy = ty,
                length = Math.hypot(dx, dy) || 1;
            dx = (dx / length) * 2.8;
            dy = (dy / length) * 2.8;
            let checked = 0;
            // ponytail: sample at most 24 neighbours for separation; use density forces if dense chokes need more pressure.
            for (let y = Math.max(0, cy - 1); y <= Math.min(H - 1, cy + 1); y++)
                for (let x = Math.max(0, cx - 1); x <= Math.min(W - 1, cx + 1); x++)
                    for (const i of this.Cells[y * W + x]) {
                        if (checked >= 24) break;
                        const other = this.Enemies[i];
                        if (other === e) continue;
                        checked++;
                        const sx = e.x - other.x,
                            sy = e.y - other.y,
                            d = Math.hypot(sx, sy);
                        if (d > 0 && d < 0.45) {
                            dx += (sx / d) * (0.45 - d) * 5;
                            dy += (sy / d) * (0.45 - d) * 5;
                        }
                    }
            const density = (x: number, y: number) =>
                blocked(x, y) ? this.Cells[cell].length : this.Cells[y * W + x].length;
            dx += Math.max(-1, Math.min(1, (density(cx - 1, cy) - density(cx + 1, cy)) * 0.08));
            dy += Math.max(-1, Math.min(1, (density(cx, cy - 1) - density(cx, cy + 1)) * 0.08));
            dy += Math.sin(e.id * 2.4 + this.Time * 0.7) * 0.12;
            e.vx += (dx - e.vx) * 0.15;
            e.vy += (dy - e.vy) * 0.15;
            e.kx = (e.kx || 0) * 0.94;
            e.ky = (e.ky || 0) * 0.94;
            const nx = e.x + (e.vx + e.kx) * STEP,
                ny = e.y + (e.vy + e.ky) * STEP;
            if (!blocked(Math.floor(nx), Math.floor(e.y))) e.x = nx;
            if (!blocked(Math.floor(e.x), Math.floor(ny))) e.y = ny;
            if (e.x > 56 && Math.abs(e.y - 18) < 1.5) {
                e.hp = 0;
                this.Integrity = Math.max(0, this.Integrity - 1);
            }
        }
        this.Grid();
        this.FireClock -= STEP;
        if (this.TowerEnabled && this.FireClock <= 0) {
            for (const tower of this.Towers) {
                tower.clock -= STEP;
                if (tower.clock > 0) continue;
                const targets = this.Query(tower.x, tower.y, 12);
                targets.sort(
                    (a, b) =>
                        this.Field[
                            Math.floor(this.Enemies[a].y) * W + Math.floor(this.Enemies[a].x)
                        ] -
                        this.Field[
                            Math.floor(this.Enemies[b].y) * W + Math.floor(this.Enemies[b].x)
                        ],
                );
                if (targets.length) {
                    const e = this.Enemies[targets[0]];
                    e.hp -= this.Damage;
                    if (e.hp <= 0) {
                        this.Kills++;
                        this.Stars++;
                    }
                    this.Shots.push({x: e.x, y: e.y, fromX: tower.x, fromY: tower.y, life: 0.12});
                    tower.clock = this.FireInterval;
                }
            }
        }
        for (const shot of this.Shots) shot.life -= STEP;
        this.Shots = this.Shots.filter((s) => s.life > 0);
        this.Enemies = this.Enemies.filter((e) => e.hp > 0);
        if (
            this.Campaign &&
            this.Integrity > 0 &&
            this.Spawned >= this.Limit &&
            !this.Enemies.length
        ) {
            this.Cleared = this.Wave;
            this.Stars += 40 + this.Wave * 10;
            if (this.Wave === 8) this.Won = true;
            else this.Preparing = 5;
        }
        this.Grid();
    }
}
