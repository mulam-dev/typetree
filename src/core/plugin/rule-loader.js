const id = "core:rule-loader";
const provides = ["rule-loader"];
const requires = [];

/* 
    # 提供更便捷的规则导入方式
*/

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_must(plugins, ...requires);
    }

    load
}