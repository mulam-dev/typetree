export default (plugin) => ({
  ".tee:node": {
    actions: {
      "core:insert-into": class extends TTAction {
        static name = Names("Insert Into");
        static icon = "plus";
        static unique = true;
        static async call(node) {
          const nnode = await plugin.request_insert(node);
          if (nnode) {
            const offset = node.data.length;
            node.mod("modify", offset, 0, [nnode]);
          }
        }
      },
      "core:clear": class extends TTAction {
        static name = Names("Clear");
        static icon = "eraser";
        static varify(node) {
          return node.data.length > 0;
        }
        static call(node) {
          node.mod("modify", 0, node.data.length, []);
        }
      },
    },
  },

  ".tee:node > .core:selection": {
    actions: {
      "core:insert": class extends TTAction {
        static name = Names("Insert");
        static icon = "plus";
        static unique = true;
        static async call(sel, nnode) {
          const node = sel.parent;
          nnode ??= await plugin.request_insert(sel);
          if (nnode) {
            const [, offset] = sel.data_range;
            node.mod("modify", offset, 0, [nnode]);
            sel.set(offset, offset + 1);
          }
        }
      },
      "core:switch": class extends TTAction {
        static name = Names("Switch");
        static icon = "switch";
        static unique = true;
        static varify(sel) {
          return sel.data_nodes.length === 1;
        }
        static async call(sel) {
          const node = sel.parent;
          const nnode = await plugin.request_insert(sel);
          if (nnode) {
            const [offset] = sel.data_range;
            node.mod("modify", offset, 1, [nnode]);
            sel.set(offset, offset + 1);
          }
        }
      },
      "core:select-all": class extends TTAction {
        static name = Names("Select All");
        static icon = "select-all";
        static unique = true;
        static call(sel) {
          const node = sel.parent;
          sel.set(0, node.data.length);
        }
      },
      "core:restruct": class extends TTAction {
        static name = Names("Restruct");
        static icon = "brackets-contain";
        static varify(sel) {
          return !sel.collapsed();
        }
        static async call(sel) {
          const node = sel.parent;
          const nnode = await plugin.request_insert(sel);
          if (nnode) {
            const [start, end] = sel.data_range.num_sorted();
            const data = node.data.slice(start, end);
            node.mod("modify", start, end - start, []);
            node.mod("modify", start, 0, [nnode]);
            nnode.mod("modify", 0, 0, data);
            sel.set(start, start + 1);
          }
        }
      },
      "core:extract": class extends TTAction {
        static name = Names("Extract");
        static icon = "dots";
        static varify(sel) {
          const node = sel.parent;
          const [start, end] = sel.data_range.num_sorted();
          return node.data.slice(start, end).some((n) => n.in(".tee:dsl:"));
        }
        static call(sel) {
          const node = sel.parent;
          const [start, end] = sel.data_range.num_sorted();
          const data = [];
          for (let i = start; i < end; i++) {
            const n = node.data[i];
            if (n.in(".tee:dsl:")) {
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
      "core:delete": class extends TTAction {
        static name = Names("Delete");
        static icon = "trash";
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
    },
  },
});
