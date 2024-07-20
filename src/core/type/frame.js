import { TypeTreeNode } from "../../node.js";

const id = "#core:frame";
const type = null;
const name = "Frame";

export default class extends TypeTreeNode {
    static id = id
    static type = type
    static name = name

    init(data) {
        this.data = data ?? [];

        this.data_name = [null];

        this.elem =
            ME.div.$inner(
                this.data.bmap(node =>
                    node instanceof TypeTreeNode ? node.elem : node
                )
            )();
    }

    name(value) {
        if (value !== undefined) {
            this.data_name.val = value;
            return this;
        } else {
            return this.data_name.val;
        }
    }
}