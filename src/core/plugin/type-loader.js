const id = "core:type-loader";
const provides = ["core:type-loader"];
const requires = ["core:base"];

/* 
    # 提供更便捷的类型导入方式
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
        const {import_type, for_plugins_prop} = this.require["core:base"];

        (await for_plugins_prop("$core_type_loader_data", (plugin, paths) => Promise.all(
            paths.map(
                async path => (await import(path + ".js")).default,
            ),
        ))).forEach(types => import_type(...types));
    }
}