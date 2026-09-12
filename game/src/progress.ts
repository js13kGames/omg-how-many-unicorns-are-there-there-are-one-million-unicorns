export const UPGRADE_KINDS = ["damage", "rate", "range", "missile", "economy"] as const;
export type UpgradeKind = (typeof UPGRADE_KINDS)[number];

export interface Progress {
    version: 2;
    stars: number;
    runs: number;
    wins: number;
    bestKills: number;
    damage: number;
    rate: number;
    range: number;
    missile: number;
    economy: number;
}

export function new_progress(): Progress {
    return {
        version: 2,
        stars: 0,
        runs: 0,
        wins: 0,
        bestKills: 0,
        damage: 0,
        rate: 0,
        range: 0,
        missile: 0,
        economy: 0,
    };
}

export function parse_progress(raw: string | null): Progress {
    if (raw === null) return new_progress();
    const value = JSON.parse(raw);
    if (value?.version === 1) {
        const migrated = new_progress();
        migrated.stars =
            Number.isSafeInteger(value.sparkles) && value.sparkles >= 0 ? value.sparkles : 0;
        migrated.runs = Number.isSafeInteger(value.runs) && value.runs >= 0 ? value.runs : 0;
        migrated.damage = Math.min(20, Number.isSafeInteger(value.damage) ? value.damage : 0);
        migrated.rate = Math.min(20, Number.isSafeInteger(value.rate) ? value.rate : 0);
        migrated.range = Math.min(20, Number.isSafeInteger(value.range) ? value.range : 0);
        return migrated;
    }
    if (!value || value.version !== 2)
        throw new Error("Save version is not supported. The saved data was not changed.");
    for (const key of ["stars", "runs", "wins", "bestKills", ...UPGRADE_KINDS])
        if (!Number.isSafeInteger(value[key]) || value[key] < 0)
            throw new Error("Save data is not valid. The saved data was not changed.");
    if (UPGRADE_KINDS.some((kind) => value[kind] > 20) || value.bestKills > 1_000_000)
        throw new Error("Save values are outside the supported range.");
    return value;
}

export function tower_interval(level: number) {
    return 2 * 0.98 ** level;
}

export function upgrade_cost(level: number) {
    return 25 * 2 ** level;
}

export function purchase(progress: Progress, kind: UpgradeKind) {
    const cost = upgrade_cost(progress[kind]);
    if (progress[kind] >= 20 || progress.stars < cost) return false;
    progress.stars -= cost;
    progress[kind]++;
    return true;
}

export function run_reward(kills: number, won: boolean) {
    return 20 + Math.floor(kills / 5_000) + (won ? 100 : 0);
}
