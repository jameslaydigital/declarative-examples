class P3 {

    constructor({onInitialize=()=>{}, onPostStep=()=>{}, onPreStep=()=>{}, children=[]}) {
        this.children = children;
        this.onPreStep = onPreStep;
        this.onPostStep = onPostStep;
        this.onInitialize = onInitialize;
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

    preStep(scope) {
        this.onPreStep(this.obj, scope);
        this.children.forEach(child => child.update(scope));
    }

    postStep(scope) {
        this.onPostStep(this.obj, scope);
        this.children.forEach(child => child.update(scope));
    }

    initialize(scope) {
        this.onInitialize(this.obj, scope);
        this.children.forEach(child => child.initialize(scope));
    }

}


P3.Body = class extends P3 {
    constructor({shape=null, mass=1, ...params}) {
        super({...params});
        const body = new CANNON.Body({mass});
        body.addShape(
            shape || 
            new CANNON.Box(
                new CANNON.Vec3(0, 0, 0)
            )
        );
        this.obj = body;
    }
};

P3.groundBody = ({width=1, height=1, depth=1, mass=0, onInitialize=()=>{}, ...params}) => 
    new P3.Body({
        shape: new CANNON.Plane(),
        mass,
        onInitialize(obj, scope) {
            obj.position.set(0, 0, 0);
            obj.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/2);
            onInitialize(obj, scope);
        },
        ...params,
    });

P3.boxBody = ({width=1, height=1, depth=1, mass=1, ...params}) => 
    (console.log(params), 
    new P3.Body({
        shape: new CANNON.Box(
            new CANNON.Vec3(width/2, height/2, depth/2)
        ),
        mass,
        ...params,
    }));


P3.World = class {

    // TODO - this and Scene should inherit from the same abstract class.

    constructor({onPreStep=()=>{}, onPostStep=()=>{}, onInitialize=()=>{}, children=[]}) {
        this.onInitialize = onInitialize;
        this.children = children;
        this.onPreStep = onPreStep;
        this.onPostStep = onPostStep;
        this.obj = new CANNON.World();
        this.obj.broadphase = new CANNON.NaiveBroadphase();
        for (const child of children) {
            child.enter(this);
        }
        this.initialize();
        this.update();
        window.world = this.obj;
    }

    update(delta) {
        const timeStep = 1/60;
        const maxSubSteps = 3;

        const scope = Object.create(model3d);
        scope.delta = delta;

        this.onPreStep(this.obj, scope);
        for (const child of this.children) {
            child.preStep(scope);
        }
        this.obj.step(timeStep, delta, maxSubSteps);
        this.onPostStep(this.obj, scope);
        for (const child of this.children) {
            child.postStep(scope);
        }
    }

    initialize() {
        const scope = Object.create(model3d);
        this.onInitialize(this.obj, scope);
        for (const child of this.children) {
            child.initialize(scope);
        }
    }

};

P3.ForEach = class extends G3 {

    constructor({model=(()=>{}), as=Math.random().toString(), child=(()=>[])}) {
        super({children:[]});
        this.model = model;
        this.as = as;
        this.child = child;
        this.children = [];
        // TODO - figure this part out
        // this is a temporary placeholder to hold its children until we get access to the world object
        this.obj = {
            children: [],
            add: (obj) => {
                this.obj.children = obj;
            },
        };
    }

    enter(parent_node) {
        this.parent = parent_node;
        this.obj = this.parent.obj; // switcheroo //
        for (const child of this.children) {
            child.enter(this);
        }
    }

    leave() {
        for (const child of this.children) {
            child.leave();
        }
        this.children = null;
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

    preStep(scope) {
        // reconcile arrays before prestep //
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
            child.preStep(child_scope);
        }
    }

    postStep(scope) {
        const arr = this.model(scope);
        for (let i = 0; i < arr.length; i++) {
            const row = arr[i];
            const child = this.children[i];
            const child_scope = Object.assign(Object.create(scope), row);
            child.postStep(child_scope);
        }
    }

};
