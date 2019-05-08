"use strict";

class E3 {

    constructor({onInitialize=()=>{}, onUpdate=()=>{}, children=[]}) {
        this.children = children;
        this.onInitialize = onInitialize;
        this.onUpdate = onUpdate;
    }

    enter(parent_node) {
        this.parent = parent_node;
        for (const child of this.children) {
            child.enter(this);
        }
        this.parent.obj.add(this.obj);
    }

    leave() {
        this.parent.obj.remove(this.obj);
        for (const child of this.children) {
            child.leave();
        }
        this.children = null;
    }

    update(scope) {
        this.onUpdate(this.obj, scope);
        this.children.forEach(child => child.update(scope));
    }

    initialize(scope) {
        this.onInitialize(this.obj, scope);
        this.children.forEach(child => child.initialize(scope));
    }

}

E3.Scene = class {

    constructor({children = []}) {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.children = children;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        this.obj = new THREE.Scene();
        for (const child of children) {
            child.enter(this);
        }
        this.initialize();
        this.update();
    }

    update(delta) {
        const scope = Object.create(model3d);
        scope.delta = delta;
        for (const child of this.children) {
            child.update(scope);
        }
        this.renderer.render(this.obj, this.camera);
    }

    initialize() {
        const scope = Object.create(model3d);
        for (const child of this.children) {
            child.initialize(scope);
        }
    }
};

E3.ForEach = class extends E3 {

    constructor({model=(()=>{}), as=Math.random().toString(), child=(()=>[])}) {
        super({children:[]});
        this.model = model;
        this.as = as;
        this.child = child;
        this.children = [];
        this.obj = new THREE.Object3D();
    }

    initialize(scope) {
        for (const row of this.model(scope)) {
            const child_scope = Object.assign(Object.create(scope), row);
            const child = this.child();
            this.children.push(child);
            child.enter(this);
            child.initialize(child_scope);
        }
    }

    update(scope) {

        // TODO: reconcile children with data //

        const arr = this.model(scope);
        if (this.children.length !== arr.length) {
            const difflen = Math.abs(this.children.length - arr.length);
            const offset = Math.min(this.children.length, arr.length);

            if (this.children.length > arr.length) {
                // remove excess children
                for (let i = 0; i < difflen; i++) {
                    const child = this.children.pop();
                    child.leave();
                }
            } else {
                // add deficit children
                for (let i = 0; i < difflen; i++) {
                    const element = arr[offset+i];
                    const child_scope = Object.assign(Object.create(scope), element);
                    const child = this.child();
                    this.children.push(child);
                    child.enter(this);
                    child.initialize(child_scope);
                }
            }
        }

        for (let i = 0; i < arr.length; i++) {
            const row = arr[i];
            const child = this.children[i];
            const child_scope = Object.assign(Object.create(scope), row);
            child.update(child_scope);
        }
    }
};

E3.Cube = class extends E3 {
    constructor(params){
        super(params);
        this.geometry = new THREE.BoxGeometry(1,1,1);
        this.material = new THREE.MeshBasicMaterial({
            color:0x00ff00,
            wireframe:true,
        });
        this.obj = new THREE.Mesh(this.geometry, this.material);
    }

    enter(parent_node) {
        super.enter(parent_node);
    }

    leave() {
        super.leave();
    }
};
