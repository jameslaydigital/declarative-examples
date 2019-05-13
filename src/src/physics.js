"use strict";

function init_physics() {

    let elapsed = 0.0;

    // world \\
    const world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);
    world.broadphase = new CANNON.NaiveBroadphase();

    // sphere \\
    const boxShape = new CANNON.Box(new CANNON.Vec3(0, 0, 0));
    const boxBody = new CANNON.Body({mass: 1});
    boxBody.addShape(boxShape);
    boxBody.position.set(
        model3d.player.position[0],
        model3d.player.position[1]-1,
        model3d.player.position[2]
    );
    world.addBody(boxBody);

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
