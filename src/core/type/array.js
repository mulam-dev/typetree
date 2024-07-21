const id = "#core:array";
const type = ".json:array";
const name = "Array";

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
                    .class("core-array-flex")
                    .$inner(
                        this.data.bflat().bmap(node => node.elem)
                    )(),
            ]).name(name).color(200).style_on("sbracket-before");
    }

    to_json() {
        Object.fromEntries(this.data.map(([k, v]) => [k.to_json(), v.to_json()]));
    }
}