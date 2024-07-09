const get_index = (self, node) => Elem(self.elem).children().index(node.elem);

const insert_at = (self, index, ...nodes) => {
    const elems = Elem(nodes.map(n => n.elem));
    const children = Elem(self.elem).children();
    if (index < children.length) {
        elems.insertBefore(children.eq(index));
    } else {
        elems.appendTo(self.elem);
    }
};

const modify_at = (self, index, delete_count, ...append_nodes) => {
    const elem = Elem(self.elem);
    const rst_elem = elem.children().slice(index, index + delete_count).remove();
    insert_at(self, index, ...append_nodes);
    return [...rst_elem];
};

const modify = (self, anchor, delete_count, ...append_nodes) => modify_at(self, get_index(self, anchor), delete_count, ...append_nodes);

Editor.sign_node_type({
    id: "core:view",
    scope: "view",
    name: "View",
    visible: false,
    not_embedded: false,
    constructor(data = {}, items = null) {
        if (items) data.items = items;
        const elem = document.createElement(data.name ?? "div");
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
    enable_setter(active) {
        if (active) {
            this.do.add_class("t-active");
            this.elem.node = this;
        } else {
            this.do.remove_class("t-active");
            delete this.elem.node;
        }
    },
    methods: {
        has(node) {
            return [...this.elem.children].includes(node.elem);
        },
        get(index) {
            return this.elem.children[index].node;
        },
        get_index(node) {
            return get_index(this, node);
        },
        add(...nodes) {
            this.elem.append(...nodes.map(n => n.elem));
        },
        modify_at(index, delete_count, ...append_nodes) {
            return modify_at(this, index, delete_count, ...append_nodes);
        },
        modify(anchor, delete_count, ...append_nodes) {
            return modify(this, anchor, delete_count, ...append_nodes);
        },
        modify_after(anchor, delete_count, ...append_nodes) {
            return modify_at(this, get_index(this, anchor) + 1, delete_count, ...append_nodes);
        },
        delete(...nodes) {
            Elem(nodes.map(n => n.elem)).remove();
        },
        clear() {
            Elem(this.elem).empty();
        },
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