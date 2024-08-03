const id = "#trans:core:timeline"
const provides = [".trans:core:timeline", ".trans"]
const requires = {
}

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_essential(plugins, requires);
    }

    init() {
        Names("Timeline", {
            "zh-CN": "时间线",
        });
    }
}