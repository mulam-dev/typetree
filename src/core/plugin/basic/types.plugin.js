const id = "#types:core:basic";
const provides = [".types:core:basic", ".types"];
const requires = {};

export default class extends TTPlugin {
  static id = id;
  static provides = provides;
  static requires(plugins) {
    return this.req_essential(plugins, requires);
  }

  ".core:type-loader" = [
    "type/frame",
    "type/text-field",
    "type/selection",
    "type/vector-cursor",
    "type/vector-range",
    "type/data/base",
    "type/data/atom",
    "type/data/seq",
    "type/pattern/base",
    "type/pattern/atom",
    "type/pattern/seq",
  ];

  ".core:rule-loader" = ["rule/editor", "rule/keymap"];

  ".core:style-loader" = [
    "style/context-menu",
    "style/cursor",
    "style/frame",
    "style/layout",
    "style/range",
    "style/selector",
    "style/text-field",
  ];

  async request_insert(anchor) {
    const id = await this.root.$require[".core:type-selector"].request(anchor);
    if (id) {
      const Node = this.root.$type[id];
      const nnode = Node();
      return nnode;
    } else {
      return null;
    }
  }
}
