const id = "core:types:json";
const provides = ["types:json"];
const requires = [
    "base",
];

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_must(plugins, ...requires);
    }

    $type_loader_data() {
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
}
