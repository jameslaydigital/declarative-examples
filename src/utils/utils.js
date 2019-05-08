const utils = {};
window.symbol_table = {};

utils.element_by_id = (list => id => {
    return (list[id] = list[id] || document.getElementById(id));
})({});


utils.reconcile_array = (array, parentNode, creator_function) => {
    if (array.length !== parentNode.children.length) {
        const difflen = Math.abs(parentNode.children.length - array.length);
        const offset = Math.min(parentNode.children.length, array.length);
        if (array.length > parentNode.children.length) {
            // add more kids
            for (let i = 0; i < difflen; i++) {
                parentNode.appendChild(creator_function());
            }
        } else {
            // reduce kids
            for (let i = difflen-1; i >= 0; i--) {
                parentNode.removeChild(parentNode.children[offset+i]);
            }
        }
    }
};

utils.create_element = (name="div", attrs={}) => {
    attrs.children = attrs.children || [];
    const el = document.createElement(name);
    // apply attributes //
    for (const [name, val] of Object.entries(attrs)) {
        if (name !== "children") {
            el[name] = val;
        }
    }
    // append children //
    for (const child of attrs.children) {
        el.appendChild(child);
    }
    return el;
};

function transmogrify(root_selector, func) {
    const ast = esprima.parse(func.toString());
    window.symbol_table.root_selector = root_selector;
    const output = visitors.visit(ast);
    return new Function("model", output);
}


utils.get_delta = function *get_delta() {
    let last_time = Date.now();
    while (true) {
        const new_time = Date.now();
        const delta = (new_time - last_time) * 0.001;
        last_time = new_time;
        yield delta;
    }
};
