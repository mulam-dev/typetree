const id = "#core:filesystem"
const provides = [".core:filesystem"]
const requires = {
}

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_essential(plugins, requires);
    }

    ".core:view"() {
        return {
            id,
            melem: ME.div(),
            name: Names("File System"),
        };
    }
}