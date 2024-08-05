export default {
    "*": {
        "handles.core:mod"(p, moder) {
            this.$require[".core:timeline"].push(this, moder);
        },
    },
}