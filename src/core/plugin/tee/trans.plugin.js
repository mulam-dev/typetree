const id = "#trans:core:tee";
const provides = [".trans:core:tee", ".trans"];
const requires = {};

export default class extends TTPlugin {
  static id = id;
  static provides = provides;
  static requires(plugins) {
    return this.req_essential(plugins, requires);
  }

  init() {
    Names("Tee", { "zh-CN": "Tee" });
  }
}
