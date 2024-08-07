const id = "#core:stash"
const provides = [".core:stash"]
const requires = {
}

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_essential(plugins, requires);
    }

    ".core:rule-loader" = [
        "rule",
    ]

    init() {
        Names("Stash", {"zh-CN": "暂存区"});
        Names("Copy", {"zh-CN": "复制"});
        Names("Cut", {"zh-CN": "剪切"});
        Names("Paste", {"zh-CN": "粘贴"});
    }

    data_records = []

    data_cur_index = []

    ".core:view"() {
        return {
            id,
            name: Names("Stash"),
            icon: "clipboard",
            grow: true,
            melem: div
                .class(cname("root"), "s-scrollbar", "s-frame")
                .$inner(
                    this.data_records.bmap(record =>
                        div
                            .class(...[
                                [cname("record", "s-item")],
                                this.data_cur_index.btrans(index => index === this.data_records.indexOf(record) ? ["f-active"] : []),
                            ].bflat())
                            .$on({
                                "click": () => {
                                    this.data_cur_index.val = this.data_records.indexOf(record);
                                },
                            })
                        (
                            record.melem,
                        ),
                    ),
                )
            (),
        };
    }

    push(record) {
        this.data_records.prefix(record);
        this.data_cur_index.val = 0;
    }

    get(index = this.data_cur_index.val) {
        return this.data_records[index];
    }

    clear() {
        this.data_records.clear();
        this.data_cur_index.clear();
    }
}

const {div} = ME;
const cname = name => "core-stash-" + name;