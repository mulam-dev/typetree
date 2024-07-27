const id = "core:base";
const provides = ["base"];
const requires = [];

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_must(plugins, ...requires);
    }

    import_type(...types) {
        for (const type of types) {
            this.root.types.set(type.id, type);
            if (type.type) this.root.types.set(type.type, type);
        }
    }
}