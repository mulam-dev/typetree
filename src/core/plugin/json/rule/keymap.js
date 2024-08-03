export default {
    ".core:selection": {
        "handles.core:shortcut": {
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



            /*
                # 插入/编辑/删除相关
            */
            "Insert"() {
                this.collapse("right");
                this.act("core:insert");
            },
            "Shift+Insert"() {
                this.collapse("left");
                this.act("core:insert");
            },
            "Ctrl+Insert"() {
                this.collapse("bottom");
                this.act("core:insert");
            },
            "Ctrl+Shift+Insert"() {
                this.collapse("top");
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
                this.act("core:switch");
            },
        },
    },
}