import { TTPack, TTNode } from "../../node.js";

const id = "#core:frame";
const type = null;
const name = "Frame";

export default class extends TTNode {
    static id = id
    static type = type
    static name = name

    static handles = {...this.handles,
        "core:dom-event:mousedown"(p, e) {
            this.parent.request_parent(p.repack(["core:inner-active", this.parent])).closed.val ||
            this.parent.request(p.repack(["core:active"])).closed.val ||
            this.$require.caret.set(this.parent, [this.parent]);
            p.close();
        },
    }

    init(data) {
        this.data = data ?? [];
        this.data_name = [null];
        this.data_color = {};
        this.data_styles = [];

        const reciver = recv_dom_event(this);

        this.melem =
            ME.div
                .$class([["core-frame"], this.data_styles.bmap(s => `f-${s}`)].bflat())
                .$style(this.data_color)
                .$on({
                    "mousedown": reciver,
                })
                .$inner
            (
                this.data.bmap(node =>
                    node instanceof TTNode ? node.melem : node
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
        this.data_color.assign({
            "--fc-fg": `hsl(${hue}deg ${sat * 100}% calc(var(--fc-l-fbase) + var(--fc-l-fdir) * ${lum * 100}%))`,
            "--fc-bg": `hsl(${hue}deg ${sat * 160}% calc(var(--fc-l-fbase) + var(--fc-l-fdir) * ${lum * 100}%) / calc(var(--fc-l-fbase) * 0.32))`,
            "--fc-fill": `hsl(${hue}deg ${sat * 160}% calc(var(--fc-l-fbase) + var(--fc-l-fdir) * ${lum * 100}%) / 24%)`,
        });
        return this;
    }

    style_on(...styles) {
        for (const style of styles) {
            if (!this.data_styles.includes(style)) {
                this.data_styles.suffix(style);
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
const s_close_dom_event = Symbol("close_dom_event");
const recv_dom_event = self => e => {
    const pack = TTPack.create([`core:dom-event:${e.type}`, e]);
    pack.closed.guard(s_close_dom_event, v => v && (e.preventDefault(), e.stopPropagation()));
    self.request(pack);
};
