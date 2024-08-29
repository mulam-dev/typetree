const id = "#core:tee:val:number";
const extend = "#core:json:number";
const provides = [".tee:val:number"];
const name = Names("Number");

const Super = await TTNode.Class(extend);
export default class extends Super {
  static id = id;
  static provides = provides;
  static uses = [id, ...provides, ...Super.uses];
  static name = name;
}
