const id = "core:types:core";
const provides = ["types:core"];
const requires = [
    "type-loader",
];

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_must(plugins, ...requires);
    }

    $type_loader_data() {
        return [
            "frame",
        ].map(p => `../type/${p}`);
    }
}
