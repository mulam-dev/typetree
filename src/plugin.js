const get_plugin_class = p => p instanceof TypeTreePlugin ? p.constructor : p;

export class TypeTreePlugin {
    static req_must(plugins, ...traits) {
        const res = [];
        for (const trait of traits) {
            const plugin = plugins.find(p => get_plugin_class(p).provides.includes(trait));
            if (plugin) {
                res.push(plugin);
            } else {
                throw new Error(`Unsatisfied requirements: trait "${trait}" not found`);
            }
        }
        return res;
    }

    constructor(editor, plugins) {
        this['#'] = this.constructor.id;
        this.root = editor;
        this.require = Object.fromEntries(
            this.constructor.requires(plugins)
                .flatMap(p => p.constructor.provides.map(t => [t, new Proxy(p, plugin_proxyer)])),
        );
    }
}

const plugin_proxyer = {
    get(tar, p) {
        const res = Reflect.get(tar, p);
        return res.bind?.(tar) ?? res;
    },
};