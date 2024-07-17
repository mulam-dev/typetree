const id = "core:view";
const provides = ["view"];
const requires = [];

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

    async load() {
        const views = Object.fromEntries(
            (await Promise.all(this.root.plugins.map(plugin =>
                plugin.$view_data?.()
            )))
                .filter(e => e)
                .flatMap(data => data instanceof Array ? data : [data])
                .map(view_data => [view_data.id, view_data])
        );
        console.log(views);
    }
}