const id = "#core:pattern:atom";
const extend = ".pattern:base";
const provides = [".pattern:atom"];
const name = Names("Atom");

const Super = await TTNode.Class(extend);
export default class extends Super {
    static id = id
    static provides = provides
    static uses = [id, ...provides, ...Super.uses]
    static name = name

    init(opts) {
        this.opts = opts;
    }

    match({node}, results) {
        const {in: $in, not: $not} = this.opts;
        if (results.length === 0 && node.in($in) && (!$not || !node.in($not))) {
            results.push(node.clone());
            return true;
        } else {
            return false;
        }
    }
}