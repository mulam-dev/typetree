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
        ].map(p => `../type/${p}`);
    }
}
