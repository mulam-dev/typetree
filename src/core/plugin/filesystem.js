const id = "core:filesystem";
const provides = ["filesystem"];
const requires = [
    "base",
    "view",
];

export default class extends TypeTreePlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_must(plugins, ...requires);
    }

    $view_data() {
        return {
            id,
            elem: ME.div(),
            name: Names("File System"),
        };
    }
}