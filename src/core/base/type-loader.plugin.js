const id = "#core:type-loader"
const provides = [".core:type-loader"]
const requires = {
    base: ".core:base",
    rule: ".core:rule-loader",
}

/* 
    # 提供更便捷的类型导入方式
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
        const {import_type, import_rule, for_plugins_prop} = this.require.base;
        const {parse_rule} = this.require.rule;

        await for_plugins_prop(provides.val, (plugin, paths) => Promise.all(paths.map(
            async path => {
                const Node = (await import(plugin.constructor.dir + path + ".js")).default;
                if (Object.hasOwn(Node, "rule")) {
                    import_rule(parse_rule(Node.id, Node.rule));
                }
                import_type(Node);
            },
        )));
    }
}