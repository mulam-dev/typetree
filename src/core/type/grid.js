const id = "#core:grid";
const type = null;
const name = "Grid";

export default class extends TypeTreeNode {
    static id = id
    static type = type
    static name = name

    init(data) {
        this.data = data ?? [];

        this.elem =
            ME.div
                .class("core-grid")
                .$style({"--columns": this.data.breduce((s, r) => Math.max(s, r.length), 0)})
                .$inner(
                    this.data.bflat().bmap(node => node.elem)
                )();
    }
}