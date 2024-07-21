const id = "#core:null";
const type = ".json:null";
const name = "Null";

export default class extends TypeTreeNode {
    static id = id
    static type = type
    static name = name

    init() {
        const {
            "#core:frame": frame,
        } = this.require;

        this.struct =
            frame(["null"])
                .name(name)
                .color(0, 0, 0.8)
                .style_on("inline", "code");
    }

    to_json() {
        return this.data[0];
    }
}