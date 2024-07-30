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
        # 时间线栈
        用来记录所有节点的修改记录，新记录添加在尾端
    */
    timeline = []

    $core_view_data() {
        return {
            id,
            melem: ME.div(),
            name: Names("Timeline"),
        };
    }
}