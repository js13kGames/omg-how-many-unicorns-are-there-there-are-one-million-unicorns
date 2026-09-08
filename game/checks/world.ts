import {WorldImpl, create_entity, destroy_entity} from "../lib/world.js";

function check(value: boolean, message: string) {
    if (!value) throw new Error(message);
}

const world = new WorldImpl(2);
check(create_entity(world) === 0, "First slot");
check(create_entity(world) === 1, "Last valid slot");
let rejected = false;
try {
    create_entity(world);
} catch {
    rejected = true;
}
check(rejected && world.Signature.length === 2, "Capacity must hold in release builds");
world.Signature[0] = 1;
destroy_entity(world, 0);
check(world.Signature[0] === 0, "Removal clears the signature");
check(create_entity(world) === 0 && world.Signature.length === 2, "Reuse at capacity");
console.log("Entity capacity and reuse checks passed.");
