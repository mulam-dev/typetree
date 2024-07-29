export default {

".json:boolean": {
    able: {
        "core:edit": true,
    },
    handles: {
        "core:edit"() {
            this.act.toggle();
        },
    },
},

".json:string": {
    able: {
        "core:edit": true,
    },
    handles: {
        "core:edit"() {
            const res = this.$require["editor:inline-code"].edit(this.data.val);
            if (res !== null) {
                this.act.set(res);
            }
        },
    },
},

".json:number": {
    able: {
        "core:edit": true,
    },
    handles: {
        "core:edit"() {
            const res = this.$require["editor:inline-code"].edit(this.data.val.toString());
            if (res !== null) {
                try {
                    this.act.set(Number.parseFloat(res));
                } catch (_) {}
            }
        },
    },
},

".json:array > *": {
    able: {
        "core:delete": true,
    },
    handles: {
        "core:delete"() {
            //
        },
    },
},

}