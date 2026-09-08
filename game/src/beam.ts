import {blocked} from "./navigation.js";

export function beam_segments(
    x: number,
    y: number,
    dx: number,
    dy: number,
    range: number,
    map: number,
    reflect = map === 3,
) {
    const length = Math.hypot(dx, dy);
    if (!Number.isFinite(x + y + length + range) || length === 0 || range <= 0) return [];
    dx /= length;
    dy /= length;
    const segments: {ax: number; ay: number; bx: number; by: number; power: number}[] = [];
    let ax = x,
        ay = y,
        power = 1;
    // ponytail: fixed 0.1-unit steps suit the one-unit wall grid; use grid traversal for sub-cell geometry.
    for (let bounce = 0; bounce < 3 && range > 0; bounce++) {
        let hit = false;
        while (range > 0) {
            const step = Math.min(0.1, range),
                nx = x + dx * step,
                ny = y + dy * step;
            if (blocked(Math.floor(nx), Math.floor(ny), map)) {
                segments.push({ax, ay, bx: x, by: y, power});
                if (!reflect) return segments;
                const hitX = blocked(Math.floor(nx), Math.floor(y), map);
                const hitY = blocked(Math.floor(x), Math.floor(ny), map);
                if (hitX || !hitY) dx = -dx;
                if (hitY || !hitX) dy = -dy;
                power *= 0.8;
                ax = x;
                ay = y;
                hit = true;
                break;
            }
            x = nx;
            y = ny;
            range -= step;
        }
        if (!hit) {
            segments.push({ax, ay, bx: x, by: y, power});
            break;
        }
    }
    return segments;
}
