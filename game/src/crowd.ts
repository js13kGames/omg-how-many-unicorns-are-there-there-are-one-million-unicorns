export const CROWD_LIMIT = 1_000_000;
export const CROWD_RATE = 50_000;

export class Crowd {
    Count = 0;
    Time = 0;
    Running = false;

    Start() {
        if (this.Running || this.Count === CROWD_LIMIT) return false;
        this.Running = true;
        return true;
    }

    Reset() {
        this.Count = 0;
        this.Time = 0;
        this.Running = false;
    }

    Tick(delta: number) {
        if (!this.Running || delta <= 0) return;
        this.Time += delta;
        this.Count = Math.min(CROWD_LIMIT, this.Count + delta * CROWD_RATE);
    }
}
