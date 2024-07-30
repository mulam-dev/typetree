const id = "core:active-node";
const provides = ["core:active-node"];
const requires = [
    "core:caret",
];

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_must(plugins, ...requires);
    }

    current = []

    init() {
        const {melem_handles, melem_container, dirs, set} = this.require["core:caret"];
        this.current.guard(null, node => {
            const able_scale = node.attrs("able.core:scale").reduce((p, c) => Object.assign(p, c.call ? c.call(node) : c), {});
            const able_caret = node.attrs("able.core:caret").reduce((p, c) => Object.assign(p, c.call ? c.call(node) : c), {});
            set(node, [node], Object.fromEntries(
                dirs.filter(dir => able_scale[dir] || able_caret[dir]).map(dir => [`show_handle_${dir}`, true]),
            ));
        });
        for (const dir of dirs) {
            melem_handles[dir].listen("mousedown", e => {
                if (e.button === 0) {
                    let moved = false;
                    const start_x = e.clientX;
                    const start_y = e.clientY;
                    const pre_r = melem_container.rect;
                    const request_handle = (e, suffix = '') => {
                        const delta_x = e.clientX - start_x;
                        const delta_y = e.clientY - start_y;
                        moved ||= ((delta_x << 1) + (delta_y << 1) >> 1) > 2;
                        const cur_r = melem_container.rect;
                        if (["top", "bottom"].includes(dir)) {
                            this.current.val.request_msgs([`core:scale.${dir}${suffix}`, delta_y, start_y, cur_r.height, pre_r.height]);
                        } else if (["left", "right"].includes(dir)) {
                            this.current.val.request_msgs([`core:scale.${dir}${suffix}`, delta_x, start_x, cur_r.width, pre_r.width]);
                        } else {
                            this.current.val.request_msgs([`core:scale.${dir}${suffix}`,
                                [delta_x, delta_y],
                                [start_x, start_y],
                                [cur_r.width, cur_r.height],
                                [pre_r.width, pre_r.height],
                            ]);
                        }
                    };
                    const move_handle = request_handle;
                    const up_handle = e => {
                        if (e.button === 0) {
                            jQuery(window).off("mousemove", move_handle);
                            jQuery(window).off("mouseup", up_handle);
                            request_handle(e, "-end");
                            if (!moved) this.current.val.request_msgs([`core:caret.${dir}`]);
                        }
                    }
                    jQuery(window).on("mousemove", move_handle);
                    jQuery(window).on("mouseup", up_handle);
                }
            });
        }
    }

    set(node) {
        this.current.val = node;
    }
}
