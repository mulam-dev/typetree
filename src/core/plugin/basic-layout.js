const id = "core:basic-layout";
const provides = ["basic-layout"];
const requires = [
    "base",
    "view",
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