export default {

".core:selection": {
    "handles.core:shortcut": {
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
            if (this.collapsed()) {
                this.shrink("bottom");
            } else {
                this.collapse("top");
            }
        },
        "Ctrl+ArrowDown"() {
            if (this.collapsed()) {
                this.shrink("top");
            } else {
                this.collapse("bottom");
            }
        },
        "Ctrl+ArrowLeft"() {
            if (this.collapsed()) {
                this.shrink("right");
            } else {
                this.collapse("left");
            }
        },
        "Ctrl+ArrowRight"() {
            if (this.collapsed()) {
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
            if (this.collapsed()) {
                this.expand_x();
                this.collapse("left");
            } else {
                this.expand_x();
                this.shrink("left");
            }
        },
        "End"() {
            if (this.collapsed()) {
                this.expand_x();
                this.collapse("right");
            } else {
                this.expand_x();
                this.shrink("right");
            }
        },
        "PageUp"() {
            if (this.collapsed()) {
                this.expand_y();
                this.collapse("top");
            } else {
                this.expand_y();
                this.shrink("top");
            }
        },
        "PageDown"() {
            if (this.collapsed()) {
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
    },
},

}