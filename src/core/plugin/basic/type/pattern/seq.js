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

    match(data, results) {
        if (data.is(".pattern:seq")) {
            const res = [];
            let matched = true;
            const {inner: seq} = data;
            let cursor = 0;
            const repeat = this.opts.repeat ?? Infinity;
            outer: for (let i = 0; i < repeat; i++) {
                for (const pattern of this.inner) {
                    if (cursor < seq.length) {
                        if (pattern.match(seq[cursor], res)) {
                            cursor += 1;
                        } else {
                            matched = false;
                            break outer;
                        }
                    } else {
                        break;
                    }
                }
            }
            if (matched) {
                results.push(res);
                return true;
            }
        }
        return false;
    }
}