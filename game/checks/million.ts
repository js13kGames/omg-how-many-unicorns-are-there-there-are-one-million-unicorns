import {Crowd, CROWD_LIMIT, CROWD_RATE} from "../src/crowd.js";

function check(ok: boolean, message: string) {
    if (!ok) throw new Error(message);
}

const crowd = new Crowd();
check(crowd.Start() && !crowd.Start(), "Starts once");
crowd.Tick(1);
check(crowd.Count === CROWD_RATE, "Advances by scalar deployment rate");
crowd.Tick(CROWD_LIMIT / CROWD_RATE);
check(crowd.Count === CROWD_LIMIT, "Caps at one million");
check(Object.keys(crowd).length === 3, "Million crowd has constant CPU state");
crowd.Reset();
check(crowd.Count === 0 && crowd.Time === 0 && !crowd.Running, "Resets benchmark");
console.log("GPU million-crowd state check passed.");
