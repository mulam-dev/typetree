import { Editor } from "./editor.js";
import { TypeTreePlugin } from "./plugin.js";

(async global => {

    global.Editor = new Editor();
    global.TypeTreePlugin = TypeTreePlugin;

    /* 
        # 加载插件
    */

    // 从 plugin.json 文件中读取要加载的插件列表
    const plugin_list = await (await fetch("./plugins.json")).json() ;
    const plugins = await Promise.all(plugin_list.map(
        async path => (await import(`./${path}.js`)).default,
    ));

    // 分析插件的依赖关系并重排插件的加载顺序
    const sorted_plugins = [...plugins];
    const req_cache = Symbol();
    for (const plugin of plugins) {
        const requires = plugin.requires(plugins);
        plugin[req_cache] = requires;
        for (const req of requires) {
            const i_self = sorted_plugins.indexOf(plugin);
            const i_req = sorted_plugins.indexOf(req);
            if (i_self < i_req) {
                sorted_plugins.move(i_req, 1, i_self - i_req);
            }
        }
    }

    // 实例化插件
    const plugin_instances = [];
    for (const plugin of sorted_plugins) {
        const instance = new plugin(
            global.Editor,
            plugin_instances,
        );
        plugin_instances.postfix(instance);
    }

    // 装载到编辑器
    global.Editor.plugins.assign(plugin_instances);

    // 初始化插件
    let loaders = [];
    await Promise.all(plugin_instances.map(async instance => {
        const next_loader = await instance.init?.();
        if (next_loader) loaders.push(next_loader);
    }));

    // 多阶段执行插件请求的初始化回调
    while (loaders.length) {
        const next_loaders = [];
        await Promise.all(loaders.map(async loader => {
            const next_loader = await loader();
            if (next_loader) next_loaders.push(next_loader);
        }));
        loaders = next_loaders;
    }
    console.log(plugin_instances);

})(globalThis);

if (native) native.app.show_window();
else import("./test.js");