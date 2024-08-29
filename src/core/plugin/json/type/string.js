const id = "#core:json:string";
const extend = null;
const provides = [".json:string"];
const name = Names("String");

const Super = await TTNode.Class(extend);
export default class extends Super {
  static id = id;
  static provides = provides;
  static uses = [id, ...provides, ...Super.uses];
  static name = name;

  static rule = {
    modifiers: {
      set: class extends TTModer.Map {
        modify(node, value) {
          super.modify(node);
          this.data_src = [node.data.val];
          node.data.val = value;
        }
      },
    },
    handles: {
      "core:text-field": {
        edit(p, content) {
          if (this.data.val !== content) {
            this.mod("set", content);
          }
        },
        escape(p) {
          this.root.focus();
        },
      },
      "core:active"(p) {
        this.struct_ref("field").request_pack(p);
      },
      "core:selection": {
        enter(p) {
          this.request("core:active");
          this.select_all();
        },
      },
    },
  };

  init(data) {
    this.data = data ?? [""];
  }

  struct($) {
    const { "#core:text-field": field } = this.$type;
    return $(
      "field",
      field(this.data.bclone())
        .into(this)
        .prefix('"')
        .suffix('"')
        .color(60, 0.5, 1.2)
        .style_on("inline", "code"),
    ).melem;
  }

  to_json() {
    return this.data[0];
  }

  select_all() {
    this.struct_ref("field").select_all();
  }
}
