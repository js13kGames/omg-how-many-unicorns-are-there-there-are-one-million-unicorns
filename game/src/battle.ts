import {blocked, MAP_WIDTH as W, MAP_HEIGHT as H, meadow_field, STEP} from "./navigation.js";

export interface Enemy {
    x: number;
    y: number;
    vx: number;
    vy: number;
    hp: number;
    id: number;
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
    FireClock = 0;
    Shots: {x: number; y: number; life: number}[] = [];
    Limit = 5000;
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
        if (this.Integrity <= 0 || (this.Spawned >= this.Limit && this.Enemies.length === 0))
            return;
        this.Time += STEP;
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
            let best = this.Field[cell],
                tx = cx + 0.5,
                ty = cy + 0.5;
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
                    this.Field[ny * W + nx] < best
                ) {
                    best = this.Field[ny * W + nx];
                    tx = nx + 0.5;
                    ty = ny + 0.5;
                }
            }
            let dx = tx - e.x,
                dy = ty - e.y,
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
            const nx = e.x + e.vx * STEP,
                ny = e.y + e.vy * STEP;
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
            const targets = this.Query(37, 23, 12);
            targets.sort(
                (a, b) =>
                    this.Field[Math.floor(this.Enemies[a].y) * W + Math.floor(this.Enemies[a].x)] -
                    this.Field[Math.floor(this.Enemies[b].y) * W + Math.floor(this.Enemies[b].x)],
            );
            if (targets.length) {
                const e = this.Enemies[targets[0]];
                e.hp -= 3;
                if (e.hp <= 0) this.Kills++;
                this.Shots.push({x: e.x, y: e.y, life: 0.12});
                this.FireClock = 0.06;
            }
        }
        for (const shot of this.Shots) shot.life -= STEP;
        this.Shots = this.Shots.filter((s) => s.life > 0);
        this.Enemies = this.Enemies.filter((e) => e.hp > 0);
        this.Grid();
    }
}
