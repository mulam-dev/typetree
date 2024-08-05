const id = "#core:json:null";
const extend = null;
const provides = [".json:null"];
const name = Names("Null");

const Super = await TTNode.Class(extend);
export default class extends Super {
    static id = id
    static provides = provides
    static uses = [id, ...provides, ...Super.uses]
    static name = name

    init() {
        const {
            "#core:frame": frame,
        } = this.$type;

        this.struct =
            frame(["null"])
                .into(this)
                .name(name)
                .color(0, 0, 0.8)
                .style_on("inline", "code");
    }

    to_json() {
        return null;
    }
}