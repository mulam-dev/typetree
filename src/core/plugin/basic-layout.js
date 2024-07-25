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

    loaded = Symbol("loaded");

    load() {
        const cname = name => "core-layout-" + name;
        const {finish} = this.require["init-manager"];
        const {views} = this.require["view"];
        const {div} = ME;
        div.class(cname("root"))(
            div.class(cname("views")).$inner(
                views
                    .bvalues()
                    .bmap((view, _, $) => {
                        $(view);
                        return div.class(cname("vroot"))(
                            div.class(cname("vhead"))(view.name.get()),
                            div.class(cname("vbody"))(view.elem),
                        );
                    })
            )(),
            div.class(cname("inner")).$inner(
                this.root.inner
                    .bmap(node => node.elem),
            )(),
        ).attach(this.root.elem);
        finish(this.loaded);
    }
}
