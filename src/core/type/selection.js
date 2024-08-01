const id = "#core:selection";
const type = ".core:selection";
const name = "Selection";

export default class extends TTNode {
    static id = id
    static type = type
    static name = name

    handles = {...this.handles,
        "core:active"(p) {
            if (this.data_nodes.length === 1) {
                this.data_nodes.val.request_pack(p);
            }
        },
    }

    init(data) {
        const scope = data.scope;
        this.data_scope = scope;
        this.data_range = [data.anchor, data.focus];
        this.data_nodes = [];

        this.node_range = this.$type["#core:vector-range"]();
        this.node_cursor = this.$type["#core:vector-cursor"]();
    }

    into(parent) {
        super.into(parent);

        const {melem_handles, dirs} = this.node_range;

        const udpate = () => {
            const res = this.request_scope("resolve");
            if (res) {
                const [type, ...args] = res;
                if (type === "range") {
                    this.node_cursor.set(null);
                    const [nodes] = args;
                    this.data_nodes.assign(nodes);
                    const opts = {};
                    const able_caret_dir = this.request_scope("dir") ?? {};
                    for (const dir in able_caret_dir) if (able_caret_dir[dir]) {
                        opts[`show_handle_${dir}`] = true;
                    }
                    if (nodes.length > 1) {
                        opts.show_box = true;
                        this.node_range.set(nodes, opts);
                    } else if (nodes.length === 1) {
                        const [active_node] = nodes;
                        const able_scale = active_node.attrs_merged("able.core:scale");
                        for (const dir in able_scale) if (able_scale[dir]) {
                            opts[`show_handle_${dir}`] = true;
                        }
                        this.node_range.set(nodes, opts);
                    } else {
                        this.node_range.set(nodes);
                    }
                }
                if (type === "cursor") {
                    this.data_nodes.clear();
                    this.node_range.set([]);
                    const [anchor, opts] = args;
                    this.node_cursor.set(anchor, opts);
                }
            }
        };
        
        for (const dir of dirs) {
            melem_handles[dir].listen("mousedown", e => {
                const [current] = this.data_nodes;
                if (current && e.button === 0) {
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
                            if (!moved) this.collapse(dir);
                        }
                    }
                    jQuery(window).on("mousemove", move_handle);
                    jQuery(window).on("mouseup", up_handle);
                }
            });
        }

        this.data_range.listen(null, udpate);
        udpate();
    }

    outof() {
        super.outof();
        this.data_range.unlisten(null);
        this.node_range.set([]);
        this.node_cursor.set(null);
    }

    set(anchor, focus) {
        this.data_range.assign([anchor, focus]);
    }

    request_scope(cmd, ...args) {
        return this.data_scope.request("core:selection." + cmd, ...args, {
            anchor: this.data_range[0],
            focus: this.data_range[1],
        }).result;
    }

    request_action(act, opts = {}) {
        return this.data_scope.act[act]({
            anchor: this.data_range[0],
            focus: this.data_range[1],
            nodes: this.data_nodes,
            selection: this,
            ...opts,
        });
    }

    expand_x() {
        this.data_range.assign([
            this.request_scope("side", "left", this.data_range[0]),
            this.request_scope("side", "right", this.data_range[1]),
        ]);
    }

    expand_y() {
        this.data_range.assign([
            this.request_scope("side", "top", this.data_range[0]),
            this.request_scope("side", "bottom", this.data_range[1]),
        ]);
    }

    slide(dir) {
        const range = this.data_range.map(pos => this.request_scope("move", dir, pos));
        if (range.every(pos => this.request_scope("varify", pos, range))) {
            this.data_range.assign(range);
        }
    }

    move_anchor(dir) {
        const pos = this.request_scope("move", dir, this.data_range[0]);
        if (this.request_scope("varify", pos, [pos, this.data_range[1]])) {
            this.data_range.set(0, pos);
        }
    }

    move_focus(dir) {
        const pos = this.request_scope("move", dir, this.data_range[1]);
        if (this.request_scope("varify", pos, [this.data_range[0], pos])) {
            this.data_range.set(1, pos);
        }
    }

    side_anchor(dir) {
        const pos = this.request_scope("side", dir, this.data_range[0]);
        if (this.request_scope("varify", pos, [pos, this.data_range[1]])) {
            this.data_range.set(0, pos);
        }
    }

    side_focus(dir) {
        const pos = this.request_scope("side", dir, this.data_range[1]);
        if (this.request_scope("varify", pos, [this.data_range[0], pos])) {
            this.data_range.set(1, pos);
        }
    }

    collapse(dir) {
        const range = this.request_scope("collapse", dir);
        if (range) {
            this.data_range.assign(range);
            return true;
        }
        return false;
    }

    collapsed(dir) {
        return this.request_scope("collapsed", dir);
    }

    shrink(dir) {
        if (this.collapse(dir)) {
            switch (dir) {
                case "top": return this.move_focus("bottom");
                case "bottom": return this.move_focus("top");
                case "left": return this.move_focus("right");
                case "right": return this.move_focus("left");
            }
        }
    }
}