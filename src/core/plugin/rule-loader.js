const id = "core:rule-loader";
const provides = ["core:rule-loader"];
const requires = [
    "core:base",
];

/* 
    # 提供更便捷的规则导入方式
*/

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_must(plugins, ...requires);
    }

    init() {
        return () => this.load();
    }

    async load() {
        const {import_rule, for_plugins_prop} = this.require["core:base"];

        (await for_plugins_prop("$core_rule_loader_data", (plugin, ruleset) =>
            Object.entries(ruleset).map(([query, overrides]) => {
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
        )).forEach(rules => import_rule(...rules));
    }
}

const parse_overrides = (obj, parts = []) => {
    if (parts.length) {
        return {
            [parts[0]]: parse_overrides(obj, parts.slice(1)),
        };
    } else {
        if (obj instanceof Object && obj.constructor === Object) {
            const res = {};
            for (const key in obj) {
                const parts = key.split('.');
                res[parts[0]] = parse_overrides(obj[key], parts.slice(1));
            }
            return res;
        } else {
            return obj;
        }
    }
};