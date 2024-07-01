Editor.sign_node_type({
    id: "core:array",
    name: "Array",
    struct: $ =>
        $.div({class: "core-array-root"}, [
            $.slots("items"),
        ]),
});