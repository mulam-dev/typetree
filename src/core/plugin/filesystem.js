const id = "#core:filesystem"
const provides = [".core:filesystem"]
const requires = {
}

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_must(plugins, requires);
    }

    $core_view_data() {
        return {
            id,
            melem: ME.div(),
            name: Names("File System"),
        };
    }
}