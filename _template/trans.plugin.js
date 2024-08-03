const id = "#trans:core:_template_"
const provides = [".trans:core:_template_", ".trans"]
const requires = {
}

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_essential(plugins, requires);
    }

    init() {
        Names("_template_", {"_locale_": "_template_"});
    }
}