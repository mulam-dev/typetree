const id = "#trans:core:json"
const provides = [".trans:core:json", ".trans"]
const requires = {
}

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_essential(plugins, requires);
    }

    init() {
        Names("Array", {"zh-CN": "数组"});
        Names("Boolean", {"zh-CN": "布尔值"});
        Names("Key", {"zh-CN": "键"});
        Names("Null", {"zh-CN": "空值"});
        Names("Number", {"zh-CN": "数字"});
        Names("Object", {"zh-CN": "对象"});
        Names("String", {"zh-CN": "字符串"});
        Names("Column Increase", {"zh-CN": "增加列宽"});
        Names("Column Decrease", {"zh-CN": "减少列宽"});
        Names("Group", {"zh-CN": "分组"});
        Names("Flatten", {"zh-CN": "扁平化"});
        Names("Clear", {"zh-CN": "清除"});
        Names("Select All", {"zh-CN": "全选"});
        Names("Toggle", {"zh-CN": "开关"});
    }
}