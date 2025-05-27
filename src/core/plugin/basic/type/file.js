const id = "#core:file";
const extend = null;
const provides = [".file"];
const name = Names("File");

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
        return ["range", this.data.slice(...[anchor, focus].num_sorted())];
      },
      dir(p) {
        return {};
      },
      collapsed(p) {
        return false;
      },
      side(p, dir, pos) {
        return pos;
      },
      move(p, dir, pos) {
        return pos;
      },
      varify(p, pos) {
        return false;
      },
    },
  };

  init(data = {}) {
    this.data = (data.data ? data.data : []).guard(
      null,
      (n) => n.into(this),
      (n) => n.outof(),
    );
    this.data_path = [data.path] ?? [null];
  }

  struct() {
    const { "#core:frame": frame } = this.$type;
    return frame([
      ME.div.class("core-file-root")(
        ME.div.class("core-file-head")(
          frame(
            this.data_path.bmap((p) =>
              p ? p.split("/").pop() : Names("Untitled").get(),
            ),
          )
            .into(this)
            .color(0, 0)
            .style_on("inline").melem,
          frame([this.constructor.name.get()])
            .into(this)
            .style_on("margin")
            .color(0, 0, 0.25).melem,
        ),
        ME.div
          .class("core-file-body")
          .$inner(this.data.bmap((node) => node.melem))(),
      ),
    ])
      .into(this)
      .color(0, 0)
      .style_on("box").melem;
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
