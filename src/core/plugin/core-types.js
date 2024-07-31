const id = "core:types:core";
const provides = ["core:types:core"];
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
            "frame",
            "text-field",
            "selection",
            "vector-cursor",
            "vector-range",
        ].map(p => `../type/${p}`);
    }

    $core_rule_loader_data() {
        return rules;
    }
}

import rules from "../rule/keymap.js";
