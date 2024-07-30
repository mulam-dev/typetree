const id = "core:vector-caret";
const provides = ["core:caret"];
const requires = [];

const dirs = ["top", "bottom", "left", "right", "top_left", "top_right", "bottom_left", "bottom_right"];

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_must(plugins, ...requires);
    }

    dirs = dirs;

    data_opts = {}
    data_viewport = [].guard(null,
        elem => {
            this.melem.attach(elem);
            this.data_offset_observer.observe(elem);
            const rect = this.melem.rect;
            if (rect) this.data_offset.assign({x: rect.x, y: rect.y});
        },
        elem => {
            this.data_offset_observer.unobserve(elem);
        },
    )
    data_melems = [].guard(null,
        ({elem}) => this.data_offset_observer.observe(elem),
        ({elem}) => this.data_offset_observer.unobserve(elem),
    )
    data_src = []
    data_offset = {x: 0, y: 0}
    data_offset_observer = new ResizeObserver(() => {
        const rect = this.melem.rect;
        if (rect) this.data_offset.assign({x: rect.x, y: rect.y});
    })

    m_boxes = this.data_melems.bmap((melem, _, $) => {
        $(this.data_offset);
        const rect = melem.rect;
        return {
            "--box-x": rect.x - this.data_offset.x,
            "--box-y": rect.y - this.data_offset.y,
            "--w": rect.width,
            "--h": rect.height,
        };
    });
    m_container_box = this.m_boxes.breduce((cont, box) => ({
        "--cont-x": Math.min(cont["--cont-x"], box["--box-x"]),
        "--cont-y": Math.min(cont["--cont-y"], box["--box-y"]),
        "--w": Math.max(cont["--w"], box["--w"]),
        "--h": Math.max(cont["--h"], box["--h"]),
    }), {
        "--cont-x": Infinity,
        "--cont-y": Infinity,
        "--w": 0,
        "--h": 0,
    })

    melem_container =
        div
            .class(cname("container"))
            .$style(this.m_container_box)
            .$inner(this.m_boxes
                .bmap(box =>
                    div
                        .class(cname("box"))
                        .$style(box)()
                )
            )()
    melem_handles = Object.fromEntries(
        dirs.map(dir => [dir, div.class(cname("vector-handle"), `f-${dir}`)()]),
    )
    melem_handle_container = 
        div
            .class(cname("handle-container"))
            .$style(this.m_container_box)
            .$inner(Object.values(this.melem_handles))()
    melem =
        div
            .$class([
                [cname("root")],
                this.data_opts
                    .bfilter(v => v)
                    .bkeys()
                    .bmap(k => "f-" + k),
            ].bflat())
        (
            this.melem_container,
            this.melem_handle_container,
        )

    set(src, node_or_melems, opts) {
        opts = {
            show_container: true,
            show_box: false,
            ...Object.fromEntries(dirs.map(d => [`show_handle_${d}`, false])),
            ...opts,
        };
        this.data_opts.assign(opts);
        this.data_viewport.val = get_elem_viewport(to_melem(node_or_melems[0]).elem);
        this.data_melems.assign(node_or_melems.map(to_melem));
        this.data_src.val = src;
        this.root.focus();
    }
}

const {div} = ME;
const cname = name => "core-caret-" + name;
const get_elem_viewport = elem =>
    jQuery(elem)
        .parents()
        .filter((_, e) =>
            _detect_overflow_values.includes(jQuery(e).css("overflow-y")) ||
            _detect_overflow_values.includes(jQuery(e).css("overflow-x")))
        .first()[0];
const _detect_overflow_values = ["auto", "scroll"];
const to_melem = node_or_melem => node_or_melem instanceof TTNode ? node_or_melem.melem : node_or_melem;