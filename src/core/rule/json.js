export default {

".json:boolean": {
    able: {
        "core:edit": true,
    },
    handles: {
        "core:edit"() {
            this.act.toggle();
        },
    },
},

".json:string": {
    able: {
        "core:edit": true,
    },
    handles: {
        "core:edit"() {
            const res = this.$require["core:editor:inline-code"].edit(this.data.val);
            if (res !== null) {
                this.act.set(res);
            }
        },
    },
},

".json:number": {
    able: {
        "core:edit": true,
    },
    handles: {
        "core:edit"() {
            const res = this.$require["core:editor:inline-code"].edit(this.data.val.toString());
            if (res !== null) {
                try {
                    this.act.set(Number.parseFloat(res));
                } catch (_) {}
            }
        },
    },
},

".json:array": {
    able: {
        "core:scale": {
            "right": true,
        },
    },
    handles: {
        "core:scale": {
            "right"(p, delta, _, cwidth, swidth) {
                const rdelta = delta - (cwidth - swidth);
                const prev_node = this.data[this.data_column - 1];
                const root_r = this.melem.rect;
                const prev_r = prev_node.melem.rect;
                if (rdelta > 8) {
                    const next_node = this.data[this.data_column];
                    if (next_node) {
                        const next_r = next_node.melem.rect;
                        if (prev_r.right - root_r.left + next_r.width / 2 + 2 < root_r.width + rdelta) {
                            this.data_column.val++;
                        }
                    }
                } else if (rdelta < -8 && this.data_column.val > 1) {
                    if (prev_r.right - root_r.left - prev_r.width / 2 - 2 > root_r.width + rdelta) {
                        this.data_column.val--;
                    }
                }
            },
        },
    },
},

".json:array > *": {
    able: {
        "core:delete": true,
        "core:caret"() {
            return this.parent.data_column.val > 1 ? {
                "left": true,
                "right": true,
            } : {
                "top": true,
                "bottom": true,
            }
        },
    },
    handles: {
        "core:delete"() {
            //
        },
        "core:caret"() {
            function before_handle() {
                //
            }
            function after_handle() {
                //
            }
            return this.parent.data_column.val > 1 ? {
                "left": before_handle,
                "right": after_handle,
            } : {
                "top": before_handle,
                "bottom": after_handle,
            }
        },
    },
},

}