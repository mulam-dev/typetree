const id = "#trans:core:context-menu"
const provides = [".trans:core:context-menu", ".trans"]
const requires = {
}

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_essential(plugins, requires);
    }

    init() {
        Names("Multi-nodes", {"zh-CN": "多个节点"});
    }
}