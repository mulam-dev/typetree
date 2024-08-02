const id = "core:timeline";
const provides = ["core:timeline"];
const requires = [
    "core:view",
];

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_must(plugins, ...requires);
    }

    /* 
        # 撤销栈
        用来记录所有节点的修改记录，新记录添加在尾端
    */
    undos = []

    /* 
        # 恢复栈
        撤销的记录被放置到这里，新记录添加在首端
    */
    redos = []

    $core_view_data() {
        return {
            id,
            melem: div.class(cname("root"), "core-layout-s-scrollbar")(
                div.class(cname("stack"), "f-undos").$inner(
                    this.undos.bmap(entry =>
                        div
                            .class(cname("entry"))
                            .$on({
                                click: () => {
                                    const index = this.undos.indexOf(entry);
                                    const stack = [];
                                    for (let i = this.undos.length - 1; i >= index; i--) {
                                        const [path, moder, opts] = this.undos[i];
                                        const imoder = moder.inverse();
                                        imoder.id = moder.id;
                                        imoder.call(this.root.ref(path));
                                        stack.push([path, imoder, opts]);
                                    }
                                    this.undos.delete(index, this.undos.length - index);
                                    this.redos.prefix(...stack.reverse());
                                },
                            })
                        (`${entry[2].node_name}: ${snake_case_to_name_case(entry[1].id)}`)
                    ),
                )(),
                div.class(cname("stack"), "f-redos").$inner(
                    this.redos.bmap(entry =>
                        div
                            .class(cname("entry"))
                            .$on({
                                click: () => {
                                    const index = this.redos.indexOf(entry);
                                    const stack = [];
                                    for (let i = 0; i <= index; i++) {
                                        const [path, moder, opts] = this.redos[i];
                                        const imoder = moder.inverse();
                                        imoder.id = moder.id;
                                        imoder.call(this.root.ref(path));
                                        stack.push([path, imoder, opts]);
                                    }
                                    this.redos.delete(0, index + 1);
                                    this.undos.suffix(...stack);
                                },
                            })
                        (`${entry[2].node_name}: ${snake_case_to_name_case(entry[1].id)}`)
                    ),
                )(),
            ),
            name: Names("Timeline"),
        };
    }

    $core_rule_loader_data = {
        "*": {
            "handles.core:mod"(p, moder) {
                this.$require["core:timeline"].push(this, moder);
            },
        },
    };

    push(node, moder) {
        this.redos.clear();
        const path = node.path;
        this.undos.suffix([path, moder, {node_name: node.constructor.name}]);
    }
}

const {div} = ME;
const cname = name => "core-timeline-" + name;
const snake_case_to_name_case = str => str[0].toUpperCase() + str.slice(1).toLowerCase().replace(/(_\w)/g, m => ' ' + m[1].toUpperCase());