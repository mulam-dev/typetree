const id = "#types:core:json"
const provides = [".types:json", ".types"]
const requires = [
    ".types:core:basic",
]

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_essential(plugins, requires);
    }

    ".core:type-loader" = [
        "type/null",
        "type/boolean",
        "type/string",
        "type/number",
        "type/object",
        "type/key",
        "type/array",
    ]

    ".core:rule-loader" = [
        "rule/action",
        "rule/type",
        "rule/keymap",
    ];

    ".core:style-loader" = [
        "style/array",
        "style/key",
        "style/number",
        "style/object",
    ];
}
