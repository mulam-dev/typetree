const id = "#core:object";
const type = ".json:object";
const name = "Object";

export default class extends TypeTreeNode {
    static id = id
    static type = type
    static name = name

    init(data) {
        const {
            "#core:frame": frame,
        } = this.require;

        this.data = data ?? [];

        this.struct =
            frame([
                ME.div
                    .class("core-object-grid")
                    .$inner(
                        this.data.bflat().bmap(node => node.elem)
                    )(),
            ]).name(name).color(42).style_on("hint-before");
    }

    to_json() {
        Object.fromEntries(this.data.map(([k, v]) => [k.to_json(), v.to_json()]));
    }
}