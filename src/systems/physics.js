"use strict";

function init_physics() {
    const world = new P3.World({

        onInitialize(obj, scope) {
            obj.gravity.set(0, -9.82, 0);
        },

        children: [
            P3.boxBody({

                onInitialize(obj, scope) {
                    obj.position.set(
                        scope.player.position[0],
                        scope.player.position[1],
                        scope.player.position[2]
                    );
                },

                onPreStep(obj, scope) {
                    obj.position.set(
                        scope.player.position[0],
                        scope.player.position[1]+1,
                        scope.player.position[2]
                    );
                },

                onPostStep(obj, scope) {
                    scope.player.position[0] = obj.position.x;
                    scope.player.position[1] = obj.position.y-1;
                    scope.player.position[2] = obj.position.z;
                },

            }),
            P3.groundBody({}),
        ],
    });

    return (delta) => {
        world.update(delta);
    };
}


function finit_physics() {

    let elapsed = 0.0;

    // world \\
    const world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);
    world.broadphase = new CANNON.NaiveBroadphase();

    // box \\
    const boxShape = new CANNON.Box(new CANNON.Vec3(0, 0, 0));
    const boxBody = new CANNON.Body({mass: 1});
    boxBody.addShape(boxShape);
    boxBody.position.set(
        model3d.player.position[0],
        model3d.player.position[1]-1,
        model3d.player.position[2]
    );
    world.add(boxBody);

    // ground plane \\
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({
        mass: 0,
        shape: groundShape,
    });
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/2)
    groundBody.position.set(0, 0, 0);
    world.add(groundBody);

    return delta => {
        const timeStep = 1/60;
        const maxSubSteps = 3;
        elapsed += delta;

        boxBody.position.x = model3d.player.position[0]
        boxBody.position.y = model3d.player.position[1]
        boxBody.position.z = model3d.player.position[2]

        world.step(timeStep, delta, maxSubSteps);

        model3d.player.position[0] = boxBody.position.x;
        model3d.player.position[1] = boxBody.position.y;
        model3d.player.position[2] = boxBody.position.z;
    };

}
