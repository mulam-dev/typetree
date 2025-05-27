const id = "#core:json:file";
const extend = "#core:file";
const provides = [".file:json"];
const name = Names("JSON File");

const Super = await TTNode.Class(extend);
export default class extends Super {
  static id = id;
  static provides = provides;
  static uses = [id, ...provides, ...Super.uses];
  static name = name;

  init(data = {}) {
    data.data ??= [this.$type[".json:null"]()];
    super.init(data);
  }

  read(data) {
    const json_obj = JSON.parse(data);
    this.data.val = this.json_to_tree(json_obj);
  }

  json_to_tree(json_obj) {
    const { $type } = this.root;
    if (json_obj === null) return $type[".json:null"]();
    switch (typeof json_obj) {
      case "boolean":
        return $type[".json:boolean"]([json_obj]);
      case "string":
        return $type[".json:string"]([json_obj]);
      case "number":
        return $type[".json:number"]([json_obj]);
      case "object":
        if (json_obj instanceof Array) {
          return $type[".json:array"](
            json_obj.map((o) => this.json_to_tree(o)),
          );
        } else {
          return $type[".json:object"](
            Object.keys(json_obj).map((k) => [
              $type[".json:key"]([k]),
              this.json_to_tree(json_obj[k]),
            ]),
          );
        }
    }
    throw -1;
  }
}
