export default {
    ".core:editor": {
        "modifiers": {
            "modify": class extends TTModer.Map {
                modify(node, offset, delete_count, inserts) {
                    super.modify(node);
                    const deletes = node.inner.modify(offset, delete_count, inserts);
                    this.data_src = [offset, inserts.length, deletes];
                }
            },
            "move": class extends TTModer.Map {
                modify(node, offset, count, delta) {
                    super.modify(node);
                    this.data_src = [offset + delta, count, -delta];
                    node.inner.move(offset, count, delta);
                }
            },
        },
    },
}