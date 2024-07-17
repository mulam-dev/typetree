const id = "core:timeline";
const provides = ["timeline"];
const requires = [
    "base",
    "node-path",
    "view",
];

export default class extends TypeTreePlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_must(plugins, ...requires);
    }

    /* 
        # 时间线栈
        用来记录所有节点的修改记录，新记录添加在尾端
    */
    timeline = [];

    $view_data() {
        return {
            id,
            root: ME.div(),
            name: "时间线",
        };
    }
}