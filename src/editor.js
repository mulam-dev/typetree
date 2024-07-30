import { TTNode } from "./types.js";

export class Editor extends TTNode {
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
        this.inner = [];

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
        this.types = new Map();
        
        /* 
            # 规则存储
            存储插件所导入的所有覆写规则
        */
       this.rules = [];
    }

    focus() {
        this.melem.focus();
    }

    get $type() {
        return new Proxy(this, type_proxy);
    }

    get $require() {
        return new Proxy(this, require_proxy);
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
}

const type_proxy = {
    get: (ed, query) => (data) => new (ed.types.get(query))(ed, data),
};

const require_proxy = {
    get: (ed, query) => new Proxy(ed.provides.get(query) ?? [], plugins_proxyer),
};

const plugins_proxyer = {
    get: (plugins, method) => (...args) => plugins.map(p => p[method](...args)),
};