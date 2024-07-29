const id = "core:view";
const provides = ["view"];
const requires = ["base", "init-manager"];

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_must(plugins, ...requires);
    }

    /* 
        # 视图存储
    */
    views = {};

    init() {
        return () => this.load();
    }

    loaded = Symbol("loaded");

    async load() {
        const {collect_plugins_prop} = this.require["base"];
        const {finish} = this.require["init-manager"];
        const views = Object.fromEntries(
            (await collect_plugins_prop("$view_data"))
                .map(view_data => [view_data.id, view_data])
        );
        this.views.assign(views);
        finish(this.loaded);
    }
}