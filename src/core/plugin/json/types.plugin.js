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

    async request_insert(anchor) {
        const id = await this.root.$require[".core:type-selector"].request(anchor, n => n.in(".json:") && !n.is(".json:key"));
        if (id) {
            const Node = this.root.$type[id];
            const nnode = Node();
            return nnode;
        } else {
            return null;
        }
    }

    make(id, data) {
        return this.root.$type[id](data);
    }
}
