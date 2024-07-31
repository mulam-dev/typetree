export class TTNode {
    static modifiers = {}
    static actions = {}
    static handles = {}

    static get_attr(node, parts) {
        let parent = this[parts[0]];
        for (const part of parts.slice(1)) {
            if (parent instanceof Object) {
                if (parent.call) parent = parent.call(node);
                parent = parent[part];
            } else {
                parent = null;
                break;
            }
        }
        return parent;
    }

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

    attr(path, def = null) {
        const parts = path.split('.');
        return this.get_attr_self(parts) ??
               this.root.get_attr_of(this, parts) ??
               this.constructor.get_attr(this, parts) ??
               def;
    }

    attrs(path, def = []) {
        const parts = path.split('.');
        const res = [];
        const self_res = this.get_attr_self(parts);
        if (self_res !== null && self_res !== undefined) res.push(self_res);
        res.push(...this.root.get_attrs_of(this, parts));
        const class_res = this.constructor.get_attr(this, parts);
        if (class_res !== null && class_res !== undefined) res.push(class_res);
        if (!res.length) res.push(...def);
        return res;
    }

    attrs_merged(path, def) {
        return this.attrs(path, def).reduce((p, c) => Object.assign(p, c.call ? c.call(this) : c), {});
    }

    get_attr_self(parts) {
        let parent = this[parts[0]];
        for (const part of parts.slice(1)) {
            if (parent instanceof Object) {
                if (parent.call) parent = parent.call(this);
                parent = parent[part];
            } else {
                parent = null;
                break;
            }
        }
        return parent;
    }

    request_pack(pack) {
        if (!pack.closed.val) {
            for (const [type, ...data] of pack.msgs) {
                for (const handle of this.attrs("handles." + type)) {
                    if (pack.closed.val) return pack;
                    const res = handle.call(this, pack, ...data);
                    if (res !== null && res !== undefined) pack.push_result(res);
                }
            }
        }
        return pack;
    }

    request_msgs(...msgs) {
        return this.request_pack(TTPack.create(...msgs));
    }

    request(...msg) {
        return this.request_msgs(msg);
    }
}

export class TTRule {
    self = null;
    parent = null;
    overrides = {};

    match(node) {
        const self_class = node.constructor;
        const parent_class = node.parent?.constructor;
        return ((
            !this.self ||
            self_class.id === this.self ||
            self_class.type === this.self
        ) && (
            !this.parent || (
                parent_class && (
                    parent_class.id === this.parent ||
                    parent_class.type === this.parent
                )
            )
        ));
    }

    get_attr(node, parts) {
        let parent = this.overrides[parts[0]];
        for (const part of parts.slice(1)) {
            if (parent instanceof Object) {
                if (parent.call) parent = parent.call(node);
                parent = parent[part];
            } else {
                parent = null;
                break;
            }
        }
        return parent;
    }
}

export class TTPack {
    static create(...msgs) {
        return new this(null, msgs);
    }
    constructor(inner, msgs) {
        this.inner = inner;
        this.closed = [false];
        this.data_msgs = msgs;
        this.data_results = [];
    }
    close() {
        this.closed.val = true;
    }
    repack(...msgs) {
        return new this.constructor(this, msgs);
    }
    push_result(res) {
        this.data_results.push(res);
    }
    * get_msgs() {
        yield* this.data_msgs.values();
        if (this.inner) yield* this.inner.get_msgs();
    }
    * get_results() {
        yield* this.data_results.values();
        if (this.inner) yield* this.inner.get_results();
    }
    get msgs() {
        return this.get_msgs();
    }
    get results() {
        return this.get_results();
    }
    get result() {
        return this.get_results().next().value;
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