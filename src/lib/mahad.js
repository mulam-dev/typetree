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
        m.data_ref = ref;
        return m;
    },
});

const MC_MOVE = 0;
const MC_MODIFY = 1;
const MC_EDIT = 2;
const MC_SIZE = 3;

const _make_marker = (links, updater) => m => {
    const id = Symbol();
    links.push([m, id]);
    m.listen(id, updater);
    return m;
};

global.Mahad = class Mahad extends Array {
    static unfold(init_value, fn) {
        const res = new Mahad();
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

    constructor(...inner) {
        super(...inner);
        this.data_ref = null;
        this.data_to = new Map();
    }
    get [Symbol.toStringTag]() {
        return this.ref ? `Mahad:${this.ref}` : "Mahad";
    }
    toString() {
        return `${this.data_ref ?? ''}(${this.map(v => v.toString()).join(' ')})`;
    }

    // 读取器

    get(index) {
        return this[index];
    }
    index(value) {
        return this.indexOf(value);
    }
    ref(ref) {
        for (const m of this) {
            if (ref === m.data_ref) return m;
        }
        return null;
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
                    for (const [tar, [fns, data]] of this.data_to) {
                        fns[MC_MOVE]?.call(this, tar, data, moves, offset, count, delta);
                    }
                    break;
                case MC_MODIFY:
                    const [delete_count, inserts] = args;
                    const deletes = this.splice(offset, delete_count, ...inserts);
                    for (const [tar, [fns, data]] of this.data_to) {
                        fns[MC_MODIFY]?.call(this, tar, data, deletes, inserts, offset, delete_count);
                    }
                    res = deletes;
                    break;
            }
        }
        for (const [tar, [fns, data]] of [...this.data_to]) {
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
        this.data_to.set(tar, [vfns, data]);
    }
    unset_to(tar) {
        this.data_to.delete(tar);
    }

    // 守卫器

    guard(id, into, outof) {
        this.set_to(id, {
            [MC_MODIFY]: (tar, data, deletes, inserts, offset, delete_count) => {
                if (outof) for (const v of deletes) {
                    outof(v);
                }
                if (into) for (const v of inserts) {
                    into(v);
                }
            },
        });
        if (into) for (const v of this) {
            into(v);
        }
        return this;
    }

    // 监听器

    listen(id, fn) {
        this.set_to(id, {
            [MC_EDIT]: fn,
        });
    }

    // 连接器 (单向)

    bind(src, fns, data) {
        src.set_to(this, fns, data);
        return this;
    }
    make_bind(fns, data) {
        const tar = new Mahad();
        tar.bind(this, fns, data);
        return tar;
    }
    bmap(fn) {
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
        const tar = this.make_bind({
            [MC_MOVE]: (tar, data, moves, offset, count, delta) => {
                tar.move(offset, count, delta);
                data.move(offset, count, delta);
            },
            [MC_MODIFY]: handle_modify,
        }, data);
        handle_modify(tar, data, [], this, 0, 0);
        return tar;
    }
    breduce(fn, init_value) {
        const data = [];
        const update = () => {
            data[0]?.forEach(([m, id]) => m.unset_to(id));
            const links = [];
            const mark = _make_marker(links, update);
            tar.val = this.reduce((pre, cur, index) => fn(pre, cur, index, mark), init_value);
            data[0] = links;
        };
        const tar = this.make_bind({
            [MC_MODIFY]: update,
        }, data);
        update();
        return tar;
    }
    bsort(fn) {
        const data = [];
        const update = () => {
            data[0]?.forEach(([m, id]) => m.unset_to(id));
            const links = [];
            const mark = _make_marker(links, update);
            tar.modify(0, tar.length, this.toSorted((a, b) => fn(a, b, mark)));
            data[0] = links;
        };
        const tar = this.make_bind({
            [MC_MODIFY]: update,
        }, data);
        update();
        return tar;
    }
};

const _em_handle_head = {
    apply: (_t, _s, args) => {
        const em = new ElemMahad();
        em.init();
        em.ref("inner").postfix(...args);
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
        em.ref("inner").postfix(...args);
        for (const [key, vals] of tar.attrs) {
            em.attr(key, vals);
        }
        return em;
    },
    get: (tar, key) => (...vals) => {
        const ntar = () => {};
        ntar.ename = tar.ename;
        ntar.attrs = tar.attrs.concat([[key, vals]]);
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
};

global.ElemMahad = class ElemMahad extends Mahad {
    constructor(...inner) {
        super(...inner);
        this.name = "div";
    }
    init() {
        this.elem = document.createElement(this.name);
        this.elem[EMK_MAHAD] = this;
        this.postfix(M.inner().guard(null,
            (v, i) => {
                const e = v instanceof ElemMahad ? v.elem : v;
                if (i === this.elem.children.length) {
                    this.elem.append(e);
                } else {
                    this.elem.insertBefore(e, this.elem.children[i]);
                }
            },
            v => {
                const e = v instanceof ElemMahad ? v.elem : v;
                e.remove();
            }
        ));
        return this;
    }
    attr(key, vals = ['']) {
        const guard = EM_ATTR_GUARDS[key];
        if (guard) {
            const mattr = vals[0] instanceof Mahad ? vals[0] : M(...vals);
            mattr.ref = key;
            mattr.guard(null, ...guard(this.elem));
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

data = M('a', 'b', 'c', 'd');
data.exchange('a', 'c');
eq(data, "(c b a d)");

data = M(0, 1, 2, 3, 4, 5, 6, 7, 8 ,9);
data.exchange(1, 2, 4, 8);
eq(data, "(0 4 5 6 7 8 3 1 2 9)");

a = M(0, 1, 2, 3);
b = a.bmap(v => v ** 2);
c = b.breduce((s, v) => s + v, 0);
eq(b, "(0 1 4 9)")
eq(c, "(14)");
a.set(0, 4);
eq(b, "(16 1 4 9)")
eq(c, "(30)");

a = M(M(0), M(1), M(2), M(3));
b = a.bmap(v => v.bmap(v => v ** 2));
c = b.breduce((s, v, _, $) => s + $(v)[0], 0);
eq(b, "((0) (1) (4) (9))")
eq(c, "(14)");
a[0].set(0, 4);
eq(b, "((16) (1) (4) (9))")
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
sum_money = data.breduce((sum, person, _, $) => sum + $(person.ref("money")).val, 0);
sort_data = data.bsort((a, b, $) => $(a.ref("money")).val - $(b.ref("money")).val);
eq(sum_money, "(68)");
eq(sort_data, "((id(foo) money(16)) (id(lanesun) money(20)) (id(bar) money(32)))");
data[1].ref("money").val = 48;
eq(sum_money, "(100)");
eq(sort_data, "((id(lanesun) money(20)) (id(bar) money(32)) (id(foo) money(48)))");
data[1].ref("money").val = 68;
eq(sum_money, "(120)");
eq(sort_data, "((id(lanesun) money(20)) (id(bar) money(32)) (id(foo) money(68)))");

window.onload = () => {

EM.div.id("view").class("a", "b")(
    EM.p.text("hello")(),
).attach(document.body);

};
