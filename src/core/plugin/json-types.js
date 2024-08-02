const id = "core:types:json";
const provides = ["core:types:json"];
const requires = [
    "core:type-loader",
];

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_must(plugins, ...requires);
    }

    $core_type_loader_data() {
        return [
            "null",
            "boolean",
            "string",
            "number",
            "object",
            "key",
            "array",
        ].map(p => `../type/${p}`);
    }

    $core_rule_loader_data = rules;
}

import rules from "../rule/json.js";
