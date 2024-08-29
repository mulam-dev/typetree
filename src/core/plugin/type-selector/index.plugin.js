const id = "#core:type-selector";
const provides = [".core:type-selector"];
const requires = {
  commander: ".core:commander",
};

export default class extends TTPlugin {
  static id = id;
  static provides = provides;
  static requires(plugins) {
    return this.req_essential(plugins, requires);
  }

  async request(anchor, filter, opts) {
    const types = filter ? this.root.types.filter(filter) : this.root.types;
    const res = await this.require.commander.request(
      to_melem(anchor),
      types.map((Type) => ({
        id: Type.id,
        label: Type.name.get(),
        detail: Type.id,
        path: Type.id + Type.provides.join(""),
      })),
      {
        anchor_x: 1,
        anchor_y: 0,
        ...opts,
      },
    );
    this.root.focus();
    return res ? res.id : null;
  }
}

const to_melem = (node) => (node instanceof TTNode ? node.melem : node);
