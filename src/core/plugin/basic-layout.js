const id = "core:basic-layout";
const provides = ["layout"];
const requires = [
    "base",
    "view",
    "init-manager",
];

export default class extends TypeTreePlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_must(plugins, ...requires);
    }

    init() {
        const {after, all} = this.require["init-manager"];
        after(all(
            this.require["view"].loaded,
        ), () => this.load());
    }

    load() {
        const {views} = this.require["view"];
        this.root.elem.attr("inner").bind_clone(
            views
                .bmap((view, _, $) => $(view).root)
                .bvalues(),
        );
        console.log(views)
    }
}

const s_view_guard = Symbol();