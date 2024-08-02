const id = "core:context-menu"
const provides = ["core:context-menu"]
const requires = {
}

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_must(plugins, requires);
    }

    selections = []

    m_entries = this.selections.btrans([], (sels, $) => {
        const acts = {};
        for (const sel of sels) {
            const sel_acts = sel.attrs_merged("actions");
            for (const path in sel_acts) {
                acts[path] ??= [];
                acts[path].push([sel_acts[path], sel]);
            }
            $(sel.data_nodes);
            for (const node of sel.data_nodes) {
                const node_acts = node.attrs_merged("actions");
                for (const path in node_acts) {
                    acts[path] ??= [];
                    acts[path].push([node_acts[path], node]);
                }
            }
        }
        return Object.values(acts);
    })

    melem = div.class(cname("root"))(
        div.class(cname("actions")).$inner(this.m_entries.bmap(data =>
            div
                .class(cname("entry"), "s-item")
                .$on({
                    "click"() {
                        data.forEach(([action, node]) => action.call(node));
                    },
                })
            (icon("automation"), data[0][0].name.get())
        ))()
    )

    $core_view_data() {
        return {
            id,
            icon: "menu-2",
            melem: this.melem,
            name: Names("Context Menu"),
        };
    }

    set(selections) {
        this.selections.assign(selections);
    }
}

const {div} = ME;
const cname = name => "core-context-menu-" + name;
const icon = async name => jQuery(await (await fetch(`res/tabler-icons/${name}.svg`)).text());