const id = "core:types:core";
const provides = ["types:core"];
const requires = [
    "base",
];

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_must(plugins, ...requires);
    }

    async init() {
        const {import_type} = this.require["base"];
        
        const type_list = [
            "frame",
        ];
        const types = await Promise.all(type_list.map(
            async path => (await import(`../type/${path}.js`)).default,
        ));
        import_type(...types);
    }
}
