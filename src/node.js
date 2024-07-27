export class TTNode {
    static modifiers = {}
    static actions = {}
    static handles = {}

    constructor(editor, data) {
        this['#'] = this.constructor.id;
        this.root = editor;
        this.parent = null;
        this.init?.(data);
    }

    get $type() {
        return this.root.$type;
    }

    get $require() {
        return this.root.$require;
    }

    set struct(tree) {
        this.melem = tree.melem;
        this.tree = tree;
    }

    into(parent) {
        this.outof();
        this.parent = parent;
        return this;
    }

    outof() {
        this.parent = null;
        return this;
    }

    request(pack) {
        if (!pack.closed.val) {
            const handles = this.constructor.handles;
            for (const [type, ...data] of pack.get_msgs()) {
                const handle = handles[type];
                if (handle) {
                    if (pack.closed.val) break;
                    handle.call(this, pack, ...data);
                }
            }
        }
        return pack;
    }
    request_msgs(...msgs) {
        return this.request(TTPack.create(...msgs));
    }
    request_parent(pack) {
        return this.parent?.request(pack) ?? pack;
    }
    request_parent_msgs(...msgs) {
        return this.request_parent(TTPack.create(...msgs));
    }
}

export class TTPack {
    static create(...msgs) {
        return new this(null, msgs);
    }
    constructor(inner, msgs) {
        this.inner = inner;
        this.closed = [false];
        this.msgs = msgs;
    }
    close() {
        this.closed.val = true;
    }
    repack(...msgs) {
        return new this.constructor(this, msgs);
    }
    * get_msgs() {
        yield* this.msgs.values();
        if (this.inner) yield* this.inner.get_msgs();
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

    get(locale = navigator.language) {
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