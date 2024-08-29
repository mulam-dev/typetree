const id = "#core:json:key";
const extend = "#core:json:string";
const provides = [".json:key"];
const name = Names("Key");

const Super = await TTNode.Class(extend);
export default class extends Super {
  static id = id;
  static provides = provides;
  static uses = [id, ...provides, ...Super.uses];
  static name = name;

  init(data) {
    this.data = data ?? [""];
  }

  struct($) {
    const { "#core:frame": frame, "#core:text-field": field } = this.$type;
    return frame([
      ME.div.class("core-key-label")(
        $("field", field(this.data.bclone()).into(this)).melem,
        ME.div.class("core-key-hint")("→"),
      ),
    ])
      .into(this)
      .color(180, 0.5, 1.1)
      .style_on("inline", "code").melem;
  }
}
