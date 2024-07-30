export default {

".json:boolean": {
    "able.core:edit": true,
    "handles.core:edit"() {
        this.act.toggle();
    },
},

".json:string": {
    "able.core:edit": true,
    "handles.core:edit"() {
        const res = this.$require["core:editor:inline-code"].edit(this.data.val);
        if (res !== null) {
            this.act.set(res);
        }
    },
},

".json:number": {
    "able.core:edit": true,
    "handles.core:edit"() {
        const res = this.$require["core:editor:inline-code"].edit(this.data.val.toString());
        if (res !== null) {
            try {
                this.act.set(Number.parseFloat(res));
            } catch (_) {}
        }
    },
},

".json:array": {
    "able.core:scale.right": true,
    "handles.core:scale.right.move"(p, {move_x, delta_x, start_rect, current_rect}) {
        delta_x -= current_rect.width - start_rect.width;
        const prev_node = this.data[this.data_column - 1];
        const prev_rect = prev_node.melem.rect;
        const next_node = this.data[this.data_column];
        if (delta_x > 8 && move_x > 0 && next_node) {
            const next_rect = next_node.melem.rect;
            if (prev_rect.right - current_rect.left + next_rect.width / 2 <
                current_rect.width + delta_x) {
                this.data_column.val++;
            }
        } else if (delta_x < -8 && move_x < 0 && this.data_column.val > 1) {
            if (prev_rect.right - current_rect.left - prev_rect.width / 2 >
                current_rect.width + delta_x) {
                this.data_column.val--;
            }
        }
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