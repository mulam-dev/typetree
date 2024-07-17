export class Editor {
    constructor() {
        this.init();
    }
    init() {
        /* 
            # 内部节点
            存储当前在编辑的所有顶级节点，一般是文件节点
        */
        this.inner = [];

        /* 
            # 插件
            为编辑器提供热插拔的、独立于Tree之外的特性或功能
        */
       this.plugins = [];
    }
}