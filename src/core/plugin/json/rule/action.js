export default {
    ".json:boolean": {
        "actions": {
            "core:toggle": class extends TTAction {
                static name = Names("Toggle")
                static icon = "toggle-left"
                static call(node) {
                    node.mod("toggle");
                }
            },
        },
    },

    ".json:string": {
        "actions": {
            "core:select-all": class extends TTAction {
                static name = Names("Select All")
                static icon = "select-all"
                static unique = true
                static call(node) {
                    node.select_all();
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
                static icon = "viewport-wide"
                static varify(node) {
                    return node.data_column.val < node.data.length;
                }
                static call(node) {
                    node.data_column.val += 1;
                }
            },
            "core:column-decrease": class extends TTAction {
                static name = Names("Column Decrease")
                static icon = "viewport-narrow"
                static varify(node) {
                    return node.data_column.val > 1;
                }
                static call(node) {
                    node.data_column.val -= 1;
                }
            },
            "core:restruct-rows": class extends TTAction {
                static name = Names("Restruct Rows")
                static icon = "brackets-contain"
                static varify(node) {
                    return node.data.length > 0;
                }
                static call(node) {
                    const Array = node.$type[".json:array"];
                    const column = node.data_column.val;
                    const data = [...node.data];
                    const group = [];
                    node.mod("modify", 0, data.length, []);
                    for (let i = 0; i < data.length; i += column) {
                        group.push(data.slice(i, i + column));
                    }
                    const ndata = group.map(_ => Array([]));
                    node.mod("modify", 0, 0, ndata);
                    node.data_column.val = 1;
                    group.map((data, i) => {
                        ndata[i].mod("modify", 0, 0, data);
                        ndata[i].data_column.val = column;
                    });
                }
            },
            "core:clear": class extends TTAction {
                static name = Names("Clear")
                static icon = "eraser"
                static varify(node) {
                    return node.data.length > 0;
                }
                static call(node) {
                    node.mod("modify", 0, node.data.length, []);
                }
            },
        },
    },

    ".json:array > .core:selection": {
        "actions": {
            "core:delete": class extends TTAction {
                static name = Names("Delete")
                static icon = "trash"
                static varify(sel) {
                    return !sel.collapsed();
                }
                static call(sel) {
                    const node = sel.parent;
                    const [start, end] = sel.data_range.num_sorted();
                    node.mod("modify", start, end - start, []);
                    sel.set(start, start);
                }
            },
            "core:select-all": class extends TTAction {
                static name = Names("Select All")
                static icon = "select-all"
                static unique = true
                static call(sel) {
                    const node = sel.parent;
                    sel.set(0, node.data.length);
                }
            },
            "core:extract": class extends TTAction {
                static name = Names("Extract")
                static icon = "dots"
                static varify(sel) {
                    const node = sel.parent;
                    const [start, end] = sel.data_range.num_sorted();
                    return node.data.slice(start, end).some(n => n.is(".json:array"));
                }
                static call(sel) {
                    const node = sel.parent;
                    const [start, end] = sel.data_range.num_sorted();
                    const data = [];
                    for (let i = start; i < end; i++) {
                        const n = node.data[i];
                        if (n.is(".json:array")) {
                            data.push(...n.data);
                            n.mod("modify", 0, n.data.length, []);
                        } else {
                            data.push(n);
                        }
                    }
                    node.mod("modify", start, end - start, data);
                    sel.set(start, start + data.length);
                }
            },
            "core:restruct": class extends TTAction {
                static name = Names("Restruct")
                static icon = "brackets-contain"
                static varify(sel) {
                    return !sel.collapsed();
                }
                static call(sel) {
                    const node = sel.parent;
                    const Array = node.$type[".json:array"];
                    const [start, end] = sel.data_range.num_sorted();
                    const data = node.data.slice(start, end);
                    node.mod("modify", start, end - start, []);
                    const nnode = Array([]);
                    node.mod("modify", start, 0, [nnode]);
                    nnode.mod("modify", 0, 0, data);
                    sel.set(start, start + 1);
                }
            },
        },
    },

    ".json:object": {
        "actions": {
            "core:clear": class extends TTAction {
                static name = Names("Clear")
                static icon = "eraser"
                static varify(node) {
                    return node.data.length > 0;
                }
                static call(node) {
                    node.mod("modify_entries", 0, node.data.length, []);
                }
            },
        },
    },

    ".json:object > .core:selection": {
        "actions": {
            "core:delete": class extends TTAction {
                static name = Names("Delete")
                static icon = "trash"
                static varify(sel) {
                    return !sel.collapsed();
                }
                static call(sel) {
                    const node = sel.parent;
                    const [[r1], [r2]] = sel.data_range;
                    const [start, end] = [r1, r2].num_sorted();
                    node.mod("modify_entries", start, end - start, []);
                    sel.set([start, 0], [start, 2]);
                }
            },
            "core:select-all": class extends TTAction {
                static name = Names("Select All")
                static icon = "select-all"
                static unique = true
                static call(sel) {
                    const node = sel.parent;
                    sel.set([0, 0], [node.data.length, 2]);
                }
            },
            "core:extract": class extends TTAction {
                static name = Names("Extract")
                static icon = "dots"
                static varify(sel) {
                    const node = sel.parent;
                    const [[r1], [r2]] = sel.data_range;
                    const [start, end] = [r1, r2].num_sorted();
                    return node.data.slice(start, end).some(n => n[1].is(".json:object"));
                }
                static call(sel) {
                    const node = sel.parent;
                    const [[r1], [r2]] = sel.data_range;
                    const [start, end] = [r1, r2].num_sorted();
                    const data = [];
                    for (let i = start; i < end; i++) {
                        const [, n] = node.data[i];
                        if (n.is(".json:object")) {
                            data.push(...n.data);
                            n.mod("modify_entries", 0, n.data.length, []);
                        } else {
                            data.push(node.data[i]);
                        }
                    }
                    node.mod("modify_entries", start, end - start, data);
                    sel.set([start, 0], [start + data.length, 2]);
                }
            },
            "core:restruct": class extends TTAction {
                static name = Names("Restruct")
                static icon = "code-dots"
                static varify(sel) {
                    return !sel.collapsed();
                }
                static call(sel) {
                    const node = sel.parent;
                    const {
                        ".json:object": Object,
                        ".json:key": Key,
                    } = node.$type;
                    const [[r1], [r2]] = sel.data_range;
                    const [start, end] = [r1, r2].num_sorted();
                    const data = node.data.slice(start, end);
                    node.mod("modify_entries", start, end - start, []);
                    const nnode = Object([]);
                    node.mod("modify_entries", start, 0, [[Key([""]), nnode]]);
                    nnode.mod("modify_entries", 0, 0, data);
                    sel.set([r1, 1], [r1 + 1, 2]);
                }
            },
        },
    },
}