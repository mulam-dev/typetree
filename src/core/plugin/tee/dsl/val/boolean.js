const id = "#core:tee:val:boolean";
const extend = "#core:json:boolean";
const provides = [".tee:val:boolean"];
const name = Names("Boolean");

const Super = await TTNode.Class(extend);
export default class extends Super {
  static id = id;
  static provides = provides;
  static uses = [id, ...provides, ...Super.uses];
  static name = name;
}
