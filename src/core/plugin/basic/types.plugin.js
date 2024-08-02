const id = "core:types:basic"
const provides = ["core:types:basic"]
const requires = {
}

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_must(plugins, requires);
    }

    $core_type_loader = [
        "type/frame",
        "type/text-field",
        "type/selection",
        "type/vector-cursor",
        "type/vector-range",
    ]

    $core_rule_loader = [
    ]

    $core_style_loader = [
        "style/context-menu",
        "style/cursor",
        "style/frame",
        "style/layout",
        "style/range",
        "style/selector",
        "style/text-field",
    ]
}
