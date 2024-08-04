const id = "#core:commander"
const provides = [".core:commander"]
const requires = {
}

export default class extends TTPlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_essential(plugins, requires);
    }

    // ".core:style-loader" = []

    request(anchor, cmds, filter = fuzzy_filter) {
        // TODO
    }
}

const fuzzy_filter = (input, cmd) => {
    const {path} = cmd;
    const t_input = input.toLowerCase();
    const t_path = path.toLowerCase();
    if (t_input === '') {
        return 1;
    } else {
        const score_to_opts_list = [];
        for (const [name, opts] of this.node_type_name_map) {
            const score = fuzzy_score(name, str);
            if (score > 0) score_to_opts_list.push([score, opts]);
        }
        score_to_opts_list.sort((a, b) => b[0] - a[0]);
        return score_to_opts_list.map(e => e[1]);
    }
};