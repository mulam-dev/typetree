export default {
    ".json:boolean": {
        "actions": {
            "core:toggle": class extends TTAction {
                static name = Names("Toggle")
                static call(node) {
                    node.mod.toggle();
                }
            },
        },
    },

    ".json:string": {
        "actions": {
            "core:select-all": class extends TTAction {
                static name = Names("Select All")
                static unique = true
                static call(node) {
                    node.mod.select_all();
                }
            },
        },
    },

    ".json:key": {
        "actions": {
            "core:select-all": class extends TTAction {
                static name = Names("Select All")
                static unique = true
                static call(node) {
                    node.mod.select_all();
                }
            },
        },
    },

    ".json:number": {
        "actions": {
        },
    },

    ".json:null": {
        "actions": {
        },
    },

    ".json:array": {
        "actions": {
            "core:column-increase": class extends TTAction {
                static name = Names("Column Increase")
                static varify(node) {
                    return node.data_column.val < node.data.length;
                }
                static call(node) {
                    node.data_column.val += 1;
                }
            },
            "core:column-decrease": class extends TTAction {
                static name = Names("Column Decrease")
                static varify(node) {
                    return node.data_column.val > 1;
                }
                static call(node) {
                    node.data_column.val -= 1;
                }
            },
            "core:group": class extends TTAction {
                static name = Names("Group")
                static call(node) {
                    const Array = node.$type[".json:array"];
                    const column = node.data_column.val;
                    const data = [...node.data];
                    const group = [];
                    node.mod.modify(0, data.length, []);
                    for (let i = 0; i < data.length; i += column) {
                        group.push(data.slice(i, i + column));
                    }
                    const ndata = group.map(_ => Array([]));
                    node.mod.modify(0, 0, ndata);
                    node.data_column.val = 1;
                    group.map((data, i) => {
                        ndata[i].mod.modify(0, 0, data);
                        ndata[i].data_column.val = column;
                    });
                }
            },
            "core:flatten": class extends TTAction {
                static name = Names("Flatten")
                static varify(node) {
                    return node.data.some(n => n.is(".json:array"));
                }
                static call(node) {
                    const Array = node.$type[".json:array"];
                    const column = node.data_column.val;
                    const data = [...node.data];
                    const group = [];
                    node.mod.modify(0, data.length, []);
                    for (let i = 0; i < data.length; i += column) {
                        group.push(data.slice(i, i + column));
                    }
                    const ndata = group.map(_ => Array([]));
                    node.mod.modify(0, 0, ndata);
                    node.data_column.val = 1;
                    group.map((data, i) => {
                        ndata[i].mod.modify(0, 0, data);
                        ndata[i].data_column.val = column;
                    });
                }
            },
            "core:clear": class extends TTAction {
                static name = Names("Clear")
                static varify(node) {
                    return node.data.length > 0;
                }
                static call(node) {
                    node.mod.modify(0, node.data.length, []);
                }
            },
            "core:select-all": class extends TTAction {
                static name = Names("Select All")
                static unique = true
                static call(node) {
                    node.mod.select_all();
                }
            },
        },
    },
}