const id = "core:view";
const provides = ["view"];
const requires = ["init-manager"];

export default class extends TypeTreePlugin {
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
        const {finish} = this.require["init-manager"];
        const views = Object.fromEntries(
            (await Promise.all(this.root.plugins.map(plugin =>
                plugin.$view_data?.()
            )))
                .filter(e => e)
                .flatMap(data => data instanceof Array ? data : [data])
                .map(view_data => [view_data.id, view_data])
        );
        this.views.assign(views);
        finish(this.loaded);
    }
}