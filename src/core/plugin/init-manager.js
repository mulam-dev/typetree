const id = "core:init-manager";
const provides = ["init-manager"];
const requires = [];

/* 
    # 为需要使用依赖性初始化的插件提供支持
*/

export default class extends TypeTreePlugin {
    static id = id
    static provides = provides
    static requires(plugins) {
        return this.req_must(plugins, ...requires);
    }

    /* 
        # 正在等待中的规则
    */
    pendings = [];
    
    all(...rules) {
        return new InitRule("all", {}, rules);
    }

    any(...rules) {
        return new InitRule("any", {}, rules);
    }

    after(rule, handle) {
        this.pendings.push(new InitRule("after", {handle}, [rule]));
    }

    wait(rule) {
        return new Promise(resolve => {
            this.pendings.push(new InitRule("after", {handle: resolve}, [rule]));
        });
    }

    finish(token) {
        this.pendings = this.pendings.map(rule => this.resolve(rule, token)).filter(r => r !== s_finished);
    }

    resolve(rule, token) {
        if (rule instanceof InitRule) {
            switch (rule.type) {
                case "all":
                    rule.rules = rule.rules.map(r => this.resolve(r, token)).filter(r => r !== s_finished);
                    return rule.rules.length === 0 ? s_finished : rule;
                case "any":
                    const rules = rule.rules;
                    for (let i = 0; i < rules.length; i++) {
                        const res = this.resolve(rules[i], token);
                        if (res === s_finished) {
                            return s_finished;
                        } else {
                            rules[i] = res;
                        }
                    }
                    return rule;
                case "after":
                    const res = this.resolve(rule.rules[0], token);
                    if (res === s_finished) {
                        rule.opts.handle();
                        return s_finished;
                    } else {
                        rule.rules[0] = res;
                        return rule;
                    }
            }
        } else {
            return rule === token ? s_finished : rule;
        }
    }
}

class InitRule {
    constructor(type, opts, rules) {
        this.type = type;
        this.opts = opts;
        this.rules = rules;
    }
}

const s_finished = Symbol("finished");
