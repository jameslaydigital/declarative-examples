class E {
    constructor(name, attribute_setters, children) {
        if (typeof name !== "string")
            throw new TypeError("name must be a string");
        if (!(attribute_setters && attribute_setters instanceof Array))
            throw new TypeError("attribute_setters must be an array");
        if (!(children && children instanceof Array))
            throw new TypeError("children must be an array");

        this.name = name;
        if (name === "text") {
            this.dom_node = document.createTextNode("");
        } else {
            this.dom_node = document.createElement(name);
        }
        this.update_listeners = [];

        // establish setters //
        for (const setter of attribute_setters) {
            if (setter instanceof Object) {
                if (!setter.key || !setter.value) {
                    throw new ReferenceError("attribute setter \""+JSON.stringify(setter)+"\" missing key or value property, like {key:..., value:...}");
                }
                if (typeof setter.value === "function") {
                    this.dom_node[setter.key] = setter.value();
                    this.update_listeners.push(() => {
                        this.dom_node[setter.key] = setter.value();
                    });
                } else {
                    this.dom_node[setter.key] = setter.value;
                }
            }
        }

        this.children = children;
    }

    register(...args) {
        this.parent.register(...args);
    }

    unregister(...args) {
        this.parent.unregister(...args);
    }

    enter(parent_node) {
        this.parent = parent_node;
        for (const child of this.children) {
            child.enter(this);
        }
        this.parent.dom_node.appendChild(this.dom_node);
        for (const update_listener of this.update_listeners) {
            this.parent.register(update_listener);
        }
    }

    leave() {
        this.dom_node.parentNode.removeChild(this.dom_node);
        for (const update_listener of this.update_listeners) {
            this.parent.unregister(update_listener);
        }
        for (const child of this.children) {
            child.leave();
        }
        this.children = null;
    }
}


class ForEach {

    constructor(getter, childer) {
        this.dom_node = document.createElement("span");
        this.registry = [];
        this.children = [];
        this.update_listeners = [];
        this.update_listeners.push(() => {
            const data = getter();
            if (data.length !== this.children.length) {
                const difflen = Math.abs(data.length - this.children.length);
                const offset = Math.min(data.length, this.children.length);
                if (this.children.length > data.length) {
                    for (let i = 0; i < difflen; i++) {
                        const child = this.children.pop();
                        child.leave();
                    }
                } else {
                    for (let i = 0; i < difflen; i++) {
                        const child = childer(offset+i);
                        child.enter(this);
                        this.children.push(child);
                    }
                }
            }

            for (const listener of this.registry) {
                listener();
            }

        });
    }

    register(func) {
        this.registry.push(func);
    }

    unregister(func) {
        this.registry = this.registry.filter(listener => listener !== func);
    }

    enter(parent_node) {
        this.parent = parent_node;
        this.parent.dom_node.appendChild(this.dom_node);
        for (const update_listener of this.update_listeners) {
            update_listener();
            this.parent.register(update_listener);
        }
    }

    leave() {
        for (const child of this.children) {
            child.leave();
        }
        for (const update_listener of this.update_listeners) {
            this.parent.unregister(update_listener);
        }
        this.children = null;
    }
}

class RootWrapper {
    constructor(children) {
        this.name = "root";
        this.dom_node = document.getElementById("root");
        this.children = children;
        this.registry = [];
        for (const child of children) {
            child.enter(this);
        }
        const update_interval = 1000;

        setTimeout(function update_loop() {
            for (const listener of this.registry) {
                listener();
            }
            setTimeout(update_loop.bind(this), update_interval);
        }.bind(this), update_interval);
    }

    register(func) {
        this.registry.push(func);
    }

    unregister(func) {
        this.registry = this.registry.filter(listener => listener !== func);
    }

    leave() {
        for (const child of this.children) {
            child.leave();
        }
        this.children = [];
    }
}

/// EXAMPLE CODE ///
//window.root = new RootWrapper([
//    new E("div", [], [
//        new E("text", [{key: "nodeValue", value: _ => model.title + ": " + model.frames + " frames"}], []),
//        new E("ul", [], [
//            new ForEach(() => model.users, (x) =>
//                new E("li", [], [
//                    new E("span", [{key: "innerHTML", value: () => model.users[x].username}], []),
//                    new ForEach(() => model.users[x].departments, (y) =>
//                        new E("span", [], [
//                            new E("text", [{key: "nodeValue", value: () => {
//                                const user = model.users[x];
//                                const department = user.departments[y];
//                                return " " + department + " ";
//                            }}], []),
//                        ]),
//                    ),
//                ]),
//            ),
//        ]),
//    ]),
//]);

