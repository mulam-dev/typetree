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
    "#core:json:key": key,
    ".json:array": array,
} = Editor.$type;

Editor.set_tree(
    object([
        [key(["null"]), nil()],
        [key(["boolean"]), array([boolean([true]), boolean([false])])],
        [key(["string"]), array([string([""]), string(["{"]), string(["'"]), string(["}"]), string(["some text"])])],
        [key(["number"]), array(Array(9).fill(0).map((_, x) => array(Array(9).fill(0).map((_, y) => number([(x + 1) * (y + 1)])))))],
        [key(["object"]), object([
            [key(["name"]), string(["Typetree"])],
            [key(["version"]), string(["v0.1-refactored"])],
            [key(["alias"]), string(["Gson"])],
        ])],
        [key(["array"]), array([
            object([
                [key(["id"]), number([0])],
                [key(["status"]), boolean([true])],
            ]),
            object([
                [key(["id"]), number([1])],
                [key(["status"]), boolean([false])],
            ]),
        ])],
        [key(["unlicense"]), string([`This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.`])],
    ]),
);

console.log("%cTEST END", band_style);
console.groupEnd();
