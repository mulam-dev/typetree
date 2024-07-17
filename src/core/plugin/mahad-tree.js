const id = "core:mahad-tree";
const provides = ["mahad-tree"];
const requires = [
    "base",
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