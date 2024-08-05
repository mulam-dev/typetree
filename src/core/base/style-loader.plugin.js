const id = "#core:style-loader"
const provides = [".core:style-loader"]
const requires = {
    base: ".core:base",
}

/* 
    # 提供更便捷的样式导入方式
*/

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_essential(plugins, requires);
    }

    init() {
        return () => this.load();
    }

    async load() {
        const {for_plugins_prop} = this.require.base;

        (await for_plugins_prop(provides.val, (plugin, paths) => Promise.all(paths.map(
            async path => jQuery(`<link rel="stylesheet" href="${plugin.constructor.dir + path}.css">`),
        )))).forEach(link => jQuery(document.head).append(link));
    }
}