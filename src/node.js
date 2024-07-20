export class TypeTreeNode {
    constructor(editor, data) {
        this['#'] = this.constructor.id;
        this.root = editor;
        this.init?.(data);
    }

    get require() {
        return this.root.require;
    }

    set struct(tree) {
        this.elem = tree.elem;
    }
}
