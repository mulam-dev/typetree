const id = "#core:rule-loader"
const provides = [".core:rule-loader"]
const requires = {
    base: ".core:base",
}

/* 
    # 提供更便捷的规则导入方式
*/

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_essential(plugins, requires);
    }

    async init() {
        const {import_rule, for_plugins_prop} = this.require.base;

        import_rule(...(await for_plugins_prop(provides.val, (plugin, paths) => Promise.all(
            paths.map(async path => {
                const ruleset = (await import(plugin.constructor.dir + path + ".js")).default;
                if (ruleset instanceof Function) {
                    return this.parse_ruleset(ruleset(plugin));
                } else {
                    return this.parse_ruleset(ruleset);
                }
            }),
        ))).flat(2));
    }

    parse_rule(query, overrides) {
        const parsed_overrides = parse_overrides(overrides);
        const or_parts = query.split('|').map(p => p.trim());
        const rules = or_parts.map(or_part => {
            const rule = new TTRule();
            const parts = or_part.split('>').map(p => p.trim());
            if (parts.length === 2) {
                if (parts[1] !== '*') rule.self = parts[1];
                if (parts[0] !== '*') rule.parent = parts[0];
            } else {
                if (parts[0] !== '*') rule.self = parts[0];
            }
            rule.overrides = parsed_overrides;
            return rule;
        });
        return rules;
    }

    parse_ruleset(rules) {
        return Object.entries(rules).flatMap(([query, overrides]) => this.parse_rule(query, overrides));
    }
}

const parse_overrides = (obj, parts = [], parent = {}) => {
    if (parts.length) {
        parent[parts[0]] = parse_overrides(obj, parts.slice(1), parent[parts[0]]);
        return parent;
    } else {
        if (obj instanceof Object && obj.constructor === Object) {
            for (const key in obj) {
                const or_parts = key.split('|').map(p => p.trim());
                for (const or_part of or_parts) {
                    const parts = or_part.split('.').map(p => p.trim());
                    parse_overrides(obj[key], parts, parent);
                }
            }
            return parent;
        } else {
            return obj;
        }
    }
};