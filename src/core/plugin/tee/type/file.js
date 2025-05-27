const id = "#core:tee:file";
const extend = "#core:file";
const provides = [".file:tee"];
const name = Names("Tee File");

const Super = await TTNode.Class(extend);
export default class extends Super {
  static id = id;
  static provides = provides;
  static uses = [id, ...provides, ...Super.uses];
  static name = name;

  static rule = {
    // TODO
  };
}
