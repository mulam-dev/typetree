(global => {

global.M = new Proxy(() => {}, {
    apply: (_t, _s, args) => args,
    get: (_, ref) => (...args) => args.ref(ref),
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
            const data_to = Array(MC_SIZE).fill(0).map(v => new Map());
            this[data_to_field] = data_to;
            return data_to;
        }
    }
    get [Symbol.toStringTag]() {
        return this.ref() !== undefined ? `Array:${this.ref()}` : "Array";
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
        const vdata_to = this[data_to];
        let res = null;
        for (const [cmd, offset, ...args] of cmds) {
            switch (cmd) {
                case MC_MOVE:
                    const [count, delta] = args;
                    const moves = this.splice(offset, count);
                    this.splice(offset + delta, 0, ...moves);
                    for (const [tar, [fn, data]] of vdata_to[MC_MOVE]) {
                        fn.call(this, tar, data, moves, offset, count, delta);
                    }
                    break;
                case MC_MODIFY:
                    const [delete_count, inserts] = args;
                    const deletes = this.splice(offset, delete_count, ...inserts);
                    for (const [tar, [fn, data]] of vdata_to[MC_MODIFY]) {
                        fn.call(this, tar, data, deletes, inserts, offset, delete_count);
                    }
                    res = deletes;
                    break;
            }
        }
        for (const [tar, [fn, data]] of [...vdata_to[MC_EDIT]]) {
            fn.call(this, tar, data, this);
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
        const vdata_to = this[data_to];
        for (const type in fns) {
            vdata_to[type].set(tar, [fns[type], data]);
        }
    }
    unset_to(tar) {
        for (const set of this[data_to]) {
            set.delete(tar);
        }
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
        const data = [].guard(null, null, links => links.forEach(([m, id]) => m.unset_to(id)));
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

Array.unfold = Mahad.unfold;
Object.defineProperties(Array.prototype, Object.getOwnPropertyDescriptors(Mahad.prototype));

})(globalThis);

// TEST

// const eq = (a, b) => {
//     if (a.toString() !== b.toString()) {
//         console.error("Assertion failed");
//         console.log(a);
//         console.log("    ↓");
//         console.log(b);
//         console.log();
//         console.log(a.toString());
//         console.log("    ↓");
//         console.log(b.toString());
//     }
// };

// data = Array.unfold(10, v => [v - 1, v > 0 ? v - 1 : undefined]);
// eq(data, "(0 1 2 3 4 5 6 7 8 9)");

// data = ['a', 'b', 'c', 'd'];
// data.exchange('a', 'c');
// eq(data, "(c b a d)");

// data = [0, 1, 2, 3, 4, 5, 6, 7, 8 ,9];
// data.exchange(1, 2, 4, 8);
// eq(data, "(0 4 5 6 7 8 3 1 2 9)");

// a = [0, 1, 2, 3];
// b = a.bmap(v => v ** 2);
// c = b.breduce((s, v) => s + v, 0);
// eq(b, "(0 1 4 9)");
// eq(c, "(14)");
// a.set(0, 4);
// eq(b, "(16 1 4 9)");
// eq(c, "(30)");

// a = [[0], [1], [2], [3]];
// b = a.bmap(v => v.bmap(v => v ** 2));
// c = b.breduce((s, v, _, $) => s + $(v)[0], 0);
// eq(b, "((0) (1) (4) (9))");
// eq(c, "(14)");
// a[0].set(0, 4);
// eq(b, "((16) (1) (4) (9))");
// eq(c, "(30)");

// data = [[
//     M.id("lanesun"),
//     M.money(20),
// ], [
//     M.id("foo"),
//     M.money(16),
// ], [
//     M.id("bar"),
//     M.money(32),
// ]];
// sum_money = data.breduce((sum, person, _, $) => sum + $(person.get("money")).val, 0);
// sort_data = data.bsort((a, b, $) => $(a.get("money")).val - $(b.get("money")).val);
// eq(sum_money, "(68)");
// eq(sort_data, "((id(foo) money(16)) (id(lanesun) money(20)) (id(bar) money(32)))");
// data[1].get("money").val = 48;
// eq(sum_money, "(100)");
// eq(sort_data, "((id(lanesun) money(20)) (id(bar) money(32)) (id(foo) money(48)))");
// data[1].get("money").val = 68;
// eq(sum_money, "(120)");
// eq(sort_data, "((id(lanesun) money(20)) (id(bar) money(32)) (id(foo) money(68)))");
