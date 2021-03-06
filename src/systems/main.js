"use strict";

window.addEventListener("load", () => {

    const debug_physics = true;
    const process_graphics_frame = init_graphics();
    const process_physics_frame = init_physics();
    const process_logic_frame = init_logic();
    const get_delta = utils.get_delta();
    const cannonDebugRenderer = new THREE.CannonDebugRenderer(window.scene.obj, window.world.obj);

    function frame() {

        const delta = get_delta.next().value;
        process_logic_frame(delta);
        process_physics_frame(delta);
        if (debug_physics === true) {
            cannonDebugRenderer.update();
        }
        process_graphics_frame(delta);
        window.requestAnimationFrame(frame);

    }
    frame(); // start process //

});

