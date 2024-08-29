const id = "#core:json:null";
const extend = null;
const provides = [".json:null"];
const name = Names("Null");

const Super = await TTNode.Class(extend);
export default class extends Super {
  static id = id;
  static provides = provides;
  static uses = [id, ...provides, ...Super.uses];
  static name = name;

  struct() {
    const { "#core:frame": frame } = this.$type;
    return frame(["null"])
      .into(this)
      .color(0, 0, 0.8)
      .style_on("inline", "code").melem;
  }

  to_json() {
    return null;
  }
}
