export default plugin => ({
    /* 
        # 快速插入相关
    */

    ".json:array > .core:selection | .json:object > .core:selection": {
        "handles.core:shortcut.key": {
            "n | x"() {
                const nnode = plugin.make(".json:number");
                this.act("core:insert", nnode);
                this.request("core:select", nnode);
            },
            "c"() {
                const nnode = plugin.make(".json:string");
                this.act("core:insert", nnode);
                this.request("core:select", nnode);
            },
            "b"() {
                const nnode = plugin.make(".json:boolean");
                this.act("core:insert", nnode);
                this.request("core:select", nnode);
            },
            "[ | v"() {
                const nnode = plugin.make(".json:array");
                this.act("core:insert", nnode);
                this.request("core:enter", nnode);
            },
            "Shift+{ | h"() {
                const nnode = plugin.make(".json:object");
                this.act("core:insert", nnode);
                this.request("core:enter", nnode);
            },
            "Shift+("() {
                this.act("core:restruct");
            },
        },
    },
})