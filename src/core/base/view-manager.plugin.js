const id = "#core:view-manager"
const provides = [".core:view-manager"]
const requires = {
    base: ".core:base",
    init: ".core:init-manager",
}

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_must(plugins, requires);
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
        const {collect_plugins_prop} = this.require.base;
        const {finish} = this.require.init;
        const views = Object.fromEntries(
            (await collect_plugins_prop("$core_view_data"))
                .map(view_data => [view_data.id, view_data])
        );
        this.views.assign(views);
        finish(this.loaded);
    }
}