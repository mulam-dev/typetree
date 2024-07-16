(global => {

global.M = new Proxy(() => {}, {
    apply: (_t, _s, args) => {
        const m = new Mahad();
        m.push(...args);
        return m;
    },
    get: (_, ref) => (...args) => {
        const m = new Mahad();
        m.push(...args);
        return m.ref(ref);
    },
});

const MC_MOVE = 0;
const MC_MODIFY = 1;
const MC_EDIT = 2;
const MC_SIZE = 3;

const data_to = Symbol("data_to");
const data_to_field = Symbol("data_to_field");
const data_ref = Symbol("data_ref");

const _make_marker = (links, updater) => m => {
    const id = Symbol();
    links.push([m, id]);
    m.listen(id, updater);
    return m;
};

global.Mahad = class Mahad extends Array {
    static unfold(init_value, fn) {
        const res = new this();
        while (true) {
            let v;
            [init_value, v] = fn(init_value);
            if (v !== undefined) {
                res.push(v);
            } else {
                break;
            }
        }
        return res.reverse();
    }

    get [data_to]() {
        if (this[data_to_field]) {
            return this[data_to_field];
        } else {
            const data_to = new Map();
            this[data_to_field] = data_to;
            return data_to;
        }
    }
    get [Symbol.toStringTag]() {
        return this.ref() !== undefined ? `Mahad:${this.ref()}` : "Mahad";
    }
    toString() {
        return `${this.ref() !== undefined ? this.ref() : ''}(${this.map(v => v.toString()).join(' ')})`;
    }

    // 读取器

    get(index) {
        if (index instanceof Number) {
            return this[index];
        } else {
            for (const m of this) {
                if (index === m.ref()) return m;
            }
            return null;
        }
    }
    ref(ref) {
        if (ref === undefined) {
            return this[data_ref];
        } else {
            if (this[data_ref] !== undefined) throw new Error("Immutable ref was modified: " + this);
            this[data_ref] = ref;
            return this;
        }
    }
    index(value) {
        return this.indexOf(value);
    }
    get val() {
        return this[0];
    }

    // 修改器

    edit(...cmds) {
        let res = null;
        for (const [cmd, offset, ...args] of cmds) {
            switch (cmd) {
                case MC_MOVE:
                    const [count, delta] = args;
                    const moves = this.splice(offset, count);
                    this.splice(offset + delta, 0, ...moves);
                    for (const [tar, [fns, data]] of this[data_to]) {
                        fns[MC_MOVE]?.call(this, tar, data, moves, offset, count, delta);
                    }
                    break;
                case MC_MODIFY:
                    const [delete_count, inserts] = args;
                    const deletes = this.splice(offset, delete_count, ...inserts);
                    for (const [tar, [fns, data]] of this[data_to]) {
                        fns[MC_MODIFY]?.call(this, tar, data, deletes, inserts, offset, delete_count);
                    }
                    res = deletes;
                    break;
            }
        }
        for (const [tar, [fns, data]] of [...this[data_to]]) {
            fns[MC_EDIT]?.call(this, tar, data, this);
        }
        return res;
    }
    move(offset, count, delta) {
        return this.edit([MC_MOVE, offset, count, delta]);
    }
    move_at(value, count, delta) {
        return this.move(this.index(value), count, delta);
    }
    move_before(value, count, delta) {
        return this.move(this.index(value) - count, count, delta);
    }
    move_after(value, count, delta) {
        return this.move(this.index(value) + 1, count, delta);
    }
    move_range(start_value, end_value, delta) {
        const start_index = this.index(start_value);
        const end_index = this.index(end_value) + 1;
        return this.move(start_index, end_index - start_index, delta);
    }
    exchange(src, src_end_or_tar, tar = undefined, tar_end = undefined) {
        let src_sidx = this.index(src),
            src_eidx, tar_sidx, tar_eidx;
        if (tar === undefined) {
            src_eidx = src_sidx + 1;
            tar_sidx = this.index(src_end_or_tar);
            tar_eidx = tar_sidx + 1;
        } else if (tar_end === undefined) {
            src_eidx = this.index(src_end_or_tar) + 1;
            tar_sidx = this.index(tar);
            tar_eidx = tar_sidx + 1;
        } else {
            src_eidx = this.index(src_end_or_tar) + 1;
            tar_sidx = this.index(tar);
            tar_eidx = this.index(tar_end) + 1;
        }
        [src_sidx, src_eidx, tar_sidx, tar_eidx] = [src_sidx, src_eidx, tar_sidx, tar_eidx].sort();
        if (src_eidx === tar_sidx) {
            return this.move(src_sidx, src_eidx - src_sidx, tar_eidx - tar_sidx);
        } else {
            return this.edit(
                [MC_MOVE, src_sidx, src_eidx - src_sidx, tar_sidx - src_eidx],
                [MC_MOVE, tar_sidx, tar_eidx - tar_sidx, src_sidx - tar_sidx]
            );
        }
    }
    modify(offset, delete_count, inserts = []) {
        return this.edit([MC_MODIFY, offset, delete_count, inserts]);
    }
    modify_at(value, delete_count, inserts) {
        return this.modify(this.index(value), delete_count, inserts);
    }
    modify_before(value, delete_count, inserts) {
        return this.modify(this.index(value) - delete_count, delete_count, inserts);
    }
    modify_after(value, delete_count, inserts) {
        return this.modify(this.index(value) + 1, delete_count, inserts);
    }
    modify_range(start_value, end_value, inserts) {
        const start_index = this.index(start_value);
        const end_index = this.index(end_value) + 1;
        return this.modify(start_index, end_index - start_index, inserts);
    }
    prefix(...values) {
        return this.modify(0, 0, values);
    }
    postfix(...values) {
        return this.modify(this.length, 0, values);
    }
    unprefix(delete_count) {
        return this.modify(0, delete_count);
    }
    unpostfix(delete_count) {
        return this.modify(this.length - delete_count, delete_count);
    }
    assign(new_values) {
        return this.modify(0, this.length, new_values);
    }
    set(offset, value) {
        return this.modify(offset, 1, [value]);
    }
    set val(value) {
        this.modify(0, 1, [value]);
    }

    // 推送器

    set_to(tar, fns, data = []) {
        const vfns = new Array(MC_SIZE);
        for (const type in fns) {
            vfns[type] = fns[type];
        }
        this[data_to].set(tar, [vfns, data]);
    }
    unset_to(tar) {
        this[data_to].delete(tar);
    }

    // 守卫器

    guard(id, into, outof) {
        this.set_to(id, {
            [MC_MODIFY]: (tar, data, deletes, inserts, offset, delete_count) => {
                if (outof) for (let i = deletes.length - 1; i >= 0; i--) {
                    outof(deletes[i], offset + i);
                }
                if (into) for (let i = 0; i < inserts.length; i++) {
                    into(inserts[i], offset + i);
                }
            },
        });
        if (into) for (let i = 0; i < this.length; i++) {
            into(this[i], i);
        }
        return this;
    }

    // 监听器

    listen(id, fn) {
        this.set_to(id, {
            [MC_EDIT]: fn,
        });
        return this;
    }

    // 连接器 (单向)

    bind(src, fns, data) {
        src.set_to(this, fns, data);
        return this;
    }
    bind_map(src, fn) {
        const data = M().guard(null, null, links => links.forEach(([m, id]) => m.unset_to(id)));
        const handle_modify = (tar, data, deletes, inserts, offset, delete_count) => {
            const insert_links_set = [];
            tar.modify(offset, delete_count, inserts.map((v, i) => {
                const index = offset + i;
                const insert_links = [];
                const update = () => {
                    const insert_links = [];
                    tar.set(index, fn(v, index, _make_marker(insert_links, update)));
                    data.set(index, insert_links);
                };
                const res = fn(v, index, _make_marker(insert_links, update));
                insert_links_set.push(insert_links);
                return res;
            }));
            data.modify(offset, delete_count, insert_links_set);
        };
        handle_modify(this, data, [], src, 0, 0);
        return this.bind(src, {
            [MC_MOVE]: (tar, data, moves, offset, count, delta) => {
                tar.move(offset, count, delta);
                data.move(offset, count, delta);
            },
            [MC_MODIFY]: handle_modify,
        }, data);
    }
    bind_reduce(src, fn, init_value) {
        const data = [];
        const update = () => {
            data[0]?.forEach(([m, id]) => m.unset_to(id));
            const links = [];
            const mark = _make_marker(links, update);
            this.val = src.reduce((pre, cur, index) => fn(pre, cur, index, mark), init_value);
            data[0] = links;
        };
        update();
        return this.bind(src, {
            [MC_MODIFY]: update,
        }, data);
    }
    bind_sort(src, fn) {
        const data = [];
        const update = () => {
            data[0]?.forEach(([m, id]) => m.unset_to(id));
            const links = [];
            const mark = _make_marker(links, update);
            this.assign(src.toSorted((a, b) => fn(a, b, mark)));
            data[0] = links;
        };
        update();
        return this.bind(src, {
            [MC_MODIFY]: update,
        }, data);
    }
    bind_clone(src) {
        this.assign(src);
        return this.bind(src, {
            [MC_MOVE]: (tar, data, moves, offset, count, delta) => {
                tar.move(offset, count, delta);
            },
            [MC_MODIFY]: (tar, data, deletes, inserts, offset, delete_count) => {
                tar.modify(offset, delete_count, inserts);
            },
        }, data);
    }
    make_bind(fns, data) {
        return new this.constructor().bind(this, fns, data);
    }
    bmap(fn) {
        return new this.constructor().bind_map(this, fn);
    }
    breduce(fn, init_value) {
        return new this.constructor().bind_reduce(this, fn, init_value);
    }
    bsort(fn) {
        return new this.constructor().bind_sort(this, fn);
    }
    bclone() {
        return new this.constructor().bind_clone(this);
    }
};

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
    attr(key, vals = ['']) {
        const guard = EM_ATTR_GUARDS[key];
        if (guard) {
            const mattr = vals instanceof Mahad ? vals : M(...vals);
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

const eq = (a, b) => {
    if (a.toString() !== b.toString()) {
        console.error("Assertion failed");
        console.log(a);
        console.log("    ↓");
        console.log(b);
        console.log();
        console.log(a.toString());
        console.log("    ↓");
        console.log(b.toString());
    }
};

data = Mahad.unfold(10, v => [v - 1, v > 0 ? v - 1 : undefined]);
eq(data, "(0 1 2 3 4 5 6 7 8 9)");

data = M('a', 'b', 'c', 'd');
data.exchange('a', 'c');
eq(data, "(c b a d)");

data = M(0, 1, 2, 3, 4, 5, 6, 7, 8 ,9);
data.exchange(1, 2, 4, 8);
eq(data, "(0 4 5 6 7 8 3 1 2 9)");

a = M(0, 1, 2, 3);
b = a.bmap(v => v ** 2);
c = b.breduce((s, v) => s + v, 0);
eq(b, "(0 1 4 9)");
eq(c, "(14)");
a.set(0, 4);
eq(b, "(16 1 4 9)");
eq(c, "(30)");

a = M(M(0), M(1), M(2), M(3));
b = a.bmap(v => v.bmap(v => v ** 2));
c = b.breduce((s, v, _, $) => s + $(v)[0], 0);
eq(b, "((0) (1) (4) (9))");
eq(c, "(14)");
a[0].set(0, 4);
eq(b, "((16) (1) (4) (9))");
eq(c, "(30)");

data = M(M(
    M.id("lanesun"),
    M.money(20),
), M(
    M.id("foo"),
    M.money(16),
), M(
    M.id("bar"),
    M.money(32),
));
sum_money = data.breduce((sum, person, _, $) => sum + $(person.get("money")).val, 0);
sort_data = data.bsort((a, b, $) => $(a.get("money")).val - $(b.get("money")).val);
eq(sum_money, "(68)");
eq(sort_data, "((id(foo) money(16)) (id(lanesun) money(20)) (id(bar) money(32)))");
data[1].get("money").val = 48;
eq(sum_money, "(100)");
eq(sort_data, "((id(lanesun) money(20)) (id(bar) money(32)) (id(foo) money(48)))");
data[1].get("money").val = 68;
eq(sum_money, "(120)");
eq(sort_data, "((id(lanesun) money(20)) (id(bar) money(32)) (id(foo) money(68)))");

window.onload = () => {

value = M("Lane Sun");
checked = M(false);

const {div, h1, input} = EM;

div.id("view").class("a", "b")(
    h1.$text(value.bmap(v => `Hello ${v}!`))(),
    input.$value(value)(),
).attach(document.body);

data = M.div(
    M.h1("Title"),
    M.p(
        "this is some text",
    ),
);

map_fn = m => m instanceof Mahad ?
    EM[m.ref()]
        .$inner(m.bmap(map_fn))() :
    m;

map_fn(data).attach(document.body);

data.postfix(M.p("new line: "));
data[2].postfix(M.b("bold text"), " and ", M.i("italic text"), " and ", M.del("this will be deleted"));
data[2].unpostfix(2);

};
