const id = "#core:selection";
const type = ".core:selection";
const name = "Selection";

export default class extends TTNode {
    static id = id
    static type = type
    static name = name

    init(data) {
        const scope = data.scope;
        this.data_scope = scope;
        this.data_anchor = data.anchor;
        this.data_focus = data.focus;
        this.data_nodes = scope.request("core:selection:get-nodes", this.data_anchor, this.data_focus).result;

        this.node_range = this.$type["#core:vector-range"]();
    }

    into(parent) {
        super.into(parent);

        const {melem_handles, dirs} = this.node_range;

        const udpate = () => {
            if (this.data_nodes.length > 1) {
                this.node_range.set(this.data_nodes, {
                    show_box: true,
                });
            } else if (this.data_nodes.length === 1) {
                const [node] = this.data_nodes;
                const able_scale = node.attrs("able.core:scale").reduce((p, c) => Object.assign(p, c.call ? c.call(node) : c), {});
                const able_caret = node.attrs("able.core:caret").reduce((p, c) => Object.assign(p, c.call ? c.call(node) : c), {});
                this.node_range.set(this.data_nodes, Object.fromEntries(
                    dirs.filter(dir => able_scale[dir] || able_caret[dir]).map(dir => [`show_handle_${dir}`, true]),
                ));
            } else {
                this.node_range.set(this.data_nodes);
            }
        };
        
        for (const dir of dirs) {
            melem_handles[dir].listen("mousedown", e => {
                const [current] = this.data_nodes;
                if (e.button === 0) {
                    let moved = false;
                    const start_x = e.clientX;
                    const start_y = e.clientY;
                    const start_rect = current.melem.rect;
                    const request_handle = (e, suffix) => {
                        const delta_x = e.clientX - start_x;
                        const delta_y = e.clientY - start_y;
                        moved ||= Math.abs((delta_x << 1) + (delta_y << 1) >> 1) > 2;
                        if (moved) {
                            const move_x = e.originalEvent.movementX;
                            const move_y = e.originalEvent.movementY;
                            const current_rect = current.melem.rect;
                            const data = {
                                start_x, start_y,
                                delta_x, delta_y,
                                move_x, move_y,
                                start_rect, current_rect,
                            };
                            current.request(`core:scale.${dir}.${suffix}`, data);
                        }
                    };
                    const move_handle = e => request_handle(e, "move");
                    const up_handle = e => {
                        if (e.button === 0) {
                            jQuery(window).off("mousemove", move_handle);
                            jQuery(window).off("mouseup", up_handle);
                            request_handle(e, "end");
                            if (!moved) current.request(`core:caret.${dir}`);
                        }
                    }
                    jQuery(window).on("mousemove", move_handle);
                    jQuery(window).on("mouseup", up_handle);
                }
            });
        }

        this.data_nodes.listen(null, udpate);
        udpate();
    }

    outof() {
        super.outof();
        this.data_nodes.unlisten(null);
        this.node_range.set([]);
    }
}