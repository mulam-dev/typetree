const id = "#core:_example_";
const extend = null;
const provides = ["._example_:_example_"];
const name = Names("_Example_");

const Super = await TTNode.Class(extend);
export default class extends Super {
    static id = id
    static provides = provides
    static uses = [id, ...provides, ...Super.uses]
    static name = name

    static rule = {
        // TODO
    }

    init(data) {
        // TODO
    }
}