const id = "#core:data:atom";
const extend = ".data:base";
const provides = [".data:atom"];
const name = Names("Atom");

const Super = await TTNode.Class(extend);
export default class extends Super {
    static id = id
    static provides = provides
    static uses = [id, ...provides, ...Super.uses]
    static name = name

    init(node) {
        this.node = node;
    }
}