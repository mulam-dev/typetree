const id = "#core:text-field";
const extend = "#core:frame";
const provides = [];
const name = Names("Text Field");

const Super = await TTNode.Class(extend);
export default class extends Super {
    static id = id
    static provides = provides
    static uses = [id, ...provides, ...Super.uses]
    static name = name

    static rule = {
        "handles.core:active"(p) {
            this.edit();
            setTimeout(() => {
                this.focus();
            }, 0);
        },
    }

    init(data) {
        this.data = data ?? [''];
        this.data_name = [null];
        this.data_color = [];
        this.data_styles = [];
        this.data_editable = [].guard(null, toggle => {
            const {elem} = this.struct_ref("content");
            if (toggle) {
                elem.setAttribute("contentEditable", "true");
                elem.setAttribute("spellcheck", "false");
                elem.setAttribute("draggable", "false");
                elem.setAttribute("tabIndex", -1);
            } else {
                elem.removeAttribute("contentEditable");
                elem.removeAttribute("spellcheck");
                elem.removeAttribute("draggable");
                elem.removeAttribute("tabIndex");
                this.parent?.request("core:text-field.edit", this.struct_ref("content").elem.textContent);
            }
        });
    }

    struct($) {
        let selecting = false;
        const melem = ME.div
            .$class([
                ["core-frame", "f-editable"],
                this.data_color,
                this.data_styles,
            ].bflat())
        (
            $("content", ME.span
                .$on({
                    "blur": () => {
                        if (!selecting) this.edit(false);
                    },
                    "keydown": e => {
                        const kill = () => {
                            e.stopPropagation();
                            e.preventDefault();
                        };
                        switch (e.code) {
                            case "Enter":
                                if (!e.shiftKey) {
                                    kill();
                                    this.parent?.request("core:text-field.escape");
                                }
                                break;
                            case "Tab":
                                kill();
                                this.parent.request("core:text-field.escape");
                                break;
                        };
                    },
                    "dragover": e => {
                        e.preventDefault();
                        return false;
                    },
                    "drop": e => {
                        e.preventDefault();
                        return false;
                    },
                    "mousedown": () => {
                        selecting = true;
                        const up_handle = e => {
                            selecting = false;
                            jQuery(document).off("mouseup", up_handle);
                            if (jQuery(e.target).closest(this.melem.elem).length === 0) {
                                this.edit(false);
                            }
                        }
                        jQuery(document).on("mouseup", up_handle);
                    },
                })
                .$text(this.data)
            ()),
        );
        melem.elem.node = this;
        return melem;
    }

    prefix(str) {
        this.melem.attr("data-prefix").val = str;
        return this;
    }

    suffix(str) {
        this.melem.attr("data-suffix").val = str;
        return this;
    }

    select_all() {
        this.edit();
        setTimeout(() => {
            this.focus();
            this.struct_ref("content").select();
        }, 0);
    }

    focus() {
        this.struct_ref("content").focus({
            preventScroll: true,
        });
    }

    edit(editable = true) {
        this.data_editable.val = editable;
    }
}