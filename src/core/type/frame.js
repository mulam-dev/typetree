import { TypeTreeNode } from "../../node.js";

const id = "#core:frame";
const type = null;
const name = "Frame";

export default class extends TypeTreeNode {
    static id = id
    static type = type
    static name = name

    init(data) {
        this.data = data ?? [];
        this.data_name = [null];
        this.data_color = {};
        this.data_styles = [];

        this.elem =
            ME.div
                .$class([["core-frame"], this.data_styles.bmap(s => `f-${s}`)].bflat())
                .$style(this.data_color)
                .$inner
            (
                this.data.bmap(node =>
                    node instanceof TypeTreeNode ? node.elem : node
                )
            )();
    }

    name(value) {
        if (value !== undefined) {
            this.data_name.val = value;
            return this;
        } else {
            return this.data_name.val;
        }
    }

    color(hue, sat = 1, lum = 1) {
        const bobj = {mode: "hsl"};
        this.data_color.assign({
            "--color-fg":       format_color({...bobj, h: hue, s: sat, l: lum * 0.64}),
            "--color-bg":       format_color({...bobj, h: hue, s: sat, l: 0.56, alpha: 0.14}),
            "--color-stroke":   format_color({...bobj, h: hue, s: sat, l: lum * 0.64}),
            "--color-fill":     format_color({...bobj, h: hue, s: sat, l: 0.56, alpha: 0.14}),
        });
        return this;
    }

    style_on(...styles) {
        for (const style of styles) {
            if (!this.data_styles.includes(style)) {
                this.data_styles.postfix(style);
            }
        }
        return this;
    }

    style_off(...styles) {
        for (const style of styles) {
            this.data_styles.delete_at(style);
        }
        return this;
    }
}

const format_color = culori.formatHex8;
