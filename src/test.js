const band_style = `
    display: block;
    text-align: center;
    font-weight: bold;
    color: yellow;
`;
console.group("%c  TEST START", band_style);

const {
    ".json:dict": dict,
    ".json:string": string,
    ".json:boolean": boolean,
} = Editor.require;

Editor.set_tree(dict([
    [string(["name"]), string(["Lane Sun"])],
    [string(["employed"]), boolean([true])],
]));

console.log("%cTEST END", band_style);
console.groupEnd();