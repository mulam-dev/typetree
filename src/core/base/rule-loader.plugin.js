const id = "core:rule-loader"
const provides = ["core:rule-loader"]
const requires = {
    base: "core:base",
}

/* 
    # 提供更便捷的规则导入方式
*/

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_must(plugins, requires);
    }

    init() {
        return () => this.load();
    }

    async load() {
        const {import_rule, for_plugins_prop} = this.require.base;

        import_rule(...(await for_plugins_prop("$core_rule_loader", (plugin, paths) => Promise.all(
            paths.map(async path => {
                return Object.entries((await import(plugin.constructor.dir + path + ".js")).default)
                    .map(([query, overrides]) => {
                        const rule = new TTRule();
                        const parts = query.split('>').map(p => p.trim());
                        if (parts.length === 2) {
                            if (parts[1] !== '*') rule.self = parts[1];
                            if (parts[0] !== '*') rule.parent = parts[0];
                        } else {
                            if (parts[0] !== '*') rule.self = parts[0];
                        }
                        rule.overrides = parse_overrides(overrides);
                        return rule;
                    })
            })
        ))).flat(2));
    }
}

const parse_overrides = (obj, parts = [], parent = {}) => {
    if (parts.length) {
        parent[parts[0]] = parse_overrides(obj, parts.slice(1), parent[parts[0]]);
        return parent;
    } else {
        if (obj instanceof Object && obj.constructor === Object) {
            for (const key in obj) {
                const parts = key.split('.');
                parse_overrides(obj[key], parts, parent);
            }
            return parent;
        } else {
            return obj;
        }
    }
};