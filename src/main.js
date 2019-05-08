"use strict";

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
    window.scene = new E3.Scene({
        children: [
            new E3.ForEach({
                model: scope => scope.enemies,
                child: () =>
                new E3.Cube({
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
    let delta;
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
});
