const id = "#core:popup"
const provides = [".core:popup"]
const requires = {
}

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_essential(plugins, requires);
    }

    ".core:style-loader" = [
        "style/popup"
    ]

    popup(anchor, inner, opts) {
        const {melem} = this.root.$require[".layout"];
        const popup = new Popup(melem, anchor, inner, opts);
        popup.show();
        return popup;
    }
}

class Popup {
    constructor(container, anchor, inner, opts = {}) {
        this.closed = false;
        this.wait_stack = [];
        this.anchor = anchor;
        this.inner = inner;
        this.opts = {
            popup_x: opts.popup_x ?? 1,
            popup_y: opts.popup_y ?? 1,
            anchor_x: opts.anchor_x ?? 0,
            anchor_y: opts.anchor_y ?? 0,
            offset_x: opts.offset_x ?? 0,
            offset_y: opts.offset_y ?? 2,
            mask_opacity: opts.mask_opacity ?? 0,
        };

        this.data_inner = [inner];
    
        this.me_popup = div
            .class(cname("frame"))
            .$inner(this.data_inner)
        ()
    
        this.melem = div
            .class(cname("root"))
            .$style(this.m_box)
            .$show(this.data_visible)
        (
            div
                .class(cname("mask"))
                .$style({
                    "--opacity": this.opts.mask_opacity,
                })
                .$on({
                    "click": () => {
                        this.free();
                    },
                })
            (),
            this.me_popup,
        ).attach(container)

        this.observer.observe(to_elem(this.me_popup));
        this.observer.observe(to_elem(this.anchor));
    }

    data_visible = [false]

    observer = new ResizeObserver(() => this.update())

    m_box = {}

    show() {
        if (!this.data_visible.val) {
            this.data_visible.val = true;
        }
    }

    hide() {
        if (this.data_visible.val) {
            this.data_visible.val = false;
        }
    }

    free() {
        if (this.closed) return;
        this.closed = true;
        this.hide();
        this.observer.unobserve(to_elem(this.me_popup));
        this.observer.unobserve(to_elem(this.anchor));
        this.inner.remove();
        this.melem.remove();
        this.wait_stack.forEach(res => res());
    }

    wait_free() {
        if (this.closed) return;
        return new Promise(res => {
            this.wait_stack.push(res);
        });
    }

    update() {
        const inner_rect = to_elem(this.me_popup).getClientRects()[0];
        const anchor_rect = to_elem(this.anchor).getClientRects()[0];
        if (inner_rect && anchor_rect) {
            const opts = this.opts;
            this.m_box.assign({
                "--x": Math.max(0, Math.min(window.innerWidth - inner_rect.width,
                    anchor_rect.left +
                    opts.offset_x +
                    anchor_rect.width * opts.anchor_x +
                    inner_rect.width * (opts.popup_x - 1) * 0.5
                )),
                "--y": Math.max(0, Math.min(window.innerHeight - inner_rect.height,
                    anchor_rect.top +
                    opts.offset_y +
                    anchor_rect.height * opts.anchor_y +
                    inner_rect.height * (opts.popup_y - 1) * 0.5
                )),
            });
        } else {
            this.m_box.assign({
                "--x": 0,
                "--y": 0,
            });
        }
    }
}

const {div} = ME;
const cname = name => "core-popup-" + name;
const to_elem = elem => elem instanceof MahadElem ? elem.elem : elem;