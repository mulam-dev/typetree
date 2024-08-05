const id = "#core:timeline"
const provides = [".core:timeline"]
const requires = {
    icon: ".core:icon-loader",
}

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_essential(plugins, requires);
    }

    ".core:rule-loader" = [
        "rule",
    ]

    ".core:style-loader" = [
        "style",
    ]

    ".core:shortcut:code" = {
        "Ctrl+KeyZ"() {
            this.undo(1);
        },
        "Ctrl+Shift+KeyZ"() {
            this.redo(1);
        },
    }

    /* 
        # 撤销栈
        用来记录所有节点的修改记录，新记录添加在尾端
    */
    data_undos = []

    /* 
        # 恢复栈
        撤销的记录被放置到这里，新记录添加在首端
    */
    data_redos = []

    c_icon = this.require.icon.load

    ".core:view"() {
        return {
            id,
            icon: "history",
            melem: div.class(cname("root"), "s-scrollbar")(
                div.class(cname("stack"), "f-undos").$inner(
                    this.data_undos.bmap(entry =>
                        div
                            .class(cname("entry"), "s-item")
                            .$on({
                                click: () => this.undo(this.data_undos.length - this.data_undos.indexOf(entry)),
                            })
                        (this.c_icon("arrow-back-up"), `${entry[2].node_name}: ${snake_case_to_name_case(entry[1].id)}`)
                    ),
                )(),
                div.class(cname("stack"), "f-redos").$inner(
                    this.data_redos.bmap(entry =>
                        div
                            .class(cname("entry"), "s-item")
                            .$on({
                                click: () => this.redo(this.data_redos.indexOf(entry) + 1),
                            })
                        (this.c_icon("arrow-forward-up"), `${entry[2].node_name}: ${snake_case_to_name_case(entry[1].id)}`)
                    ),
                )(),
            ),
            name: Names("Timeline"),
        };
    }

    push(node, moder) {
        this.data_redos.clear();
        const path = node.path;
        this.data_undos.suffix([path, moder, {node_name: node.constructor.name.get()}]);
    }

    undo(step) {
        const undos = this.data_undos.delete(this.data_undos.length - step, step).reverse();
        this.data_redos.prefix(...undos.map(([path, moder, opts]) => {
            const imoder = moder.inverse();
            imoder.id = moder.id;
            imoder.call(this.root.ref(path));
            return [path, imoder, opts];
        }).reverse());
    }

    redo(step) {
        const redos = this.data_redos.delete(0, step);
        this.data_undos.suffix(...redos.map(([path, moder, opts]) => {
            const imoder = moder.inverse();
            imoder.id = moder.id;
            imoder.call(this.root.ref(path));
            return [path, imoder, opts];
        }));
    }
}

const {div} = ME;
const cname = name => "core-timeline-" + name;
const snake_case_to_name_case = str => str[0].toUpperCase() + str.slice(1).toLowerCase().replace(/(_\w)/g, m => ' ' + m[1].toUpperCase());