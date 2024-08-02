const id = "core:mahad-tree";
const provides = ["core:mahad-tree"];
const requires = [];

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_must(plugins, ...requires);
    }

    init() {
    }
}