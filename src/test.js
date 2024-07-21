const band_style = `
    display: block;
    text-align: center;
    font-weight: bold;
    color: yellow;
`;
console.group("%c  TEST START", band_style);

const {
    ".json:null": nil,
    ".json:boolean": boolean,
    ".json:string": string,
    ".json:number": number,
    ".json:object": object,
    ".json:key": key,
    ".json:array": array,
} = Editor.require;

Editor.set_tree(
    object([
        [key(["null"]), nil()],
        [key(["boolean"]), array([boolean([true]), boolean([false])])],
        [key(["string"]), array([string([""]), string(["some text"])])],
        [key(["number"]), number([-Math.E])],
        [key(["object"]), object([
            [key(["name"]), string(["Lane Sun"])],
            [key(["employed"]), boolean([true])],
        ])],
        [key(["array"]), array([
            object([
                [key(["name"]), string(["Lane Sun"])],
                [key(["employed"]), boolean([true])],
            ]),
            object([
                [key(["name"]), string(["Lane Sun"])],
                [key(["employed"]), boolean([true])],
            ]),
        ])],
    ]),
);

console.log("%cTEST END", band_style);
console.groupEnd();