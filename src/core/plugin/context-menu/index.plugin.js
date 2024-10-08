const id = "#core:context-menu"
const provides = [".core:context-menu"]
const requires = {
    icon: ".core:icon-loader",
    popup: ".core:popup",
}

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_essential(plugins, requires);
    }

    selections = [].guard(null,
        sel => sel.data_nodes.listen(this, () => this.update()),
        sel => sel.data_nodes.unlisten(this),
    ).listen("listen", () => this.update())

    c_icon = this.require.icon.load;

    m_entries = []

    melem = div.class(cname("root"), "s-frame")(
        div.class(cname("actions")).$inner(this.m_entries.bmap(({enabled, act, node_name, action_name, icon}) => {
            return div
                .class(cname("entry"), "s-item", ...(enabled ? [] : ["f-disabled"]))
                .$on({
                    "click": () => {
                        this.data_popup.clear();
                        act();
                    },
                })(
                    this.c_icon(icon),
                    `${node_name}: ${action_name}`,
                )
        }))()
    )

    data_popup = [].guard(null, null, popup => popup.free())

    update() {
        const selections = this.selections;
        const acts = {};
        const unique_acts = [];
        for (const sel of selections) {
            const sel_acts = sel.attrs_merged("actions");
            for (const path in sel_acts) {
                const action = sel_acts[path];
                if (action.unique) {
                    if (selections.length === 1) {
                        unique_acts.push([[action, sel]]);
                    }
                } else {
                    acts[path] ??= [];
                    acts[path].push([action, sel]);
                }
            }
            const nodes = sel.data_nodes;
            for (const node of nodes) {
                const node_acts = node.attrs_merged("actions");
                for (const path in node_acts) {
                    const action = node_acts[path];
                    if (action.unique) {
                        if (selections.length === 1 && nodes.length === 1) {
                            unique_acts.push([[action, node]]);
                        }
                    } else {
                        acts[path] ??= [];
                        acts[path].push([action, node]);
                    }
                }
            }
        }
        const acts_set = [].concat(unique_acts, Object.values(acts));
        const entries = acts_set.map(actions => {
            const action_names = new Set(), node_names = new Set();
            for (const [action, node] of actions) {
                action_names.add(action.name.get());
                node_names.add(node.constructor.name.get());
            }
            const enabled_actions = actions.filter(([action, node]) => action.enabled(node));
            return {
                enabled: enabled_actions.length > 0,
                act: () => enabled_actions.forEach(([action, node]) => action.do_call(node)),
                icon: actions[0][0].icon ?? "automation",
                action_name: [...action_names.values()].join('/'),
                node_name: node_names.size === 1 ? node_names.values().next().value : Names("Multi-nodes").get(),
            }
        });
        this.m_entries.assign(entries);
    }

    async popup(x, y, selections) {
        const {popup: Popup} = this.require.popup;

        this.selections.assign(selections);

        const popup = Popup(document.body, this.melem, {
            offset_x: x,
            offset_y: y,
        });
        this.data_popup.val = popup;
        await popup.wait_free();
        this.data_popup.clear();
    }
}

const {div} = ME;
const cname = name => "core-context-menu-" + name;