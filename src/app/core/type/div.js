Editor.sign_node_type({
    id: "core:div",
    scope: "div",
    name: "Div",
    visible: false,
    not_embedded: false,
    constructor($, data = {}, items = null) {
        if (items) data.items = items;
        const elem = document.createElement("div");
        if (data.text) {
            elem.textContent = data.text;
        }
        if (data.class) {
            elem.classList.value = data.class;
        }
        if (data.items) {
            elem.append(...data.items.map(n => n.elem));
        }
        this.elem = elem;
    },
    methods: {
        add_class(...classes) {
            this.elem.classList.add(...classes);
        },
        remove_class(...classes) {
            this.elem.classList.remove(...classes);
        },
        set_text(text) {
            this.elem.textContent = text;
        },
    },
});