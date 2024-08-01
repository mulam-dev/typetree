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
    },
},

}