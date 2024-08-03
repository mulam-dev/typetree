const id = "#core:context-menu"
const provides = [".core:context-menu"]
const requires = {
    icon: ".core:icon-loader",
}

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_essential(plugins, requires);
    }

    selections = [].listen(null, () => this.update())

    c_icon = this.require.icon.load;

    m_entries = []

    melem = div.class(cname("root"))(
        div.class(cname("actions")).$inner(this.m_entries.bmap(actions => {
            let enabled, act;
            const [primary_action, primary_node] = actions.val;
            if (primary_action.unique) {
                if (primary_action.enabled(primary_node)) {
                    enabled = true;
                    act = () => primary_action.do_call(primary_node);
                } else {
                    enabled = false;
                }
            } else {
                actions = actions.filter(([action, node]) => action.enabled(node));
                if (actions.length) {
                    enabled = true;
                    act = () => actions.forEach(([action, node]) => action.do_call(node));
                } else {
                    enabled = false;
                }
            }
            return div
                .class(cname("entry"), "s-item", ...(enabled ? [] : ["f-disabled"]))
                .$on({
                    "click": () => {
                        if (enabled) {
                            act();
                            this.update();
                        }
                    },
                })(
                    this.c_icon(primary_action.icon ?? "automation"),
                    primary_action.name.get(),
                )
        }))()
    )

    ".core:view"() {
        return {
            id,
            icon: "pointer-plus",
            melem: this.melem,
            name: Names("Context Menu"),
        };
    }

    update() {
        const acts = {};
        for (const sel of this.selections) {
            const sel_acts = sel.attrs_merged("actions");
            for (const path in sel_acts) {
                acts[path] ??= [];
                acts[path].push([sel_acts[path], sel]);
            }
            for (const node of sel.data_nodes) {
                const node_acts = node.attrs_merged("actions");
                for (const path in node_acts) {
                    acts[path] ??= [];
                    acts[path].push([node_acts[path], node]);
                }
            }
        }
        this.m_entries.assign(Object.values(acts));
    }

    set(selections) {
        this.selections.assign(selections);
    }
}

const {div} = ME;
const cname = name => "core-context-menu-" + name;