const id = "core:node-parent";
const provides = ["node-parent"];
const requires = [
    "base",
    "mahad-tree",
];

export default class extends TypeTreePlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_must(plugins, ...requires);
    }

    init() {
    }
}