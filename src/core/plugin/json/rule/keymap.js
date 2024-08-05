export default plugin => ({
    ".core:selection": {
        "handles.core:shortcut.code": {
            /*
                # 移动和选取相关
            */
            "ArrowUp"() {
                this.slide("top");
            },
            "ArrowDown"() {
                this.slide("bottom");
            },
            "ArrowLeft"() {
                this.slide("left");
            },
            "ArrowRight"() {
                this.slide("right");
            },
            "Ctrl+ArrowUp"() {
                if (this.collapsed("y")) {
                    this.shrink("bottom");
                } else {
                    this.collapse("top");
                }
            },
            "Ctrl+ArrowDown"() {
                if (this.collapsed("y")) {
                    this.shrink("top");
                } else {
                    this.collapse("bottom");
                }
            },
            "Ctrl+ArrowLeft"() {
                if (this.collapsed("x")) {
                    this.shrink("right");
                } else {
                    this.collapse("left");
                }
            },
            "Ctrl+ArrowRight"() {
                if (this.collapsed("x")) {
                    this.shrink("left");
                } else {
                    this.collapse("right");
                }
            },
            "Shift+ArrowUp"() {
                this.move_focus("top");
            },
            "Shift+ArrowDown"() {
                this.move_focus("bottom");
            },
            "Shift+ArrowLeft"() {
                this.move_focus("left");
            },
            "Shift+ArrowRight"() {
                this.move_focus("right");
            },
            "Home"() {
                if (this.collapsed("x")) {
                    this.expand_x();
                    this.collapse("left");
                } else {
                    this.expand_x();
                    this.shrink("left");
                }
            },
            "End"() {
                if (this.collapsed("x")) {
                    this.expand_x();
                    this.collapse("right");
                } else {
                    this.expand_x();
                    this.shrink("right");
                }
            },
            "PageUp"() {
                if (this.collapsed("y")) {
                    this.expand_y();
                    this.collapse("top");
                } else {
                    this.expand_y();
                    this.shrink("top");
                }
            },
            "PageDown"() {
                if (this.collapsed("y")) {
                    this.expand_y();
                    this.collapse("bottom");
                } else {
                    this.expand_y();
                    this.shrink("bottom");
                }
            },
            "Ctrl+Home"() {
                this.expand_x();
                this.collapse("left");
            },
            "Ctrl+End"() {
                this.expand_x();
                this.collapse("right");
            },
            "Ctrl+PageUp"() {
                this.expand_y();
                this.collapse("top");
            },
            "Ctrl+PageDown"() {
                this.expand_y();
                this.collapse("bottom");
            },
            "Shift+Home"() {
                this.side_focus("left");
            },
            "Shift+End"() {
                this.side_focus("right");
            },
            "Shift+PageUp"() {
                this.side_focus("top");
            },
            "Shift+PageDown"() {
                this.side_focus("bottom");
            },
            "Ctrl+KeyA"() {
                this.expand_x();
                this.expand_y();
            },
            "Enter"() {
                if (this.collapsed("x")) {
                    this.act("core:insert");
                } else if (this.data_nodes.length === 1) {
                    this.data_nodes.val.request("core:enter", this);
                }
            },
            "Escape"() {
                const scope = this.data_scope.val;
                const parent = scope.parent;
                if (parent && parent.has(scope)) {
                    parent.request("core:escape", this, scope);
                }
            },



            /*
                # 插入/编辑/删除相关
            */
            "Insert"() {
                this.collapse("right");
                this.act("core:insert");
            },
            "Shift+Insert"() {
                this.collapse("bottom");
                this.act("core:insert");
            },
            "Shift+Enter"() {
                this.collapse("bottom");
                this.act("core:insert");
            },
            "Backspace"() {
                if (this.collapsed("x")) {
                    this.shrink("right");
                }
                this.act("core:delete");
            },
            "Delete"() {
                if (this.collapsed("x")) {
                    this.shrink("left");
                }
                this.act("core:delete");
            },
            "Shift+Backspace"() {
                if (this.collapsed("y")) {
                    this.shrink("bottom");
                }
                this.act("core:delete");
            },
            "Shift+Delete"() {
                if (this.collapsed("y")) {
                    this.shrink("top");
                }
                this.act("core:delete");
            },
            "Tab"() {
                if (this.collapsed("x")) {
                    this.act("core:insert");
                } else {
                    this.act("core:switch");
                }
            },
        },
    },

    /* 
        # 快速插入相关
    */

    ".json:array > .core:selection": {
        "handles.core:shortcut.key": {
            "["() {
                if (this.collapsed("x")) {
                    const nnode = plugin.make(".json:array");
                    this.act("core:insert", nnode);
                    nnode.request("core:enter", this);
                } else {
                    this.act("core:restruct");
                }
            },
            "Shift+{"() {
                const nnode = plugin.make(".json:object");
                this.act("core:insert", nnode);
                nnode.request("core:enter", this);
            },
            "s"() {
                const nnode = plugin.make(".json:string");
                this.act("core:insert", nnode);
                nnode.request("core:enter", this);
            },
            "n"() {
                const nnode = plugin.make(".json:number");
                this.act("core:insert", nnode);
                nnode.request("core:enter", this);
            },
            "b"() {
                const nnode = plugin.make(".json:boolean");
                this.act("core:insert", nnode);
                nnode.request("core:enter", this);
            },
        },
    },

    ".json:object > .core:selection": {
        "handles.core:shortcut.key": {
            "Shift+{"() {
                if (this.collapsed("x")) {
                    this.act("core:insert");
                } else {
                    this.act("core:restruct");
                }
            },
            "["() {
                const nnode = plugin.make(".json:array");
                this.act("core:insert", nnode);
                nnode.request("core:enter", this);
            },
            "s"() {
                const nnode = plugin.make(".json:string");
                this.act("core:insert", nnode);
                nnode.request("core:enter", this);
            },
            "n"() {
                const nnode = plugin.make(".json:number");
                this.act("core:insert", nnode);
                nnode.request("core:enter", this);
            },
            "b"() {
                const nnode = plugin.make(".json:boolean");
                this.act("core:insert", nnode);
                nnode.request("core:enter", this);
            },
        },
    },
})