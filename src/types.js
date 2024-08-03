export class TTNode {
    static id = null
    static provides = []
    static uses = []
    static name = null

    static Class(query) {
        return query ? Editor.$Type[query] : TTNode;
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

    is(query) {
        return this.constructor.id === query || this.constructor.uses.includes(query);
    }

    attr(path, def = null) {
        const parts = path.split('.');
        return this.root.get_attr_of(this, parts) ?? def;
    }

    attrs(path, def = []) {
        const parts = path.split('.');
        const res = [];
        res.push(...this.root.get_attrs_of(this, parts));
        if (!res.length) res.push(...def);
        return res;
    }

    attrs_merged(path, def) {
        return this.attrs(path, def).reduce((p, c) => Object.assign(p, c.call ? c.call(this) : c), {});
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

    get mod() {
        return new Proxy(this, mod_proxy);
    }

    get act() {
        return new Proxy(this, act_proxy);
    }

    get path() {
        return this.parent ? this.parent.path.concat([this.parent.index(this)]) : [];
    }

    ref(path) {
        return path.length ? this.get(path[0]).ref(path.slice(1)) : this;
    }
}

const mod_proxy = {
    get: (node, path) => (...args) => {
        const Moder = node.attr(`modifiers.${path}`);
        if (Moder) {
            const moder = new Moder(...args);
            moder.id = path;
            moder.call(node);
            node.request("core:mod", moder);
            return node;
        } else throw new Error(`TTNode: Modifier "${path}" not found`);
    },
};

const act_proxy = {
    get: (node, path) => async opts => {
        const Action = node.attr(path);
        if (Action) {
            return await Action.call(node, opts);
        } else throw new Error(`TTNode: Action "${path}" not found`);
    },
};

export class TTRule {
    self = null;
    parent = null;
    overrides = {};

    match(node) {
        return ((
            !this.self ||
            node.is(this.self)
        ) && (
            !this.parent ||
            node.parent?.is(this.parent)
        ));
    }

    get_attr(node, parts) {
        let parent = this.overrides[parts[0]];
        for (const part of parts.slice(1)) {
            if (parent instanceof Object) {
                if (parent instanceof Function) parent = parent.call(node);
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

    constructor(...args) {
        this.data_args = args;
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

    call(node) {
        this.modify(node, ...this.data_args);
    }
}

export class TTAction {
    static args = []
}

export class TTName {
    static trans = {};

    constructor(raw) {
        this.raw = raw;
    }

    get(locale = navigator.language) {
        return this.constructor.trans[this.raw]?.[locale] ?? this.raw;
    }
}

export const Names = new Proxy(() => {}, {
    apply: (_0, _1, args) => {
        const raw = args[0];
        const trans = args[1];
        if (raw in TTName.trans && trans) {
            TTName.trans[raw].merge(trans)
        } else if (trans) {
            TTName.trans[raw] = trans;
        }
        return new TTName(raw);
    },
});

export class TTType {}

export const Types = new Proxy(() => {}, {
    apply: (_0, _1, args) => {
        //
    },
});

export class TTPlugin {
    static req_essential(plugins, ...traits_set) {
        const res = [];
        for (const traits of traits_set) {
            if (traits instanceof Array) {
                for (const trait of traits) {
                    const results = plugins.filter(p => get_plugin_class(p).provides.includes(trait));
                    if (results.length) {
                        res.push(...results);
                    } else {
                        throw new Error(`Unsatisfied requirements: trait "${trait}" not found`);
                    }
                }
            } else {
                for (const key in traits) {
                    const trait = traits[key];
                    const results = plugins.filter(p => get_plugin_class(p).provides.includes(trait));
                    if (results.length) {
                        res.push(...results);
                        res[key] = results.val;
                    } else {
                        throw new Error(`Unsatisfied requirements: trait "${trait}" not found`);
                    }
                }
            }
        }
        return res;
    }
    static req_optional(plugins, ...traits_set) {
        const res = [];
        for (const traits of traits_set) {
            if (traits instanceof Array) {
                for (const trait of traits) {
                    const results = plugins.filter(p => get_plugin_class(p).provides.includes(trait));
                    res.push(...results);
                }
            } else {
                for (const key in traits) {
                    const trait = traits[key];
                    const results = plugins.filter(p => get_plugin_class(p).provides.includes(trait));
                    res.push(...results);
                    if (results.length) {
                        res[key] = results.val;
                    }
                }
            }
        }
        return res;
    }

    constructor(editor, plugins) {
        this['#'] = this.constructor.id;
        this.root = editor;
        this.require = new Proxy(this.constructor.requires(plugins), _pl_require_proxy);
    }
}

const get_plugin_class = p => p instanceof TTPlugin ? p.constructor : p;

const _pl_require_proxy = {
    get: (requires, key) => new Proxy(requires[key], _pl_plugin_proxy),
};

const _pl_plugin_proxy = {
    get: (plugin, prop) => {
        const res = Reflect.get(plugin, prop);
        return res.bind?.(plugin) ?? res;
    },
};

export class TTEditor extends TTNode {
    constructor() {
        super();
        this.init();
    }

    init() {
        /* 
            # 根视图元素
            将由 layout 插件向里面填充内容
        */
        this.melem = ME.div.class("tt-editor").tab_index(0)();
        
        /* 
            # 内部节点
            存储当前在编辑的所有顶级节点，一般是文件节点
        */
        this.inner = [].guard(null, node => node.into(this), node => node.outof());

        /* 
            # 插件
            为编辑器提供热插拔的、独立于Tree之外的特性或功能
        */
        this.plugins = [].guard(null, p => {
            for (const key of p.constructor.provides) {
                const sets = this.provides.get(key);
                if (sets) {
                    sets.push(p);
                } else {
                    this.provides.set(key, [p]);
                }
            }
        });

        /*
            # 特性
            由插件提供，用于兼容性依赖处理
        */
        this.provides = new Map();

        /* 
            # 节点类型存储
            存储编辑器所导入的所有类型节点的类
        */
        this.types = {};
        
        /* 
            # 规则存储
            存储插件所导入的所有覆写规则
        */
       this.rules = [];

       this.root = this;
    }

    focus() {
        this.melem.focus();
    }

    focused() {
        return this.melem.focused();
    }

    get $Type() {
        return new Proxy(this, _ed_class_proxy);
    }

    get $type() {
        return new Proxy(this, _ed_type_proxy);
    }

    get $require() {
        return new Proxy(this, _ed_require_proxy);
    }

    get_attr_of(node, parts) {
        const rules = this.rules.filter(r => r.match(node));
        for (let i = rules.length - 1; i >= 0; i--) {
            const res = rules[i].get_attr(node, parts);
            if (res !== null && res !== undefined) return res;
        }
        return null;
    }

    get_attrs_of(node, parts) {
        const rules = this.rules.filter(r => r.match(node));
        const res = [];
        for (let i = rules.length - 1; i >= 0; i--) {
            const rule_res = rules[i].get_attr(node, parts);
            if (rule_res !== null && rule_res !== undefined) res.push(rule_res);
        }
        return res;
    }

    set_tree(tree) {
        this.inner.val = tree;
        return this;
    }

    index(node) {
        return this.inner.indexOf(node);
    }

    get(index) {
        return this.inner[index];
    }
}

const _ed_class_proxy = {
    get: (ed, query) => ed.types[query] ?? new Promise(res => {
        const s = Symbol("class proxy");
        ed.types.guard(s, (Type, key) => {
            if (key === query) {
                ed.types.unguard(s);
                res(Type);
            }
        });
    }),
};

const _ed_type_proxy = {
    get: (ed, query) => (data) => new ed.$Type[query](ed, data),
};

const _ed_require_proxy = {
    get: (ed, query) => new Proxy(ed.provides.get(query) ?? [], _ed_plugins_proxy),
};

const _ed_plugins_proxy = {
    get: (plugins, method) => (...args) => plugins.map(p => p[method](...args)),
};