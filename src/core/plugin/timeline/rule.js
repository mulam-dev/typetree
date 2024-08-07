export default plugin => ({
    "*": {
        "handles.core:mod"(p, moder) {
            plugin.push(this, moder);
        },
    },
})