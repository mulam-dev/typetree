const id = "#core:icon-loader"
const provides = [".core:icon-loader"]
const requires = {
}

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_essential(plugins, requires);
    }

    cache = {}

    async load(name) {
        if (!(name in this.cache)) {
            this.cache[name] = jQuery(await (await fetch(`res/tabler-icons/${name}.svg`)).text());
        }
        return this.cache[name].clone()[0];
    }
}