(global => {

const _em_handle_head = {
    apply: (_t, _s, args) => {
        const em = new ElemMahad();
        em.init();
        if (args.length) em.attr("inner", args);
        return em;
    },
    get: (_, name) => {
        const ntar = () => {};
        ntar.ename = name;
        ntar.attrs = [];
        return new Proxy(ntar, _em_handle_tail);
    },
};

const _em_handle_tail = {
    apply: (tar, _s, args) => {
        const em = new ElemMahad();
        em.name = tar.ename;
        em.init();
        if (args.length) em.attr("inner", args);
        for (const [key, vals] of tar.attrs) {
            em.attr(key, vals);
        }
        return em;
    },
    get: (tar, key) => (...args) => {
        const ntar = () => {};
        ntar.ename = tar.ename;
        if (key.startsWith('$')) {
            ntar.attrs = tar.attrs.concat([[key.slice(1), args[0]]]);
        } else {
            ntar.attrs = tar.attrs.concat([[key, args]]);
        }
        return new Proxy(ntar, _em_handle_tail);
    },
};

global.EM = new Proxy(() => {}, _em_handle_head);

const EMK_MAHAD = Symbol("mahad");
const EM_ATTR_GUARDS = {
    "id": elem => [
        val => elem.id = val,
    ],
    "title": elem => [
        val => elem.title = val,
    ],
    "text": elem => [
        val => elem.textContent = val,
    ],
    "class": elem => [
        val => elem.classList.add(val),
        val => elem.classList.remove(val),
    ],
    "value": (elem, mattr) => {
        elem.addEventListener("change", () => {
            mattr.val = elem.value;
        });
        return [
            val => elem.value = val,
        ];
    },
    "inner": elem => [
        (v, i) => {
            const e = v instanceof ElemMahad ? v.elem : v instanceof Node ? v : new Text(v);
            if (i === elem.childNodes.length) {
                elem.append(e);
            } else {
                elem.insertBefore(e, elem.childNodes[i]);
            }
        },
        (v, i) => {
            elem.childNodes[i].remove();
        },
    ],
};

global.ElemMahad = class ElemMahad extends Mahad {
    constructor(...inner) {
        super(...inner);
        this.name = "div";
    }
    init() {
        this.elem = document.createElement(this.name);
        this.elem[EMK_MAHAD] = this;
        return this;
    }
    attr(key, mattr = ['']) {
        const guard = EM_ATTR_GUARDS[key];
        if (guard) {
            mattr
                .ref(key)
                .guard(null, ...guard(this.elem, mattr));
            this.postfix(mattr);
        }
        return this;
    }
    attach(elem_or_query) {
        if (typeof elem_or_query === "string") {
            document.querySelector(elem_or_query).append(this.elem);
        } else if (elem_or_query instanceof HTMLElement) {
            elem_or_query.append(this.elem);
        } else if (elem_or_query instanceof ElemMahad) {
            elem_or_query.postfix(this);
        } else {
            throw "Unexpect attach target";
        }
    }
};

})(globalThis);

// TEST

// window.onload = () => {

// value = ["Lane Sun"];
// checked = [false];

// const {div, h1, input} = EM;

// div.id("view").class("a", "b")(
//     h1.$text(value.bmap(v => `Hello ${v}!`))(),
//     input.$value(value)(),
// ).attach(document.body);

// data = M.div(
//     M.h1("Title"),
//     M.p(
//         "this is some text",
//     ),
// );

// map_fn = m => m instanceof Array ?
//     EM[m.ref()]
//         .$inner(m.bmap(map_fn))() :
//     m;

// map_fn(data).attach(document.body);

// data.postfix(M.p("new line: "));
// data[2].postfix(M.b("bold text"), " and ", M.i("italic text"), " and ", M.del("this will be deleted"));
// data[2].unpostfix(2);

// };
