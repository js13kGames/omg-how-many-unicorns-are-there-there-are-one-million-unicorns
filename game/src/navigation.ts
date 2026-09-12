export const MAP_WIDTH = 64;
export const MAP_HEIGHT = 36;
export const STEP = 1 / 60;

export const MAP_NAMES = [
    "Meadow Gate",
    "Narrow Valley",
    "Twin Roads",
    "Prism Canyon",
    "Last Fortress",
];
export function blocked(x: number, y: number, map = 0) {
    if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return true;
    for (const [wall, gapStart] of [
        [12, 27],
        [22, 2],
        [32, 27],
        [42, 2],
        [52, 15],
    ])
        if (x >= wall && x < wall + 2 && (y < gapStart || y >= gapStart + 7)) return true;
    return false;
}

export function flow_field(
    width: number,
    height: number,
    walls: Uint8Array,
    goal: number,
    goals: number[] = [goal],
) {
    if (walls.length !== width * height || goal < 0 || goal >= walls.length || walls[goal]) {
        throw new Error("Invalid navigation map or goal");
    }
    const distance = new Int32Array(walls.length).fill(-1);
    const queue = new Int32Array(walls.length);
    let head = 0,
        tail = 0;
    for (const target of goals) {
        if (!Number.isInteger(target) || target < 0 || target >= walls.length || walls[target])
            throw new Error("Invalid navigation goal");
        if (distance[target] === 0) continue;
        queue[tail++] = target;
        distance[target] = 0;
    }
    while (head < tail) {
        const cell = queue[head++];
        const x = cell % width,
            y = Math.floor(cell / width);
        for (const [dx, dy] of [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
        ]) {
            const nx = x + dx,
                ny = y + dy,
                next = ny * width + nx;
            if (
                nx >= 0 &&
                nx < width &&
                ny >= 0 &&
                ny < height &&
                !walls[next] &&
                distance[next] < 0
            ) {
                distance[next] = distance[cell] + 1;
                queue[tail++] = next;
            }
        }
    }
    return distance;
}

export function meadow_field(map = 0) {
    const walls = new Uint8Array(MAP_WIDTH * MAP_HEIGHT);
    for (let y = 0; y < MAP_HEIGHT; y++)
        for (let x = 0; x < MAP_WIDTH; x++) walls[y * MAP_WIDTH + x] = +blocked(x, y, map);
    return flow_field(
        MAP_WIDTH,
        MAP_HEIGHT,
        walls,
        18 * MAP_WIDTH + 57,
        [17, 18, 19].map((y) => y * MAP_WIDTH + 57),
    );
}

export function fixed_steps(remainder: number, delta: number, speed: number) {
    const time = remainder + Math.max(0, Math.min(delta, 0.1)) * speed;
    const count = Math.floor((time + 1e-10) / STEP);
    return {count, remainder: Math.max(0, time - count * STEP)};
}
