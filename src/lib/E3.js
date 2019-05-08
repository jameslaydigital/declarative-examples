// THREE JS Version

class E3 {
    constructor(name, attribute_setters, ...children) {
        if (typeof name !== "string")
            throw new TypeError("name must be a string");
        if (!attribute_setters || attribute_setters instanceof Node)
            throw new TypeError("attribute_setters must be a key-value object");
        if (!(children && children instanceof Array))
            throw new TypeError("children must be an array");

        this.update_listeners = [];
        this.name = name;
        if (name === "text") {
            this.dom_node = document.createTextNode("");
        } else {
            this.dom_node = document.createElement(name);
        }

        this.process_attributes(attribute_setters);

        this.children = children;
    }

    process_attributes(attribute_setters) {
        if (attribute_setters.static) {
            for (const [key, value] of Object.entries(attribute_setters.static)) {
                this.dom_node[key] = value;
            }
        }
        if (attribute_setters.dynamic) {
            for (const [key, value] of Object.entries(attribute_setters.dynamic)) {
                this.dom_node[key] = value();
                this.update_listeners.push(() => {
                    this.dom_node[key] = value();
                });
            }
        }
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


E3.ForEach = class {

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
};

E3.RootWrapper = class {
    constructor(...children) {
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
};

/// EXAMPLE CODE ///
//window.root = new E3.RootWrapper(
//    new E3("scene", {},
//        new E3("text", {"static":{
//            "nodeValue": "welcome!"
//        }}),
//        new E3("br", {}),
//        new E3("text", {dynamic:{
//            "nodeValue": _ => model.title + ": " + model.frames + " frames"
//        }}),
//        new E3("ul", {},
//            new E3.ForEach(() => model.users, (i0) =>
//                new E3("li", {},
//                    new E3("span", {dynamic: {
//                        innerHTML: () => model.users[i0].username
//                    }}),
//                    new E3.ForEach(() => model.users[i0].departments, (i1) =>
//                        new E3("span", {},
//                            new E3("text", {dynamic:{nodeValue: () => {
//                                const user = model.users[i0];
//                                const department = user.departments[i1];
//                                return " " + department + " ";
//                            }}})
//                        )
//                    )
//                )
//            )
//        )
//    )
//);
