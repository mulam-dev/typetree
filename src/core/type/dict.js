Editor.sign_type({
    id: "core:dict",
    scope: "dict",
    name: "Dict",
    visible: true,
    data() {
        return M();
    },
    to_json() {
        return Object.fromEntries(this.data.map(([k, v]) => [k.to_json(), v.to_json()]));
    },
    elem() {
        return EM.div.$inner(this.data.bmap())()
    },
});