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
        this.tree = tree;
    }
}

export class TTModer {
    static Sym = class extends this {
        inverse() {
            return new this.constructor(...this.data_args);
        }
    }
    static Map = class extends this {
        inverse() {
            return new this.constructor(...this.data_src);
        }
    }

    modify(node) {
        if (this.data_modified) {
            throw new Error("TTModer: Reusing old modifer");
        } else {
            this.data_modified = true;
        }
    }

    inverse() {
        throw new Error("TTModer: Inverse method not defined");
    }
}

export class TTAction {
    static args = []
}

export class TTName {
    constructor(raw, trans) {
        this.raw = raw;
        this.trans = trans;
    }

    get(locale) {
        return this.trans[locale] ?? this.raw;
    }
}

export const Names = new Proxy(() => {}, {
    apply: (_0, _1, args) => {
        const raw = args[0];
        const trans = args[1] ?? {};
        return new TTName(raw, trans);
    },
})

export class TTType {}

export const Types = new Proxy(() => {}, {
    apply: (_0, _1, args) => {
        //
    },
})