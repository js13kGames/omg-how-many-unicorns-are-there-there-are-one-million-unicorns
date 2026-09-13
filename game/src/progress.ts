export const UPGRADE_KINDS = ["damage", "rate", "range", "missile", "economy", "arsenal"] as const;
export type UpgradeKind = (typeof UPGRADE_KINDS)[number];

export interface Progress {
    version: 3;
    stars: number;
    runs: number;
    wins: number;
    bestKills: number;
    damage: number;
    rate: number;
    range: number;
    missile: number;
    economy: number;
    arsenal: number;
}

export function new_progress(): Progress {
    return {
        version: 3,
        stars: 0,
        runs: 0,
        wins: 0,
        bestKills: 0,
        damage: 0,
        rate: 0,
        range: 0,
        missile: 0,
        economy: 0,
        arsenal: 0,
    };
}

export function parse_progress(raw: string | null): Progress {
    if (raw === null) return new_progress();
    const value = JSON.parse(raw);
    if (value?.version === 1 || value?.version === 2) {
        const migrated: Progress = new_progress();
        const source = value.version === 1 ? value.sparkles : value.stars;
        migrated.stars = Number.isSafeInteger(source) && source >= 0 ? source : 0;
        for (const key of ["runs", "wins", "bestKills"] as const) {
            const number = value[key];
            if (Number.isSafeInteger(number) && number >= 0)
                migrated[key] = key === "bestKills" ? Math.min(number, 1_000_000) : number;
        }
        for (const key of ["damage", "rate", "range", "missile", "economy"] as const) {
            const number = value[key];
            if (Number.isSafeInteger(number) && number >= 0) migrated[key] = Math.min(number, 20);
        }
        return migrated;
    }
    if (!value || value.version !== 3)
        throw new Error("Save version is not supported. The saved data was not changed.");
    for (const key of ["stars", "runs", "wins", "bestKills", ...UPGRADE_KINDS])
        if (!Number.isSafeInteger(value[key]) || value[key] < 0)
            throw new Error("Save data is not valid. The saved data was not changed.");
    if (
        UPGRADE_KINDS.some((kind) => value[kind] > (kind === "arsenal" ? 3 : 20)) ||
        value.bestKills > 1_000_000
    )
        throw new Error("Save values are outside the supported range.");
    return value;
}

export function missile_cooldown(level: number) {
    return 40 * 0.9 ** level;
}

export function missile_damage(level: number) {
    return 20_000 * 1.4 ** level;
}

export function tower_interval(level: number) {
    return 2 * 0.9 ** level;
}

export function upgrade_cost(level: number, kind: UpgradeKind = "damage") {
    return (kind === "arsenal" ? 100 : 25) * 2 ** level;
}

export function purchase(progress: Progress, kind: UpgradeKind) {
    const cost = upgrade_cost(progress[kind], kind);
    if (progress[kind] >= (kind === "arsenal" ? 3 : 20) || progress.stars < cost) return false;
    progress.stars -= cost;
    progress[kind]++;
    return true;
}

export function run_reward(kills: number, won: boolean) {
    return 20 + Math.floor(kills / 5_000) + (won ? 100 : 0);
}
