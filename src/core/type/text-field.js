const id = "#core:text-field";
const type = null;
const name = "Text Field";

import frame from "./frame.js";

export default class extends frame {
    static id = id
    static type = type
    static name = name

    static handles = {...this.handles,
        "core:active"() {
            setTimeout(() => {
                this.melem_content.focus();
            }, 0);
        },
    }

    init(data) {
        this.data = data ?? [];
        this.data_name = [null];
        this.data_color = {};
        this.data_styles = [];

        this.melem_content =
            ME.span
                .content_editable("true")
                .spellcheck("false")
                .draggable("false")
                .tab_index(-1)
                .$on({
                    "input": () => {
                        setTimeout(() => {
                            const {elem} = this.melem_content;
                            const selection = window.getSelection();
                            const range = selection.getRangeAt(0);

                            const preSelectionRange = range.cloneRange();
                            preSelectionRange.selectNodeContents(elem);
                            preSelectionRange.setEnd(range.startContainer, range.startOffset);
                            const start = preSelectionRange.toString().length;
    
                            elem.textContent = elem.textContent;
    
                            const newRange = document.createRange();
                            newRange.setStart(elem.firstChild ?? elem, start);
                            newRange.collapse(false);
                            selection.removeAllRanges();
                            selection.addRange(newRange);
                        }, 0);
                    },
                    "paste": e => {
                        e.preventDefault();
                        const text = (e.clipboardData || window.clipboardData).getData('text');
                        document.execCommand('insertText', false, text);
                    },
                    "blur": () => this.parent?.request("core:text-field.edit", this.melem_content.elem.textContent),
                })
                .$text(this.data)();
        this.melem =
            ME.div
                .$class([["core-frame", "f-editable"], this.data_styles.bmap(s => `f-${s}`)].bflat())
                .$style(this.data_color)
            (
                this.melem_content,
            );

        this.melem.elem.node = this;
    }

    prefix(str) {
        this.melem.attr("data-prefix").val = str;
        return this;
    }

    suffix(str) {
        this.melem.attr("data-suffix").val = str;
        return this;
    }
}