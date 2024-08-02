const id = "#core:vector-cursor";
const type = ".core:cursor";
const name = "Vector Cursor";

export default class extends TTNode {
    static id = id
    static type = type
    static name = name

    data_opts = {}
    data_viewport = [].guard(null,
        elem => {
            this.melem.attach(elem);
            this.data_offset_observer.observe(elem);
            const rect = this.melem.rect;
            if (rect) this.data_offset.assign({x: rect.x, y: rect.y});
        },
        elem => {
            this.melem.remove();
            this.data_offset_observer.unobserve(elem);
        },
    )
    data_offset = {x: 0, y: 0}
    data_offset_observer = new ResizeObserver(() => {
        const rect = this.melem.rect;
        if (rect) this.data_offset.assign({x: rect.x, y: rect.y});
    })
    data_anchor = [].guard(null,
        ({elem}) => this.data_offset_observer.observe(elem),
        ({elem}) => this.data_offset_observer.unobserve(elem),
    )
    data_cursor_offset = {}

    m_box = this.data_anchor.bmap((melem, _, $) => {
        $(this.data_offset);
        const rect = melem.rect;
        return {
            "--x": rect.x - this.data_offset.x,
            "--y": rect.y - this.data_offset.y,
            "--width": rect.width,
            "--height": rect.height,
        };
    });

    melem_container =
        div
            .class(cname("container"))
            .$style(this.m_box)()
    melem =
        div
            .$class([
                [cname("root")],
                this.data_opts
                    .bfilter(v => v)
                    .bkeys()
                    .bmap(k => "f-" + k),
            ].bflat())
            .$style(this.data_cursor_offset)
        (
            this.melem_container,
        )

    set(anchor, opts = {}) {
        opts = {
            ...opts,
        };
        anchor = to_melem(anchor);
        if (anchor) {
            this.data_anchor.val = anchor;
            this.data_opts.assign({
                "dir_x": opts.dir === "x",
                "dir_y": opts.dir === "y",
            });
            this.data_cursor_offset.assign({
                "--cursor-x": opts.x,
                "--cursor-y": opts.y,
                "--cursor-size": opts.size,
            });
            this.data_viewport.val = get_elem_viewport(anchor.elem);
        } else {
            this.data_viewport.clear();
        }
    }
}

const {div} = ME;
const cname = name => "core-cursor-" + name;
const get_elem_viewport = elem =>
    jQuery(elem)
        .parents()
        .filter((_, e) =>
            _detect_overflow_values.includes(jQuery(e).css("overflow-y")) ||
            _detect_overflow_values.includes(jQuery(e).css("overflow-x")))
        .first()[0];
const _detect_overflow_values = ["auto", "scroll"];
const to_melem = node_or_melem => node_or_melem instanceof TTNode ? node_or_melem.melem : node_or_melem;