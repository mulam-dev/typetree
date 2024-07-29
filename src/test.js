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
} = Editor.$type;

Editor.set_tree(
    object([
        [key(["null"]), nil()],
        [key(["boolean"]), array([boolean([true]), boolean([false])])],
        [key(["string"]), array([string([""]), string(["some text"])])],
        [key(["number"]), number([-Math.E])],
        [key(["object"]), object([
            [key(["name"]), string(["Lane Sun"])],
            [key(["employed"]), boolean([true])],
            [key(["object"]), object([
                [key(["name"]), string(["Lane Sun"])],
                [key(["employed"]), boolean([true])],
                [key(["object"]), object([
                    [key(["name"]), string(["Lane Sun"])],
                    [key(["employed"]), boolean([true])],
                    [key(["object"]), object([
                        [key(["name"]), string(["Lane Sun"])],
                        [key(["employed"]), boolean([true])],
                        [key(["object"]), object([
                            [key(["name"]), string(["Lane Sun"])],
                            [key(["employed"]), boolean([true])],
                        ])],
                    ])],
                ])],
            ])],
        ])],
        [key(["array"]), array([
            object([
                [key(["name"]), string(["Lane Sun"])],
                [key(["employed"]), boolean([true])],
            ]),
            string([`
This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

...
`]),
        ])],
    ]),
);

console.log("%cTEST END", band_style);
console.groupEnd();
