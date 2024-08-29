const id = "#types:core:tee:html";
const provides = [".types:tee:html"];
const requires = [];

export default class extends TTPlugin {
  static id = id;
  static provides = provides;
  static requires(plugins) {
    return this.req_essential(plugins, requires);
  }

  ".core:tee.type" = {
    "html:node": { name: "Node" },
    "html:div": { name: "Div" },
  };
}
