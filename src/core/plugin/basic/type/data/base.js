const id = "#core:data:base";
const extend = null;
const provides = [".data:base"];
const name = Names("Base");

const Super = await TTNode.Class(extend);
export default class extends Super {
    static id = id
    static provides = provides
    static uses = [id, ...provides, ...Super.uses]
    static name = name

    static rule = {
        "handles.core:data": {
            "extract"(p, pattern) {
                return this.extract(pattern);
            },
        },
    }
}