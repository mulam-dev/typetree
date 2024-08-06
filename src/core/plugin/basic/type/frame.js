const id = "#core:frame";
const extend = null;
const provides = [];
const name = Names("Frame");

const Super = await TTNode.Class(extend);
export default class extends Super {
    static id = id
    static provides = provides
    static uses = [id, ...provides, ...Super.uses]
    static name = name

    init(data) {
        this.data = data ?? [];
        this.data_name = [null];
        this.data_color = [];
        this.data_styles = [];

        this.melem =
            ME.div
                .$class([
                    ["core-frame"],
                    this.data_styles.bmap(s => `f-${s}`),
                    this.data_color,
                ].bflat())
                .$inner
            (
                this.data.bmap(node =>
                    node instanceof TTNode ? node.melem : node
                )
            )();
        
        this.melem.elem.node = this;
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
        this.data_color.val = color_to_class([hue, sat, lum]);
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

const color_to_class = color => {
    const id = color.join(' ');
    if (id in color_map) {
        return color_map[id];
    } else {
        const c = `fc${signed_colors.length}`;
        signed_colors.suffix(color);
        color_map[id] = c;
        return c;
    }
};
const color_map = {};
const signed_colors = [];
const signed_classes = signed_colors.bmap(([hue, sat, lum], index) => ({
    query: `.fc${index}`,
    style: `
        --fc-fg: hsl(${hue}deg ${sat * 130}% calc(var(--fc-l-fbase) + var(--fc-l-fdir) * ${lum * 100}%));
        --fc-bg: hsl(${hue}deg ${sat * 160}% calc(var(--fc-l-fbase) + var(--fc-l-fdir) * ${lum * 100}%) / calc(var(--fc-l-fbase) * 0.32));
        --fc-stroke: hsl(${hue}deg ${sat * 100}% calc(var(--fc-l-fbase) + var(--fc-l-fdir) * ${lum * 80}%) / 50%);
        --fc-fill: hsl(${hue}deg ${sat * 160}% calc(var(--fc-l-fbase) + var(--fc-l-fdir) * ${lum * 100}%) / 24%);
    `,
}));
ME.style.$html(
    signed_classes.bmap(({query, style}) => `${query.trim()} { ${style.trim()} }`).btrans([], rules => [rules.join(' ')]),
)().attach(document.head);