const id = "#core:pattern:seq";
const extend = ".pattern:base";
const provides = [".pattern:seq"];
const name = Names("Sequence");

const Super = await TTNode.Class(extend);
export default class extends Super {
    static id = id
    static provides = provides
    static uses = [id, ...provides, ...Super.uses]
    static name = name

    init(opts, ...inner) {
        this.opts = opts;
        this.inner = inner;
    }

    _match(data, results) {
        const {in: $in, not: $not} = this.opts;
        if (results.length === 0 && node.in($in) && (!$not || !node.in($not))) {
            results.push(node.clone());
        }
    }

    _flat(data, results) {
        for (const pattern of this.inner) {
            if (pattern.match(data, results)) return true;
        }
        return false;
    }
}