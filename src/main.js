const model = {
    title: "Users",
    frames: 0,
    sin: 0,
    users: [
        {username: "jim", departments: [12, 13, 872]},
        {username: "flynn", departments: [52, 28, 98, 23]},
    ]
};

const model3d = {
    player: {
        position: [0, 0.5, -4],
        rotation: [0, 1, 1.5],
    },
    enemies: [
        {   position: [1, 0, -5],
            rotation: [0, 1, 1], },
        {   position: [2, 0, -5],
            rotation: [0, 1, 1], },
        {   position: [3, 0, -5],
            rotation: [0, 1, 1], },
    ],
};


window.keyInput = {};
window.addEventListener("load", () => {

    const debug = false;
    if (debug === true) {

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);


        // actual scene //
        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
        });

        const cube = new THREE.Mesh(geometry, material);
        const point_light = new THREE.PointLight(0xff0000, 1, 100);
        point_light.position.set(5, 4, 0);
        scene.add(point_light);

        const ambient_light = new THREE.AmbientLight(0x404040);
        scene.add(ambient_light);

        scene.add(cube);
        camera.position.z = 5;
        camera.position.y = 4;
        camera.position.x = 0;
        camera.rotation.x = Math.PI * -0.125;

        const get_delta = utils.get_delta();

        function animate() {
            const delta = get_delta.next().value;
            requestAnimationFrame(animate);
            cube.rotation.x += delta;
            cube.rotation.y += delta;
            cube.rotation.z += delta;
            renderer.render(scene, camera);
        }
        animate();

    } else {

        window.scene = new Scene({

            children: [

                //new Cube({
                //    onInitialize(obj, scope) {
                //        obj.position.x = scope.player.position[0]-1;
                //        obj.position.y = scope.player.position[1]-1;
                //        obj.position.z = scope.player.position[2]-1;
                //    },
                //    onUpdate(obj, scope) {
                //        obj.rotation.x = scope.player.rotation[0]*2;
                //        obj.rotation.y = scope.player.rotation[1]*2;
                //        obj.rotation.z = scope.player.rotation[2]*2;
                //    },
                //}),

                new ForEach({
                    model: scope => scope.enemies,
                    child: () =>
                    new Cube({
                        onInitialize(obj, enemy) {
                            obj.position.x = enemy.position[0];
                            obj.position.y = enemy.position[1];
                            obj.position.z = enemy.position[2];
                            Object.assign(obj.material.color, {r:1,g:0,b:0});
                        },
                        onUpdate(obj, enemy) {
                            obj.rotation.x = enemy.rotation[0];
                            obj.rotation.y = enemy.rotation[1];
                            obj.rotation.z = enemy.rotation[2];
                        },
                    }),
                })

            ],

        });


        window.onkeyup = function(e) { keyInput[e.key] = false; }
        window.onkeydown = function(e) { keyInput[e.key] = true; }


        const get_delta = utils.get_delta();
        let elapsed = 0;
        function frame() {
            delta = get_delta.next().value;
            elapsed += delta;

            model3d.player.rotation[0] = Math.sin(elapsed);
            model3d.player.rotation[1] = Math.cos(elapsed);

            for (let i = 0; i < model3d.enemies.length; i++) {
                model3d.enemies[i].rotation[0] = Math.sin(elapsed+i);
                model3d.enemies[i].rotation[1] = Math.cos(elapsed+i);
            }

            if (keyInput.Enter) {
                const num_enemies = Math.random() * 10;
                const difflen = Math.abs(num_enemies, model3d.enemies.length);
                if (num_enemies !== model3d.enemies.length) {
                    if (num_enemies < model3d.enemies.length) {
                        model3d.enemies = model3d.enemies.slice(0, num_enemies);
                    } else {
                        for (let i = 0; i < difflen; i++) {
                            model3d.enemies.push({
                                position: [i-5, 0, -5],
                                rotation: [0, 1, 1],
                            });
                        }
                    }
                }

            }

            scene.update(delta);
            window.requestAnimationFrame(frame);
        }
        frame();
    }

});


class Scope {
    constructor(pnode=null, data={}) {
        this.parent = pnode;
        this.data = data;
    }

    get(key) {
        const val = this.data[key];
        return val || this.parent.get(key);
    }

    set(key, val) {
        this.data[key] = val;
    }
}


class Scene {

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
}

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
        console.log("leaving");
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

class ForEach extends E3 {

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
                    console.log("difflen: %d, offset: %d, i: %d, arr_len: %d", difflen, offset, i, arr.length);
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
}

class Cube extends E3 {
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
}
