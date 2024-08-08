const id = "#core:data:seq";
const extend = ".data:base";
const provides = [".data:seq"];
const name = Names("Sequence");

const Super = await TTNode.Class(extend);
export default class extends Super {
    static id = id
    static provides = provides
    static uses = [id, ...provides, ...Super.uses]
    static name = name

    init(inner) {
        this.inner = inner;
    }
}