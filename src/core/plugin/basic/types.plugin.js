const id = "#types:core:basic"
const provides = [".types:core:basic", ".types"]
const requires = {
}

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_essential(plugins, requires);
    }

    ".core:type-loader" = [
        "type/frame",
        "type/text-field",
        "type/selection",
        "type/vector-cursor",
        "type/vector-range",
    ]

    ".core:rule-loader" = [
    ]

    ".core:style-loader" = [
        "style/context-menu",
        "style/cursor",
        "style/frame",
        "style/layout",
        "style/range",
        "style/selector",
        "style/text-field",
    ]
}
