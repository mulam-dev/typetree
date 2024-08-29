const id = "#core:tee:node";
const extend = null;
const provides = [".tee:node"];
const name = Names("Node");

const Super = await TTNode.Class(extend);
export default class extends Super {
  static id = id;
  static provides = provides;
  static uses = [id, ...provides, ...Super.uses];
  static name = name;

  static rule = {
    modifiers: {
      modify: class extends TTModer.Map {
        modify(node, offset, delete_count, inserts) {
          super.modify(node);
          const deletes = node.data.modify(offset, delete_count, inserts);
          this.data_src = [offset, inserts.length, deletes];
        }
      },
      move: class extends TTModer.Map {
        modify(node, offset, count, delta) {
          super.modify(node);
          this.data_src = [offset + delta, count, -delta];
          node.data.move(offset, count, delta);
        }
      },
    },
    "able.core:layout.select": true,
    "handles.core:layout": {
      "get-selection"(p, anchor_node, focus_node) {
        let anchor = this.data.indexOf(anchor_node);
        let focus = this.data.indexOf(focus_node);
        if (anchor <= focus) {
          focus++;
        } else {
          anchor++;
        }
        return this.$type["#core:selection"]({
          scope: this,
          anchor,
          focus,
        });
      },
    },
    "handles.core:selection": {
      enter(p, sel) {
        sel.data_scope.val = this;
        sel.set(0, Math.min(this.data.length, 1));
      },
      select(p, sel, node) {
        sel.data_scope.val = this;
        const offset = this.data.indexOf(node);
        sel.set(offset, offset + 1);
      },
      resolve(p, { anchor, focus }) {
        if (anchor === focus) {
          if (this.data.length) {
            const pnode = this.data[anchor - 1];
            if (pnode) {
              const rect = pnode.melem.rect;
              return [
                "cursor",
                pnode,
                { dir: "y", x: 0, y: rect.height, size: rect.width },
              ];
            } else {
              const nnode = this.data[anchor];
              const rect = nnode.melem.rect;
              return [
                "cursor",
                nnode,
                { dir: "y", x: 0, y: 0, size: rect.width },
              ];
            }
          } else {
            const { width: w, height: h } = this.melem.rect;
            return ["cursor", this, { dir: "y", x: 18, y: h, size: w - 18 }];
          }
        } else {
          return ["range", this.data.slice(...[anchor, focus].num_sorted())];
        }
      },
      dir(p) {
        return { top: true, bottom: true };
      },
      collapse(p, dir, { anchor, focus }) {
        if (["top", "left"].includes(dir)) {
          return ((p) => [p, p])(Math.min(anchor, focus));
        }
        if (["bottom", "right"].includes(dir)) {
          return ((p) => [p, p])(Math.max(anchor, focus));
        }
      },
      collapsed(p, dir, { anchor, focus }) {
        return anchor === focus;
      },
      side(p, dir, pos) {
        if (["top"].includes(dir)) {
          return 0;
        }
        if (["bottom"].includes(dir)) {
          return this.data.length;
        }
      },
      move(p, dir, pos) {
        switch (dir) {
          case "top":
            return pos - 1;
          case "bottom":
            return pos + 1;
        }
      },
      varify(p, pos) {
        return 0 <= pos && pos <= this.data.length;
      },
    },
  };

  init(data) {
    this.data = (data ?? []).guard(
      null,
      (n) => n.into(this),
      (n) => n.outof(),
    );
  }

  struct() {
    const { "#core:frame": frame } = this.$type;
    return ME.div.class("core-tee-node")(
      frame([this.constructor.name.get()])
        .style_on("inline", "code")
        .into(this)
        .color(0, 0).melem,
      ME.div
        .class("core-tee-node-flex")
        .$inner(this.data.bflat().bmap((node) => node.melem))(),
    );
  }

  to_json() {
    return this.data.map((node) => node.to_json());
  }

  get(index) {
    return this.data[index];
  }

  index(node) {
    return this.data.indexOf(node);
  }

  has(node) {
    return this.data.includes(node);
  }
}
