const id = "#core:vector-cursor";
const extend = null;
const provides = [".core:cursor"];
const name = Names("Vector Cursor");

const Super = await TTNode.Class(extend);
export default class extends Super {
    static id = id
    static provides = provides
    static uses = [id, ...provides, ...Super.uses]
    static name = name

    data_opts = {}
    data_viewport = [].guard(null,
        elem => {
            this.melem_root.attach(elem);
            this.data_offset_observer.observe(elem);
            const rect = this.melem_root.rect;
            if (rect) this.data_offset.assign({x: rect.x, y: rect.y});
        },
        elem => {
            this.melem_root.remove();
            this.data_offset_observer.unobserve(elem);
        },
    )
    data_offset = {x: 0, y: 0}
    data_offset_observer = new ResizeObserver(() => {
        const rect = this.melem_root.rect;
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
        return rect ? {
            "--x": rect.x - this.data_offset.x,
            "--y": rect.y - this.data_offset.y,
            "--width": rect.width,
            "--height": rect.height,
        } : {
            "--x": 0,
            "--y": 0,
            "--width": 0,
            "--height": 0,
        };
    });

    melem =
        div
            .class(cname("container"))
            .$style(this.m_box)()
    melem_root =
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
            this.melem,
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