const id = "#core:pattern:base";
const extend = null;
const provides = [".pattern:base"];
const name = Names("Base");

const Super = await TTNode.Class(extend);
export default class extends Super {
    static id = id
    static provides = provides
    static uses = [id, ...provides, ...Super.uses]
    static name = name

    static rule = {
        "handles.core:data": {
            "match"(p, data) {
                const results = [];
                this.match(data, results);
                return results;
            },
        },
    }
}