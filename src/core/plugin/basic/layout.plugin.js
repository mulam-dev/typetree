const id = "core:basic-layout"
const provides = ["core:layout"]
const requires = {
    view: "core:view-manager",
    init: "core:init-manager",
    menu: "core:context-menu",
}

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_must(plugins, requires);
    }

    async init() {
        const {after, all} = this.require.init;
        after(all(
            this.require.view.loaded,
        ), () => this.load());
    }

    selections = [].guard(null, sel => sel.into(this.root), sel => sel.outof());

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
        const views_show = [true];


        const {finish} = this.require.init;
        const {views} = this.require.view;
        const {div} = ME;

        const me_views = div.class(cname("views")).$show(views_show).$inner(
            views
                .bvalues()
                .bmap((view, _, $) => {
                    $(view);
                    return div.class(cname("vroot"))(
                        div.class(cname("vhead"))(...(view.icon ? [icon(view.icon)] : []), view.name.get()),
                        div.class(cname("vbody"))(view.melem),
                    );
                })
        )();

        let release_timer = null;

        const me_inner = div.class(cname("inner")).$inner(
            this.root.inner
            .bmap(node => node.melem),
        ).on({
            mousedown: (e) => {
                if (e.button === 0) {
                    const {target} = e;
                    const e_inner = me_inner.elem;
                    let telem = target;
                    while (telem !== e_inner && !telem.node) telem = telem.parentNode;
                    const start_node = telem.node;
                    if (start_node) {
                        const anchor_scopes = ancestors(start_node, (node, child) => node.attr("able.core:layout.select") && node.request("core:layout.has-node", child).result);
                        if (anchor_scopes.length) {
                            const scope = anchor_scopes.at(-1);
                            const anchor_node = closest(start_node, n => n.parent === scope);
                            this.selections.val = scope.request("core:layout.get-selection", anchor_node, anchor_node).result;
                            let prev_focus = telem;
                            let moved = false;
                            const clear = () => {
                                jQuery(e_inner).off("mousemove", move_handle);
                                jQuery(window).off("mouseup", up_handle);
                                jQuery(target).off("mouseleave", leave_handle);
                                jQuery(target).off("mouseenter", enter_handle);
                                if (release_timer) clearTimeout(release_timer);
                                release_timer = setTimeout(() => {
                                    this.root.melem.attr("class").delete_at("f-selecting");
                                    release_timer = null;
                                }, 200);
                            };
                            const leave_handle = () => setTimeout(() => this.root.focus(), 0);
                            const enter_handle = () => setTimeout(() => target.focus(), 0);
                            const move_handle = e => {
                                if (e.buttons === 0) {
                                    clear();
                                    return;
                                }
                                let telem = e.target;
                                while (telem !== e_inner && !telem.node) telem = telem.parentNode;
                                if (prev_focus === telem) return;
                                moved = true;
                                prev_focus = telem;
                                const end_node = telem.node;
                                if (end_node) {
                                    const focus_scopes = ancestors(end_node, (node, child) => node.attr("able.core:layout.select") && node.request("core:layout.has-node", child).result);
                                    if (focus_scopes.length) {
                                        let scope_idx = -1;
                                        while (scope_idx + 1 < anchor_scopes.length && anchor_scopes[scope_idx + 1] === focus_scopes[scope_idx + 1]) scope_idx++;
                                        const scope = anchor_scopes[scope_idx];
                                        if (scope) {
                                            const anchor_node = closest(start_node, n => n.parent === scope);
                                            const focus_node = closest(end_node, n => n.parent === scope);
                                            this.selections.val = scope.request("core:layout.get-selection", anchor_node, focus_node).result;
                                        }
                                    }
                                }
                            };
                            const up_handle = e => {
                                if (e.button === 0) {
                                    this.require.menu.set(this.selections);
                                    clear();
                                    if (!moved) {
                                        switch (e.detail) {
                                            case 1:
                                                this.selections.forEach(sel => sel.request("core:active"));
                                                break;
                                            case 2:
                                                if (this.root.focused()) {
                                                    this.selections.forEach(sel => sel.expand_x());
                                                }
                                                break;
                                            case 3:
                                                if (this.root.focused()) {
                                                    this.selections.forEach(sel => sel.expand_y());
                                                }
                                                break;
                                        }
                                    }
                                };
                            };
                            jQuery(e_inner).on("mousemove", move_handle);
                            jQuery(window).on("mouseup", up_handle);
                            jQuery(target).on("mouseleave", leave_handle);
                            jQuery(target).on("mouseenter", enter_handle);
                            const root_class = this.root.melem.attr("class");
                            if (!root_class.includes("f-selecting")) root_class.suffix("f-selecting");
                        }
                    }
                }
            },
        })();
        const me_viewport = div.class(cname("viewport")).on({
            mousedown(e) {
                if (e.button === 1) {
                    const start_x = e.clientX;
                    const start_y = e.clientY;
                    const prev_scroll_x = this.scrollLeft;
                    const prev_scroll_y = this.scrollTop;
                    const move_handle = e => {
                        e.stopPropagation();
                        e.preventDefault();
                        const delta_x = e.clientX - start_x;
                        const delta_y = e.clientY - start_y;
                        this.scrollTo({
                            left: prev_scroll_x - delta_x,
                            top: prev_scroll_y - delta_y,
                            behavior: "instant",
                        });
                    };
                    const up_handle = ({button}) => {
                        if (button === 1) {
                            e.stopPropagation();
                            e.preventDefault();
                            jQuery(window).off("mousemove", move_handle);
                            jQuery(window).off("mouseup", up_handle);
                        }
                    };
                    jQuery(window).on("mousemove", move_handle);
                    jQuery(window).on("mouseup", up_handle);
                    e.stopPropagation();
                    e.preventDefault();
                }
            },
            contextmenu(e) {
                if (this.root.focused()) {
                    e.stopPropagation();
                    e.preventDefault();
                    const shortcut = `${e.ctrlKey ? "Ctrl+" : ""}${e.altKey ? "Alt+" : ""}${e.shiftKey ? "Shift+" : ""}${e.code}`;
                    this.selections.forEach(sel => sel.request(`core:shortcut.${shortcut}`, e));
                }
            },
        })(
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
        this.root.melem.attr("on", {}).modify("keydown", e => {
            if (this.root.focused()) {
                e.stopPropagation();
                e.preventDefault();
                const shortcut = `${e.ctrlKey ? "Ctrl+" : ""}${e.altKey ? "Alt+" : ""}${e.shiftKey ? "Shift+" : ""}${e.code}`;
                this.selections.forEach(sel => sel.request(`core:shortcut.${shortcut}`, e));
            }
        });
        await timeout(100);
        await fit_size(true);
        finish(this.loaded);
    }
}

const timeout = timeout => new Promise(res => setTimeout(res, timeout));
const frame = () => new Promise(res => requestAnimationFrame(res));
const closest = (node, fn, prev = null) => node ? fn(node, prev) ? node : closest(node.parent, fn, node) : null;
const ancestors = (node, fn) => {
    const res = [];
    let prev_node = null;
    while (true) {
        node = closest(node, fn, prev_node);
        if (node) {
            res.push(node);
        } else {
            break;
        }
        prev_node = node;
        node = node.parent;
    }
    return res.reverse();
};