const id = "#core:types:json"
const provides = [".types:json"]
const requires = [
    ".core:types:basic",
]

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_must(plugins, requires);
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
