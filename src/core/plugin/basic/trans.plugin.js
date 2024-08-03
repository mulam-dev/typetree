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
        Names("Context Menu", {"zh-CN": "功能选单"});
        Names("Selection", {"zh-CN": "选区"});
        Names("Multi-nodes", {"zh-CN": "多个节点"});
    }
}