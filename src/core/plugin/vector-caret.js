const id = "core:vector-caret";
const provides = ["caret"];
const requires = ["base"];

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_must(plugins, ...requires);
    }

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
        melem => melem.class.suffix("f-caret"),
        melem => melem.class.delete_at("f-caret"),
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
            "--x": rect.x - this.data_offset.x,
            "--y": rect.y - this.data_offset.y,
            "--w": rect.width,
            "--h": rect.height,
        };
    });
    m_bounding_box = this.m_boxes.breduce((box, cbox) => ({
        "--x": Math.min(box["--x"], cbox["--x"]),
        "--y": Math.min(box["--y"], cbox["--y"]),
        "--w": Math.max(box["--w"], cbox["--w"]),
        "--h": Math.max(box["--h"], cbox["--h"]),
    }), {
        "--x": Infinity,
        "--y": Infinity,
        "--w": 0,
        "--h": 0,
    })

    melem_container =
        div
            .$class([
                [cname("container")],
                this.data_opts
                    .bfilter(v => v)
                    .bkeys()
                    .bmap(k => "f-" + k),
            ].bflat())
            .tab_index(0)
            .$style(this.m_bounding_box)
            .$inner(this.m_boxes
                .bmap(box =>
                    div
                        .class(cname("box"))
                        .$style(box)()
                )
            )()
    melem =
        div
            .class(cname("root"))
        (
            this.melem_container,
        )

    set(src, node_or_melems, opts = {
        show_box: true,
        show_handle_top: false,
        show_handle_right: false,
        show_handle_bottom: false,
        show_handle_left: false,
    }) {
        this.data_opts.assign(opts);
        this.data_viewport.val = get_elem_viewport(to_melem(node_or_melems[0]).elem);
        this.data_melems.assign(node_or_melems.map(to_melem));
        this.data_src.val = src;
        this.melem_container.focus();
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