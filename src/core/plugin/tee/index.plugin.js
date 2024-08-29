const id = "#core:tee";
const provides = [".core:tee"];
const requires = {
  base: ".core:base",
  rule: ".core:rule-loader",
};

export default class extends TTPlugin {
  static id = id;
  static provides = provides;
  static requires(plugins) {
    return this.req_essential(plugins, requires);
  }

  init() {
    return () => this.load();
  }

  async load() {
    const { import_type, import_rule, for_plugins_prop } = this.require.base;
    const { parse_rule } = this.require.rule;

    await for_plugins_prop(`${provides.val}.type`, (plugin, types) =>
      Promise.all(
        Object.entries(types).map(async ([tree_id, opts]) => {
          const id = `#core:tee:dsl:${tree_id}`;
          const extend = opts.extend
            ? `#core:tee:dsl:${opts.extend}`
            : "#core:tee:node";
          const provides = [`.tee:dsl:${tree_id}`];

          const Super = await TTNode.Class(extend);
          const Node = class extends Super {
            static id = id;
            static provides = provides;
            static uses = [id, ...provides, ...Super.uses];
            static name = opts.name ? Names(opts.name) : Super.name;
            static tid = tree_id;
          };
          if (opts.rule) {
            import_rule(...parse_rule(Node.id, opts.rule));
          }
          import_type(Node);
        }),
      ),
    );
  }
}
