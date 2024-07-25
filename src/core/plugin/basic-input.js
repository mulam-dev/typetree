const id = "core:basic-input";
const provides = ["input"];
const requires = [
    "base",
    "init-manager",
    "layout",
];

export default class extends TypeTreePlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_must(plugins, ...requires);
    }

    init() {
        const {after} = this.require["init-manager"];
        after(
            this.require["layout"].loaded,
            () => this.load(),
        );
    }

    load() {
        const layout = this.require["layout"];
    }
}
