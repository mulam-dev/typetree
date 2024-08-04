const id = "#core:type-selector"
const provides = [".core:type-selector"]
const requires = {
}

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_essential(plugins, requires);
    }

    // ".core:style-loader" = []

    melem = div
        .class(cname("root"))
    ()

    // request()
}

const {div} = ME;
const cname = name => "core-type-selector-" + name;