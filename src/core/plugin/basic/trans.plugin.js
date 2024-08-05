const id = "#trans:core:basic"
const provides = [".trans:core:basic", ".trans"]
const requires = {
}

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_essential(plugins, requires);
    }

    init() {
        Names("Editor", {"zh-CN": "编辑器"});
        Names("Selection", {"zh-CN": "选区"});
    }
}