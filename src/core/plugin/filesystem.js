const id = "core:filesystem";
const provides = ["filesystem"];
const requires = [
    "base",
    "view",
];

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_must(plugins, ...requires);
    }

    $view_data() {
        return {
            id,
            melem: ME.div(),
            name: Names("File System"),
        };
    }
}