const id = "#core:selection";
const extend = null;
const provides = [".core:selection"];
const name = Names("Selection");

const Super = await TTNode.Class(extend);
export default class extends Super {
    static id = id
    static provides = provides
    static uses = [id, ...provides, ...Super.uses]
    static name = name

    static rule = {
        "handles": {
            "core:active"(p) {
                if (this.data_nodes.length === 1) {
                    this.data_nodes.val.request_pack(p);
                }
            },
            "core:enter"(p, node) {
                if (!node && this.data_nodes.length === 1) node = this.data_nodes.val;
                node?.request("core:selection.enter", this);
            },
            "core:escape"(p) {
                const scope = this.data_scope.val;
                const parent = scope.parent;
                if (parent && parent.has(scope)) {
                    parent.request("core:selection.select", this, scope);
                }
            },
            "core:select"(p, node) {
                const parent = node.parent;
                if (parent && parent.has(node)) {
                    parent.request("core:selection.select", this, node);
                }
            },
        },
    }

    init(data) {
        this.data_scope = [data.scope].guard(null, scope => this.into(scope));
        this.data_range = [data.anchor, data.focus];
        this.data_nodes = [];

        this.node_range = this.$type["#core:vector-range"]();
        this.node_cursor = this.$type["#core:vector-cursor"]();

        const {dirs} = this.node_range;
        const melem_handles = this.node_range.struct_ref("handles");

        const udpate = () => {
            const res = this.request_scope("resolve");
            if (res) {
                const [type, ...args] = res;
                if (type === "range") {
                    this.node_cursor.set(null);
                    this.data_struct = [this.node_range.melem];
                    const [nodes] = args;
                    this.data_nodes.assign(nodes);
                    const opts = {};
                    const able_caret_dir = this.request_scope("dir") ?? {};
                    for (const dir in able_caret_dir) if (able_caret_dir[dir]) {
                        opts[`show_handle_${dir}`] = true;
                    }
                    const able_scale = nodes
                        .map(node => node.attrs_merged("able.core:selection.scaler"))
                        .reduce((p, c) => Object.assign(p, c.call ? c.call(this) : c), {});
                    for (const dir in able_scale) if (able_scale[dir]) {
                        opts[`show_handle_${dir}`] = true;
                    }
                    if (nodes.length > 1) {
                        opts.show_box = true;
                    }
                    this.node_range.set(nodes, opts);
                }
                if (type === "cursor") {
                    this.data_nodes.clear();
                    this.node_range.set([]);
                    const [anchor, opts] = args;
                    this.data_struct = [this.node_cursor.melem];
                    this.node_cursor.set(anchor, opts);
                }
                setTimeout(() => {
                    this.melem.elem.scrollIntoView({
                        block: "nearest",
                        inline: "nearest",
                        behavior: "smooth",
                    });
                }, 0);
            }
        };
        
        for (const dir of dirs) {
            melem_handles[dir].listen("mousedown", e => {
                const nodes = this.data_nodes;
                if (nodes.length && e.button === 0) {
                    let moved = false;
                    const start_x = e.clientX;
                    const start_y = e.clientY;
                    const start_rect = this.melem.rect;
                    const request_handle = (e, suffix) => {
                        const delta_x = e.clientX - start_x;
                        const delta_y = e.clientY - start_y;
                        moved ||= Math.abs((delta_x << 1) + (delta_y << 1) >> 1) > 2;
                        if (moved) {
                            const move_x = e.originalEvent.movementX;
                            const move_y = e.originalEvent.movementY;
                            const current_rect = this.melem.rect;
                            const data = {
                                start_x, start_y,
                                delta_x, delta_y,
                                move_x, move_y,
                                start_rect, current_rect,
                            };
                            nodes.forEach(node => node.request(`core:selection.scaler.${dir}.${suffix}`, data));
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

    free() {
        this.outof();
        this.data_range.unlisten(null);
        this.node_range.set([]);
        this.node_cursor.set(null);
    }

    set(anchor, focus) {
        this.data_range.assign([anchor, focus]);
    }

    request_scope(cmd, ...args) {
        return this.data_scope.val.request("core:selection." + cmd, ...args, {
            anchor: this.data_range[0],
            focus: this.data_range[1],
        }).result;
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
        if (range && range.every(pos => this.request_scope("varify", pos, range))) {
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