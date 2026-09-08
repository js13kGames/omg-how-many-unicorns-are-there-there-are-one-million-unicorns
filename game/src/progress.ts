export interface Progress {
    version: 1;
    sparkles: number;
    damage: number;
    rate: number;
    runs: number;
    best: number;
}
export function new_progress(): Progress {
    return {version: 1, sparkles: 0, damage: 0, rate: 0, runs: 0, best: 0};
}
export function parse_progress(raw: string | null): Progress {
    if (raw === null) return new_progress();
    const value = JSON.parse(raw);
    if (!value || value.version !== 1)
        throw new Error("Save version is not supported. The saved data was not changed.");
    for (const key of ["sparkles", "damage", "rate", "runs", "best"])
        if (!Number.isSafeInteger(value[key]) || value[key] < 0)
            throw new Error("Save data is not valid. The saved data was not changed.");
    if (value.damage > 50 || value.rate > 50 || value.best > 8)
        throw new Error("Save values are outside the supported range.");
    return value;
}
export function upgrade_cost(level: number) {
    return Math.ceil(10 * 1.35 ** level);
}
export function purchase(progress: Progress, kind: "damage" | "rate") {
    const cost = upgrade_cost(progress[kind]);
    if (progress[kind] >= 50 || progress.sparkles < cost) return false;
    progress.sparkles -= cost;
    progress[kind]++;
    return true;
}
export function run_reward(kills: number, waves: number, won: boolean) {
    return 10 + Math.floor(kills / 20) + waves * 10 + (won ? 100 : 0);
}
