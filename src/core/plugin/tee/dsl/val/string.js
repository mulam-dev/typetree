const id = "#core:tee:val:string";
const extend = "#core:json:string";
const provides = [".tee:val:string"];
const name = Names("String");

const Super = await TTNode.Class(extend);
export default class extends Super {
  static id = id;
  static provides = provides;
  static uses = [id, ...provides, ...Super.uses];
  static name = name;
}
