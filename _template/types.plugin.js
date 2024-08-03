const id = "#types:core:_template_"
const provides = [".types:_template_", ".types"]
const requires = [
]

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_essential(plugins, requires);
    }

    ".core:type-loader" = [
    ]

    ".core:rule-loader" = [
    ];

    ".core:style-loader" = [
    ];
}
