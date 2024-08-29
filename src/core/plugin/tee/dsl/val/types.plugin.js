const id = "#types:core:tee:val";
const provides = [".types:tee:val", ".types"];
const requires = [".types:json"];

export default class extends TTPlugin {
  static id = id;
  static provides = provides;
  static requires(plugins) {
    return this.req_essential(plugins, requires);
  }

  ".core:type-loader" = ["boolean", "string", "number"];
}
