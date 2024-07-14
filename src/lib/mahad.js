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

const MC_MOVE = Symbol("move");
const MC_MODIFY = Symbol("modify");

const MT_TRANSFORM = Symbol("transform");

const MN_ALL = Symbol("all");

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
        this.data_guard = [];
        this.data_to = [];
        this.data_notify = [];
        for (let i = 0; i < this.length; i++) {
            this.into_guard(this[i], i);
        }
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
                    for (let i = 0; i < count; i++) {
                        this.outof_guard(moves[i], offset + i);
                    }
                    this.splice(offset + delta, 0, ...moves);
                    for (let i = 0; i < count; i++) {
                        this.into_guard(moves[i], offset + delta + i);
                    }
                    break;
                case MC_MODIFY:
                    const [delete_count, ...insert_values] = args;
                    res = this.splice(offset, delete_count, ...insert_values);
                    for (let i = 0; i < delete_count; i++) {
                        this.outof_guard(res[i], offset + i);
                    }
                    for (let i = 0; i < insert_values.length; i++) {
                        this.into_guard(insert_values[i], offset + i);
                    }
                    break;
            }
        }
        for (const opts of [...this.data_notify]) {
            const [_, type] = opts;
            if (type === MN_ALL) {
                this.notify(opts);
            }
        }
        this.push_to_all();
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
    modify(offset, delete_count, ...insert_values) {
        return this.edit([MC_MODIFY, offset, delete_count, ...insert_values]);
    }
    modify_at(value, delete_count, ...insert_values) {
        return this.modify(this.index(value), delete_count, ...insert_values);
    }
    modify_before(value, delete_count, ...insert_values) {
        return this.modify(this.index(value) - delete_count, delete_count, ...insert_values);
    }
    modify_after(value, delete_count, ...insert_values) {
        return this.modify(this.index(value) + 1, delete_count, ...insert_values);
    }
    modify_range(start_value, end_value, ...insert_values) {
        const start_index = this.index(start_value);
        const end_index = this.index(end_value) + 1;
        return this.modify(start_index, end_index - start_index, ...insert_values);
    }
    prefix(...values) {
        return this.modify(0, 0, ...values);
    }
    postfix(...values) {
        return this.modify(this.length, 0, ...values);
    }
    unprefix(delete_count) {
        return this.modify(0, delete_count);
    }
    unpostfix(delete_count) {
        return this.modify(this.length - delete_count, delete_count);
    }
    set(offset, value) {
        return this.modify(offset, 1, value);
    }
    set val(value) {
        this.modify(0, 1, value);
    }

    // 守卫器

    set_guard(...guards) {
        for (const guard of guards) {
            if (!this.data_guard.includes(guard)) {
                this.data_guard.push(guard);
                this.guard_into(guard);
            }
        }
    }
    unset_guard(...guards) {
        for (const guard of guards) {
            const index = this.data_guard.indexOf(guard);
            if (index >= 0) {
                this.data_guard.splice(index, 1);
                this.guard_outof(guard);
            }
        }
    }
    guard_into([into]) {
        for (let i = 0; i < this.length; i++) {
            into(this[i], i);
        }
    }
    guard_outof([_, outof]) {
        for (let i = 0; i < this.length; i++) {
            outof(this[i], i);
        }
    }
    into_guard(v, i) {
        this._on_into_guard(v, i);
        for (const [into] of this.data_guard) {
            into(v, i);
        }
    }
    outof_guard(v, i) {
        const data_guard = this.data_guard;
        for (let gi = data_guard.length - 1; gi >= 0; gi--) {
            const [_, outof] = data_guard[gi];
            outof(v, i);
        }
        this._on_outof_guard(v, i);
    }
    _on_into_guard(v, i) {}
    _on_outof_guard(v, i) {}

    // 通知器

    set_notify(tar, type, ...args) {
        const opts = [tar, type, ...args];
        this.data_notify.push(opts);
        return opts;
    }
    unset_notify(opts) {
        this.data_notify.splice(this.data_notify.indexOf(opts), 1);
    }
    notify(opts) {
        const [[src, push_opts]] = opts;
        src.push_to(push_opts);
        return opts;
    }
    notify_all() {
        for (const opts of this.data_notify) {
            this.notify(opts);
        }
    }

    // 推送器

    set_to(tar, type, ...args) {
        const opts = [tar, [], type, ...args];
        this.data_to.push(opts);
        return opts;
    }
    push_to(opts) {
        const [tar, data, type, ...args] = opts;
        switch (type) {
            case MT_TRANSFORM:
                data[0]?.();
                const [fn] = args;
                const notifies = [];
                const make_proxy = m => new Proxy(m, {
                    get: (target, p) => {
                        if (p === "self") return target;
                        notifies.push([target, target.set_notify([this, opts], MN_ALL)]);
                        if (typeof p === "number") {
                            const v = target[p];
                            return v instanceof Mahad ? make_proxy(v) : v;
                        } else switch (p) {
                            case "get":
                                return p => {
                                    const v = target.get(p);
                                    return v instanceof Mahad ? make_proxy(v) : v;
                                };
                            case "index":
                                // TODO
                            case "ref":
                                return p => {
                                    const v = target.ref(p);
                                    return v instanceof Mahad ? make_proxy(v) : v;
                                };
                            case "val":
                                const v = target.val;
                                return v instanceof Mahad ? make_proxy(v) : v;
                        }
                        return Reflect.get(target, p);
                    },
                });
                const res = fn(this.map(v => v instanceof Mahad ? make_proxy(v) : v));
                data[0] = () => {
                    for (const [tar, opts] of notifies) {
                        tar.unset_notify(opts);
                    }
                }
                tar.edit([MC_MODIFY, 0, tar.length, ...res]);
                break;
        }
        return opts;
    }
    push_to_all() {
        for (const opts of this.data_to) {
            this.push_to(opts);
        }
    }

    // 连接器 (单向)

    bind(src, [ahead_xfmr]) {
        src.push_to(src.set_to(this, ...ahead_xfmr));
    }
    make_bind(xfmr) {
        const tar = new Mahad();
        tar.bind(this, xfmr);
        return tar;
    }
    btrans(fn) {
        return this.make_bind([[MT_TRANSFORM, fn]]);
    }
    bmap(fn) {
        return this.btrans(src => src.map(fn));
    }
    breduce(fn, init_value) {
        return this.btrans(src => [src.reduce(fn, init_value)]);
    }
    bsort(fn) {
        return this.btrans(src => src.toSorted(fn).map(p => p.self));
    }

    // 连接器 (双向)

    sync(src, [ahead_xfmr, back_xfmr]) {
        this.set_to(src, ...back_xfmr);
        src.push_to(src.set_to(this, ...ahead_xfmr));
    }
    make_sync(xfmr) {
        const tar = new Mahad();
        tar.sync(this, xfmr);
        return tar;
    }
    strans(fn, bfn) {
        return this.make_bind([[MT_TRANSFORM, fn], [MT_TRANSFORM, bfn]]);
    }
    smap(fn, bfn) {
        return this.strans(src => src.map(fn), tar => tar.map(bfn));
    }
    sreduce(fn, bfn, init_value) {
        return this.strans(src => [src.reduce(fn, init_value)], tar => Mahad.unfold(tar.val, bfn));
    }

    // 写入器

    set_writer(type, ...args) {
        const opts = [[], type, ...args];
        this.data_writer.push(opts);
        return opts;
    }
    write(opts) {
        //
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
        const eminner = new ElemMahadInner();
        eminner.elem = this.elem;
        this.postfix(eminner);
        return this;
    }
    attr(key, vals = ['']) {
        const guard = EM_ATTR_GUARDS[key];
        if (guard) {
            const mattr = vals[0] instanceof Mahad ? vals[0] : M(...vals);
            mattr.ref = key;
            mattr.set_guard(guard(this.elem));
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

class ElemMahadInner extends Mahad {
    constructor(...inner) {
        super(...inner);
        this.data_ref = "inner";
    }
    _on_into_guard(v, i) {
        super._on_into_guard(v, i);
        const e = v instanceof ElemMahad ? v.elem : v;
        if (i === this.elem.children.length) {
            this.elem.append(e);
        } else {
            this.elem.insertBefore(e, this.elem.children[i]);
        }
    }
    _on_outof_guard(v, i) {
        super._on_outof_guard(v, i);
        const e = v instanceof ElemMahad ? v.elem : v;
        e.remove();
    }
}

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
c = b.breduce((s, v) => s + v[0], 0);
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
sum_money = data.breduce((sum, person) => sum + person.ref("money").val, 0);
sort_data = data.bsort((a, b) => a.ref("money").val - b.ref("money").val);
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
