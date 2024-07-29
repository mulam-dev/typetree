const id = "core:basic-layout";
const provides = ["layout"];
const requires = [
    "base",
    "view",
    "init-manager",
];

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_must(plugins, ...requires);
    }

    async init() {
        const {after, all} = this.require["init-manager"];
        after(all(
            this.require["view"].loaded,
        ), () => this.load());
    }

    loaded = Symbol("loaded");

    async load() {
        const icon = async name => jQuery(await (await fetch(`res/tabler-icons/${name}.svg`)).text());
        const cname = name => "core-layout-" + name;
        const fit_size = async (initial = false) => {
            const padding = 24;
            let rviewport = me_viewport.rect;
            let rinner = me_inner.rect;
            if (!initial) {
                const delta_w = Math.ceil(rinner.width - rviewport.width + padding * 2);
                const delta_h = Math.ceil(rinner.height - rviewport.height + padding * 2);
                native.app.resize_window_by(delta_w, delta_h, initial);
                await frame();
                await frame();
                rviewport = me_viewport.rect;
                rinner = me_inner.rect;
            }
            const delta_x = Math.round(rinner.left - rviewport.left - padding);
            const delta_y = Math.round(rinner.top - rviewport.top - padding);
            me_viewport.elem.scrollBy({
                top: delta_y,
                left: delta_x,
                behavior: "smooth",
            });
        };
        const views_show = [false];


        const {finish} = this.require["init-manager"];
        const {views} = this.require["view"];
        const {div} = ME;

        const me_views = div.class(cname("views")).$show(views_show).$inner(
            views
                .bvalues()
                .bmap((view, _, $) => {
                    $(view);
                    return div.class(cname("vroot"))(
                        div.class(cname("vhead"))(view.name.get()),
                        div.class(cname("vbody"))(view.melem),
                    );
                })
        )();
        const me_inner = div.class(cname("inner")).$inner(
            this.root.inner
            .bmap(node => node.melem),
        )();
        const me_viewport = div.class(cname("viewport"))(
            div.class(cname("content"))(
                me_inner,
            ),
        );
        div.class(cname("root"))(
            me_views,
            div.class(cname("main"))(
                div.class(cname("head"))(
                    div.class(cname("htool"))(
                        div.class(cname("hbutton")).$on({"click": () => views_show.toggle()})(icon("layout-sidebar")),
                    ),
                    div.class(cname("htitle"))("TypeTree"),
                    ...(native ? [div.class(cname("hcontrol"))(
                        div.class(cname("hbutton")).$on({"click": () => native.app.minimize_window()})(icon("minus")),
                        div.class(cname("hbutton")).$on({"click": () => fit_size()})(icon("minimize")),
                        div.class(cname("hbutton")).$on({"click": () => native.app.toggle_maximize_window()})(icon("arrows-diagonal")),
                        div.id("ctl-close").class(cname("hbutton")).$on({"click": () => native.app.exit()})(icon("x")),
                    )] : []),
                ),
                me_viewport,
            ),
        ).attach(this.root.melem);
        await timeout(100);
        await fit_size(true);
        finish(this.loaded);
    }
}

const timeout = timeout => new Promise(res => setTimeout(res, timeout));
const frame = () => new Promise(res => requestAnimationFrame(res));