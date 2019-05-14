"use strict";

class G3 {

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

G3.PerspectiveCamera = class {

    constructor({onInitialize=()=>{}, onUpdate=()=>{}}) {
        this.obj = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.onInitialize = onInitialize;
        this.onUpdate = onUpdate;
    }

    enter(parent_node) {}

    leave() {}

    update(scope) {
        this.onUpdate(this.obj, scope);
    }

    initialize(scope) {
        this.onInitialize(this.obj, scope);
    }
};


G3.Scene = class {

    // TODO - this and World should inherit from the same abstract class.

    constructor({camera=null, onUpdate=()=>{}, onInitialize=()=>{}, children = []}) {
        this.camera = camera || new G3.PerspectiveCamera();
        this.renderer = new THREE.WebGLRenderer();
        this.children = children;
        this.onUpdate = onUpdate;
        this.onInitialize = onInitialize;
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
        this.onUpdate(this.obj, scope);
        this.camera.update(scope);
        for (const child of this.children) {
            child.update(scope);
        }
        this.renderer.render(this.obj, this.camera.obj);
    }

    initialize() {
        const scope = Object.create(model3d);
        this.onInitialize(this.obj, scope);
        this.camera.initialize(scope);
        for (const child of this.children) {
            child.initialize(scope);
        }
    }
};

G3.ForEach = class extends G3 {

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

G3.Mesh = class extends G3 {
    constructor(params) {
        super(params);
        this.geometry = params.geometry || new THREE.BoxGeometry(1,1,1);
        this.material = params.material || new THREE.MeshBasicMaterial({
            color:0x00ff00
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

G3.cubeMesh = ({width=1, height=1, depth=1, ...params}) => {
    return new G3.Mesh({
        ...params,
        geometry: new THREE.BoxGeometry(
            width,
            height,
            depth
        ),
    });
}

G3.sphereMesh = ({radius=1, widthSegments=1, heightSegments=1, ...params}) => {
    return new G3.Mesh({
        ...params,
        geometry: new THREE.SphereGeometry(
            radius,
            widthSegments,
            heightSegments
        ),
    });
}
