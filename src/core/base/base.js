const id = "#core:base"
const provides = [".core:base"]
const requires = {
}

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return [
            ...this.req_essential(plugins, requires),
            ...this.req_optional(plugins, [".trans"]),
        ];
    }

    import_type(...types) {
        for (const type of types) {
            this.root.types.suffix(type);
            this.root.type_map.modify(type.id, type);
            for (const klass of type.provides) {
                this.root.type_map.modify(klass, type);
            }
        }
    }

    import_rule(...rules) {
        this.root.rules.suffix(...rules);
    }

    async get_plugins_prop(key) {
        return (await Promise.all(this.root.plugins
            .map(plugin => {
                const data = plugin[key];
                if (data !== null && data !== undefined) {
                    return data.call ? data.call(plugin) : data;
                }
            })
            .filter(p => p)
        ));
    }

    async collect_plugins_prop(key) {
        return (await this.get_plugins_prop(key))
            .flatMap(data => data instanceof Array ? data : [data]);
    }

    async call_plugins_prop(key, ...args) {
        return (await Promise.all(this.root.plugins
            .map(plugin => plugin[key]?.bind(plugin))
            .filter(p => p)
            .map(h => h(...args))
        ));
    }

    async for_plugins_prop(key, handle) {
        return (await Promise.all(this.root.plugins
            .map(plugin => {
                const data = plugin[key];
                if (data !== null && data !== undefined) {
                    return [plugin, data.call ? data.call(plugin) : data];
                }
            })
            .filter(p => p)
            .map(([plugin, data]) => handle(plugin, data))
        ));
    }
}