(global => {
    global.select = (elem) => {
        sel = window.getSelection();
        sel.removeAllRanges();
        sel.selectAllChildren(elem);
    };
})(window);