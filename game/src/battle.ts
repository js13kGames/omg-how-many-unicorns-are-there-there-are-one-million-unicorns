import {beam_segments} from "./beam.js";
import {blocked, MAP_WIDTH as W, MAP_HEIGHT as H, meadow_field, STEP} from "./navigation.js";

export const TOWER_COSTS = [60, 100, 90, 80, 120, 140, 100];
export const TOWER_NAMES = [
    "Star Blaster",
    "Cloud Mortar",
    "Friendship Coil",
    "Rainbow Sprayer",
    "Candy Cannon",
    "Prism Beam",
    "Cupcake Launcher",
];
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
    speed?: number;
    frozen?: number;
    kind?: number;
    mass?: number;
    armor?: number;
    leak?: number;
    slow?: number;
    vulnerable?: number;
    rally?: boolean;
}
export class Battle {
    Enemies: Enemy[] = [];
    Map = 0;
    SetMap(map: number) {
        if (!Number.isInteger(map) || map < 0 || map > 4) throw new Error("Invalid map");
        this.Map = map;
        this.Field = meadow_field(map);
    }
    Blocked(x: number, y: number) {
        return blocked(x, y, this.Map);
    }
    Field = meadow_field();
    Cells: number[][] = Array.from({length: W * H}, () => []);
    MaxIntegrity = 100;
    Range = 12;
    Integrity = 100;
    Kills = 0;
    Spawned = 0;
    Time = 0;
    SpawnClock = 0;
    Damage = 3;
    FireInterval = 0.06;
    FireClock = 0;
    Shots: {x: number; y: number; life: number; fromX: number; fromY: number}[] = [];
    Cannonballs: {
        x: number;
        y: number;
        dx: number;
        dy: number;
        left: number;
        damage: number;
        hit: Set<number>;
    }[] = [];
    Stars = 180;
    SpecialCooldowns: Record<string, number> = {flyby: 0, divine: 0, apocalypse: 0};
    Specials: {
        kind: string;
        ax: number;
        ay: number;
        bx: number;
        by: number;
        time: number;
        fired: number;
    }[] = [];
    Special(kind: string, ax: number, ay: number, bx = ax, by = ay) {
        if (
            !Object.hasOwn(this.SpecialCooldowns, kind) ||
            this.SpecialCooldowns[kind] > 0 ||
            this.Won ||
            this.Integrity <= 0 ||
            ![ax, ay, bx, by].every(Number.isFinite) ||
            Math.min(ax, bx) < 0 ||
            Math.max(ax, bx) >= W ||
            Math.min(ay, by) < 0 ||
            Math.max(ay, by) >= H
        )
            return false;
        this.SpecialCooldowns[kind] = kind === "apocalypse" ? 90 : kind === "divine" ? 40 : 30;
        this.Specials.push({kind, ax, ay, bx, by, time: 0, fired: 0});
        return true;
    }
    FreezeCooldown = 0;
    Freeze(ax: number, ay: number, bx: number, by: number) {
        if (
            ![ax, ay, bx, by].every(Number.isFinite) ||
            ax < 0 ||
            bx < 0 ||
            ay < 0 ||
            by < 0 ||
            ax >= W ||
            bx >= W ||
            ay >= H ||
            by >= H ||
            this.FreezeCooldown > 0 ||
            this.Won ||
            this.Integrity <= 0
        )
            return false;
        const dx = bx - ax,
            dy = by - ay,
            length = dx * dx + dy * dy;
        this.Grid();
        for (const i of this.Query((ax + bx) / 2, (ay + by) / 2, Math.sqrt(length) / 2 + 2)) {
            const e = this.Enemies[i],
                t = length
                    ? Math.max(0, Math.min(1, ((e.x - ax) * dx + (e.y - ay) * dy) / length))
                    : 0;
            if ((e.x - ax - dx * t) ** 2 + (e.y - ay - dy * t) ** 2 <= 4) e.frozen = 3;
        }
        this.Shots.push({x: bx, y: by, fromX: ax, fromY: ay, life: 0.5});
        this.FreezeCooldown = 18;
        return true;
    }
    MissileCooldown = 0;
    Blast: {x: number; y: number; life: number} | null = null;
    Explode(x: number, y: number) {
        if (
            !Number.isFinite(x + y) ||
            this.Blocked(Math.floor(x), Math.floor(y)) ||
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
            this.DamageEnemy(e, 12 * strength);
            const angle = e.id * 2.399;
            e.kx = (e.kx || 0) + ((d ? dx / d : Math.cos(angle)) * strength * 12) / (e.mass || 1);
            e.ky = (e.ky || 0) + ((d ? dy / d : Math.sin(angle)) * strength * 12) / (e.mass || 1);
        }
        this.MissileCooldown = 8;
        this.Blast = {x, y, life: 0.5};
        return true;
    }
    DamageEnemy(e: Enemy, damage: number) {
        if (e.hp <= 0 || damage <= 0) return;
        damage *= (e.vulnerable || 0) > 0 ? 1.15 : 1;
        e.hp -= Math.max(Math.min(1, damage), damage - (e.armor || 0));
        if (e.hp <= 0) {
            this.Kills++;
            this.Stars++;
        }
    }
    AreaDamage(x: number, y: number, radius: number, damage: number) {
        for (const i of this.Query(x, y, radius)) {
            const e = this.Enemies[i],
                dx = e.x - x,
                dy = e.y - y,
                d = Math.hypot(dx, dy),
                falloff = 1 - d / radius;
            this.DamageEnemy(e, damage * falloff);
            e.kx = (e.kx || 0) + ((d ? dx / d : 1) * falloff * 8) / (e.mass || 1);
            e.ky = (e.ky || 0) + ((d ? dy / d : 0) * falloff * 8) / (e.mass || 1);
        }
        this.Blast = {x, y, life: 0.5};
    }
    Mortars: {x: number; y: number; delay: number; damage: number; support?: boolean}[] = [];
    Towers: {x: number; y: number; clock: number; kind: number}[] = [];
    Build(pad: number, kind = 0) {
        if (
            !Number.isInteger(kind) ||
            kind < 0 ||
            kind > 6 ||
            !Number.isInteger(pad) ||
            pad < 0 ||
            pad >= PADS.length ||
            this.Integrity <= 0 ||
            this.Won ||
            this.Stars < TOWER_COSTS[kind]
        )
            return false;
        const [x, y] = PADS[pad];
        if (this.Towers.some((t) => t.x === x && t.y === y)) return false;
        this.Stars -= TOWER_COSTS[kind];
        this.Towers.push({x, y, clock: 0, kind});
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
        const kind =
            this.Wave === 8 && this.Spawned === this.Limit - 1
                ? 4
                : this.Wave >= 6 && this.Spawned % 17 === 0
                  ? 3
                  : this.Wave >= 4 && this.Spawned % 13 === 0
                    ? 2
                    : this.Wave >= 3 && this.Spawned % 5 === 0
                      ? 1
                      : 0;
        const e = {
            x: 1 + this.Random() * 3,
            y: 2 + this.Random() * 32,
            vx: 0,
            vy: 0,
            kind,
            speed: [2.8, 4.8, 1.8, 2.4, 1.4][kind],
            hp: [3, 2, 36, 18, 1500][kind],
            mass: [1, 0.7, 4, 2, 15][kind],
            armor: kind === 3 ? 2 : 0,
            leak: [1, 1, 5, 2, 20][kind],
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
        for (const key in this.SpecialCooldowns)
            this.SpecialCooldowns[key] = Math.max(0, this.SpecialCooldowns[key] - STEP);
        this.FreezeCooldown = Math.max(0, this.FreezeCooldown - STEP);
        this.MissileCooldown = Math.max(0, this.MissileCooldown - STEP);
        if (this.Blast && (this.Blast.life -= STEP) <= 0) this.Blast = null;
        this.SpawnClock += STEP * this.Rate;
        while (this.SpawnClock >= 1 && this.Spawned < this.Limit) {
            this.Spawn();
            this.SpawnClock--;
        }
        this.Grid();
        for (const e of this.Enemies) e.rally = false;
        for (const royal of this.Enemies)
            if (royal.kind === 4 && royal.hp > 0)
                for (const i of this.Query(royal.x, royal.y, 6))
                    if (this.Enemies[i] !== royal) this.Enemies[i].rally = true;
        for (const e of this.Enemies) {
            if (e.hp <= 0) continue;
            e.slow = Math.max(0, (e.slow || 0) - STEP);
            e.vulnerable = Math.max(0, (e.vulnerable || 0) - STEP);
            if ((e.frozen || 0) > 0) {
                e.frozen = Math.max(0, e.frozen! - STEP);
                e.vx = 0;
                e.vy = 0;
                continue;
            }
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
                    !this.Blocked(nx, ny) &&
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
            dx =
                (dx / length) *
                (e.speed || 2.8) *
                (e.rally ? 1.25 : 1) *
                ((e.slow || 0) > 0 ? 0.7 : 1);
            dy =
                (dy / length) *
                (e.speed || 2.8) *
                (e.rally ? 1.25 : 1) *
                ((e.slow || 0) > 0 ? 0.7 : 1);
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
                this.Blocked(x, y) ? this.Cells[cell].length : this.Cells[y * W + x].length;
            dx += Math.max(-1, Math.min(1, (density(cx - 1, cy) - density(cx + 1, cy)) * 0.08));
            dy += Math.max(-1, Math.min(1, (density(cx, cy - 1) - density(cx, cy + 1)) * 0.08));
            dy += Math.sin(e.id * 2.4 + this.Time * 0.7) * 0.12;
            e.vx += (dx - e.vx) * 0.15;
            e.vy += (dy - e.vy) * 0.15;
            e.kx = (e.kx || 0) * 0.94;
            e.ky = (e.ky || 0) * 0.94;
            const nx = e.x + (e.vx + e.kx) * STEP,
                ny = e.y + (e.vy + e.ky) * STEP;
            if (!this.Blocked(Math.floor(nx), Math.floor(e.y))) e.x = nx;
            if (!this.Blocked(Math.floor(e.x), Math.floor(ny))) e.y = ny;
            if (e.x > 56 && Math.abs(e.y - 18) < 1.5) {
                e.hp = 0;
                this.Integrity = Math.max(0, this.Integrity - (e.leak || 1));
            }
        }
        this.Grid();
        for (const special of this.Specials) {
            special.time += STEP;
            if (special.time < 0.6) continue;
            if (special.kind === "apocalypse" && special.fired === 0) {
                this.AreaDamage(special.ax, special.ay, 22, 500);
                special.fired = 1;
            } else if (special.kind === "flyby") {
                const count = Math.min(12, Math.floor((special.time - 0.6) / 0.08) + 1);
                while (special.fired < count) {
                    const t = special.fired++ / 11;
                    this.AreaDamage(
                        special.ax + (special.bx - special.ax) * t,
                        special.ay + (special.by - special.ay) * t,
                        3.5,
                        30,
                    );
                }
            } else if (special.kind === "divine") {
                const dx = special.bx - special.ax,
                    dy = special.by - special.ay,
                    len = dx * dx + dy * dy;
                for (const i of this.Query(
                    (special.ax + special.bx) / 2,
                    (special.ay + special.by) / 2,
                    Math.sqrt(len) / 2 + 1.5,
                )) {
                    const e = this.Enemies[i],
                        t = len
                            ? Math.max(
                                  0,
                                  Math.min(
                                      1,
                                      ((e.x - special.ax) * dx + (e.y - special.ay) * dy) / len,
                                  ),
                              )
                            : 0;
                    if ((e.x - special.ax - t * dx) ** 2 + (e.y - special.ay - t * dy) ** 2 < 2.25)
                        this.DamageEnemy(e, 100 * STEP);
                }
                this.Shots.push({
                    x: special.bx,
                    y: special.by,
                    fromX: special.ax,
                    fromY: special.ay,
                    life: 0.04,
                });
            }
        }
        this.Specials = this.Specials.filter(
            (s) => s.time < (s.kind === "divine" ? 3.6 : s.kind === "flyby" ? 1.6 : 1),
        );
        for (const ball of this.Cannonballs) {
            const step = Math.min(ball.left, 20 * STEP),
                ax = ball.x,
                ay = ball.y;
            const segment = beam_segments(ax, ay, ball.dx, ball.dy, step, this.Map, false)[0];
            if (!segment) {
                ball.left = 0;
                continue;
            }
            const bx = segment.bx,
                by = segment.by,
                dx = bx - ax,
                dy = by - ay,
                length = dx * dx + dy * dy;
            const targets = this.Query((ax + bx) / 2, (ay + by) / 2, step / 2 + 0.5)
                .filter((i) => {
                    const e = this.Enemies[i],
                        t = length
                            ? Math.max(0, Math.min(1, ((e.x - ax) * dx + (e.y - ay) * dy) / length))
                            : 0;
                    return (
                        !ball.hit.has(e.id) &&
                        (e.x - ax - t * dx) ** 2 + (e.y - ay - t * dy) ** 2 < 0.25
                    );
                })
                .sort(
                    (a, b) =>
                        (this.Enemies[a].x - this.Enemies[b].x) * ball.dx +
                        (this.Enemies[a].y - this.Enemies[b].y) * ball.dy,
                );
            for (const i of targets) {
                const e = this.Enemies[i];
                ball.hit.add(e.id);
                this.DamageEnemy(e, ball.damage);
                ball.damage *= 0.85;
            }
            ball.x = bx;
            ball.y = by;
            ball.left -= step;
            if (Math.hypot(dx, dy) < step - 0.001) ball.left = 0;
            this.Shots.push({x: bx, y: by, fromX: ax, fromY: ay, life: 0.06});
        }
        this.Cannonballs = this.Cannonballs.filter((b) => b.left > 0);
        for (const mortar of this.Mortars) {
            mortar.delay -= STEP;
            if (mortar.delay <= 0) {
                if (mortar.support)
                    for (const i of this.Query(mortar.x, mortar.y, 4)) {
                        const e = this.Enemies[i];
                        e.slow = 3;
                        e.vulnerable = 3;
                    }
                this.AreaDamage(mortar.x, mortar.y, 4, mortar.damage);
            }
        }
        this.Mortars = this.Mortars.filter((m) => m.delay > 0);
        this.FireClock -= STEP;
        if (this.TowerEnabled && this.FireClock <= 0) {
            for (const tower of this.Towers) {
                tower.clock -= STEP;
                if (tower.clock > 0) continue;
                const targets = this.Query(tower.x, tower.y, this.Range);
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
                    if (tower.kind >= 3) {
                        const aim = this.Enemies[targets[0]],
                            dx = aim.x - tower.x,
                            dy = aim.y - tower.y,
                            len = Math.hypot(dx, dy) || 1,
                            ux = dx / len,
                            uy = dy / len;
                        if (tower.kind === 4) {
                            this.Cannonballs.push({
                                x: tower.x,
                                y: tower.y,
                                dx: ux,
                                dy: uy,
                                left: this.Range,
                                damage: this.Damage * 8,
                                hit: new Set(),
                            });
                            tower.clock = 1.2;
                            continue;
                        }
                        if (tower.kind === 5) {
                            for (const segment of beam_segments(
                                tower.x,
                                tower.y,
                                ux,
                                uy,
                                this.Range,
                                this.Map,
                            )) {
                                const dx = segment.bx - segment.ax,
                                    dy = segment.by - segment.ay,
                                    length = dx * dx + dy * dy;
                                for (const i of this.Query(
                                    (segment.ax + segment.bx) / 2,
                                    (segment.ay + segment.by) / 2,
                                    Math.sqrt(length) / 2 + 0.5,
                                )) {
                                    const e = this.Enemies[i],
                                        t = length
                                            ? Math.max(
                                                  0,
                                                  Math.min(
                                                      1,
                                                      ((e.x - segment.ax) * dx +
                                                          (e.y - segment.ay) * dy) /
                                                          length,
                                                  ),
                                              )
                                            : 0;
                                    if (
                                        (e.x - segment.ax - t * dx) ** 2 +
                                            (e.y - segment.ay - t * dy) ** 2 <
                                        0.25
                                    )
                                        this.DamageEnemy(e, this.Damage * 0.4 * segment.power);
                                }
                                this.Shots.push({
                                    x: segment.bx,
                                    y: segment.by,
                                    fromX: segment.ax,
                                    fromY: segment.ay,
                                    life: 0.12,
                                });
                            }
                            tower.clock = 0.1;
                            continue;
                        }
                        if (tower.kind === 6) {
                            this.Mortars.push({
                                x: aim.x,
                                y: aim.y,
                                delay: 0.5,
                                damage: this.Damage,
                                support: true,
                            });
                            tower.clock = 1.5;
                        } else {
                            const line = targets.filter((i) => {
                                const e = this.Enemies[i],
                                    px = e.x - tower.x,
                                    py = e.y - tower.y,
                                    along = px * ux + py * uy;
                                return (
                                    along >= 0 &&
                                    (tower.kind === 3
                                        ? along / (Math.hypot(px, py) || 1) > 0.8
                                        : Math.abs(px * uy - py * ux) < 0.5)
                                );
                            });
                            line.sort((a, b) => {
                                const ea = this.Enemies[a],
                                    eb = this.Enemies[b];
                                return (ea.x - eb.x) * ux + (ea.y - eb.y) * uy;
                            });
                            let damage = tower.kind === 4 ? this.Damage * 8 : this.Damage * 0.4;
                            for (const i of line) {
                                const e = this.Enemies[i];
                                if (tower.kind === 3) e.vulnerable = 2;
                                this.DamageEnemy(e, damage);
                                if (tower.kind === 4) damage *= 0.85;
                            }
                            tower.clock = tower.kind === 4 ? 1.2 : 0.1;
                        }
                        this.Shots.push({
                            x: tower.x + ux * this.Range,
                            y: tower.y + uy * this.Range,
                            fromX: tower.x,
                            fromY: tower.y,
                            life: 0.12,
                        });
                        continue;
                    }
                    if (tower.kind === 1) {
                        let best = targets[0],
                            density = -1;
                        for (const i of targets) {
                            const e = this.Enemies[i],
                                count = this.Cells[Math.floor(e.y) * W + Math.floor(e.x)].length;
                            if (count > density) {
                                density = count;
                                best = i;
                            }
                        }
                        const e = this.Enemies[best];
                        this.Mortars.push({x: e.x, y: e.y, delay: 0.6, damage: this.Damage * 6});
                        tower.clock = 1.8;
                        continue;
                    }
                    const e = this.Enemies[targets[0]];
                    this.DamageEnemy(e, this.Damage);
                    if (tower.kind === 2) {
                        const hit = new Set<number>([targets[0]]);
                        let previous = e;
                        for (let jump = 0; jump < 10; jump++) {
                            let next = -1,
                                nearest = 9;
                            for (const i of this.Query(previous.x, previous.y, 3)) {
                                const candidate = this.Enemies[i],
                                    d =
                                        (candidate.x - previous.x) ** 2 +
                                        (candidate.y - previous.y) ** 2;
                                if (!hit.has(i) && d < nearest) {
                                    next = i;
                                    nearest = d;
                                }
                            }
                            if (next < 0) break;
                            hit.add(next);
                            const target = this.Enemies[next];
                            this.DamageEnemy(target, this.Damage * 0.9 ** jump);
                            this.Shots.push({
                                x: target.x,
                                y: target.y,
                                fromX: previous.x,
                                fromY: previous.y,
                                life: 0.18,
                            });
                            previous = target;
                        }
                    }
                    this.Shots.push({x: e.x, y: e.y, fromX: tower.x, fromY: tower.y, life: 0.12});
                    tower.clock = tower.kind === 2 ? 0.5 : this.FireInterval;
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
