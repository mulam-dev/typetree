const id = "#types:core:tee";
const provides = [".types:tee", ".types"];
const requires = [];

export default class extends TTPlugin {
  static id = id;
  static provides = provides;
  static requires(plugins) {
    return this.req_essential(plugins, requires);
  }

  ".core:type-loader" = ["type/node"];

  ".core:rule-loader" = ["rule/action", "rule/keymap"];

  ".core:style-loader" = ["style/node"];

  async request_insert(anchor) {
    const id = await this.root.$require[".core:type-selector"].request(
      anchor,
      (n) => n.in(".tee:dsl:") || n.in(".tee:val:"),
    );
    if (id) {
      return this.make(id);
    } else {
      return null;
    }
  }

  make(id, data) {
    return this.root.$type[id](data);
  }
}
