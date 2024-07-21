const id = "#core:number";
const type = ".json:number";
const name = "Number";

export default class extends TypeTreeNode {
    static id = id
    static type = type
    static name = name

    init(data) {
        const {
            "#core:frame": frame,
        } = this.require;
        
        this.data = data ?? [0];

        this.struct =
            frame(this.data.bmap(v => v.toString()))
                .name(name)
                .color(83, 0.32)
                .style_on("inline", "code");
    }

    to_json() {
        return this.data[0];
    }
}