import {Battle, configure_test_level, TEST_SPAWN_RATE, TEST_UNICORNS} from "../src/battle.js";

function check(ok: boolean, message: string) {
    if (!ok) throw new Error(message);
}

const battle = new Battle();
configure_test_level(battle);
check(battle.WaveCount === 1, "One wave only");
check(battle.WaveSize === TEST_UNICORNS && TEST_UNICORNS === 1_000_000, "Million-unit budget");
check(battle.WaveRate === TEST_SPAWN_RATE, "Fixed test spawn rate");
check(battle.Integrity === TEST_UNICORNS, "Fortress survives the scale test");
check(battle.StartWave() && battle.Limit === TEST_UNICORNS, "Starts the million-unit wave");
check(!battle.StartWave(), "Wave starts once");
battle.Tick();
check(battle.Spawned > 0 && battle.Spawned < TEST_UNICORNS, "Spawns real enemies progressively");
check(battle.Enemies.length === battle.Spawned, "Every deployed unicorn is simulated");
console.log("One-level million-unicorn configuration passed.");
