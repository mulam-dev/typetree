const id = "#core:commander"
const provides = [".core:commander"]
const requires = {
    icon: ".core:icon-loader",
    popup: ".core:popup",
}

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_essential(plugins, requires);
    }

    ".core:style-loader" = [
        "style/commander",
    ]

    data_cmds = []

    data_filter = [""].listen(null, () => this.data_select.val = 0)

    data_select = [0]

    data_scorer = null

    data_popup = [].guard(null, null, popup => popup.free())

    wait_stack = []

    m_results = this.data_cmds.btrans([], (cmds, $) => {
        if (this.data_scorer) {
            $(this.data_filter);
            cmds.forEach(cmd => cmd.score = this.data_scorer(this.data_filter.val, cmd));
            return cmds
                .filter(cmd => cmd.score > 0)
                .sort((a, b) => b.score - a.score);
        } else {
            return cmds;
        }
    })

    c_icon = this.require.icon.load;

    me_input = ME.input
        .class("s-input-text")
        .spellcheck("false")
        .draggable("false")
        .tab_index(-1)
        .$input(this.data_filter)
        .$on({
            "keydown": e => {
                const kill = () => {
                    e.stopPropagation();
                    e.preventDefault();
                };
                const move_select = delta => {
                    kill();
                    this.data_select.val = Math.max(0, Math.min(this.m_results.length - 1, this.data_select.val + delta));
                };
                switch (e.code) {
                    case "ArrowUp": return move_select(-1);
                    case "ArrowDown": return move_select(1);
                    case "Enter":
                    case "Tab":
                        kill();
                        return this.resolve(this.m_results[this.data_select.val]);
                    case "Escape":
                        kill();
                        return this.resolve(null);
                }
            },
        })
    ()

    melem = div
        .class(cname("root"), "s-frame")
    (
        ME.label.class(cname("input"))(
            this.c_icon("prompt"),
            this.me_input,
        ),
        div.class("s-hr")(),
        div
            .class(cname("results"), "s-box", "s-scrollbar")
            .$inner(this.m_results.bmap((cmd, index) => {
                const melem = div
                    .$class([
                        [cname("entry"), "s-item"],
                        this.data_select.btrans([], ([select]) => {
                            if (select === index) {
                                setTimeout(() => {
                                    melem.elem.scrollIntoView({
                                        block: "center",
                                        behavior: "instant",
                                    });
                                }, 0);
                                return ["f-active"]
                            } else {
                                return []
                            }
                        }),
                    ].bflat())
                    .$on({
                        "click": () => {
                            this.resolve(cmd);
                        },
                    })
                (
                    div.class("i-main")(
                        ...(cmd.icon ? [this.c_icon(cmd.icon)] : []),
                        div.class("i-label")(cmd.label ?? ''),
                        div.class("i-detail")(cmd.detail ?? ''),
                    ),
                    div.class("i-footer")(
                        cmd.path,
                    ),
                    
                );
                return melem;
            }))
        ()
    )

    request(anchor, cmds, opts = {}) {
        opts = {
            scorer: this.string_scorer_factory(this.string_neighbor_weighted_scorer),
            ...opts,
        };
        this.data_filter.val = "";
        this.data_scorer = opts.scorer;
        this.data_cmds.assign(cmds);
        const {popup: Popup} = this.require.popup;
        const popup = Popup(anchor, this.melem, opts);
        this.me_input.elem.focus();
        this.data_popup.val = popup;
        popup.wait_free().then(() => this.resolve(null));
        return new Promise(res => {
            this.wait_stack.push(res);
        });
    }

    resolve(cmd) {
        this.data_popup.clear();
        this.wait_stack.forEach(res => res(cmd));
        this.wait_stack.clear();
    }

    string_scorer_factory = string_scorer_factory

    string_front_weighted_scorer = string_front_weighted_scorer

    string_neighbor_weighted_scorer = string_neighbor_weighted_scorer
}

const string_scorer_factory = (scorer) => {
    return (input, cmd) => {
        const {path} = cmd;
        const t_input = input.toLowerCase();
        const t_path = path.toLowerCase();
        if (t_input === '') {
            return 1;
        } else {
            return scorer(t_input, t_path);
        }
    };
}

const string_front_weighted_scorer = (pattern, path) => {
    let score = 0;
    let start_index = 0;
    for (const c of pattern) {
        const new_index = path.indexOf(c, start_index);
        if (new_index >= 0) {
            start_index = new_index + 1;
            score += 2 ** -(new_index + 1);
        } else {
            return 0;
        }
    }
    return score;
};

const string_neighbor_weighted_scorer = (pattern, path) => {
    const start_index = path.indexOf(pattern[0], 0);
    if (start_index >= 0) {
        let cur_index = start_index;
        let score = 1;
        for (const c of pattern.slice(1)) {
            const new_index = path.indexOf(c, cur_index + 1);
            if (new_index >= 0) {
                score += 2 ** -(new_index - cur_index);
                cur_index = new_index;
            } else {
                return 0;
            }
        }
        return Math.max(score, string_neighbor_weighted_scorer(pattern, path.slice(start_index + 1)));
    } else {
        return 0;
    }
};

const {div} = ME;
const cname = name => "core-commander-" + name;