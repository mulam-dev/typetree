const id = "#core:json:null";
const type = ".json:null";
const name = Names("Null");

export default class extends TTNode {
    static id = id
    static type = type
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
        return this.data[0];
    }
}