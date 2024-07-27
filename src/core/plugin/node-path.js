const id = "core:node-path";
const provides = ["node-path"];
const requires = [
    "base",
    "node-parent",
];

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_must(plugins, ...requires);
    }

    init() {
    }
}