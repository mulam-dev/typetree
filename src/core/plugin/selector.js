const id = "#core:type-selector"
const provides = [".core:type-selector"]
const requires = {
}

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_must(plugins, requires);
    }

    // $core_type_loader = []

    // $core_rule_loader = []

    // $core_style_loader = []

    method() {
        // TODO
    }
}