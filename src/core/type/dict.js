const id = "#core:dict";
const type = ".json:dict";
const name = "Dict";

export default class extends TypeTreeNode {
    static id = id
    static type = type
    static name = name

    init(data) {
        const {
            "#core:frame": frame,
            "#core:grid": grid,
        } = this.require;

        this.data = data ?? [];

        this.struct =
            frame([
                grid(
                    this.data.bclone(),
                )
            ]).name(name);
    }

    to_json() {
        Object.fromEntries(this.data.map(([k, v]) => [k.to_json(), v.to_json()]));
    }
}