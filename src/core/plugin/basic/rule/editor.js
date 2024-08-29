export default (plugin) => ({
  ".core:editor": {
    modifiers: {
      modify: class extends TTModer.Map {
        modify(node, offset, delete_count, inserts) {
          super.modify(node);
          const deletes = node.inner.modify(offset, delete_count, inserts);
          this.data_src = [offset, inserts.length, deletes];
        }
      },
      move: class extends TTModer.Map {
        modify(node, offset, count, delta) {
          super.modify(node);
          this.data_src = [offset + delta, count, -delta];
          node.inner.move(offset, count, delta);
        }
      },
    },
  },

  ".core:editor > .core:selection": {
    actions: {
      "core:switch": class extends TTAction {
        static name = Names("Switch");
        static icon = "switch";
        static unique = true;
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
    },
  },
});
