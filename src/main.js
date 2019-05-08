"use strict";

const model3d = {
    player: {
        position: [0, 0.5, -4],
        rotation: [0, 1, 1.5],
    },
    enemy_groups: [
        {
            enemies: [
                {   position: [1, 0, -5],
                    rotation: [0, 1, 1], },
                {   position: [2, 0, -5],
                    rotation: [0, 1, 1], },
                {   position: [3, 0, -5],
                    rotation: [0, 1, 1], },
            ],
        },
        {
            enemies: [
                {   position: [1, 0, -5],
                    rotation: [0, 1, 1], },
                {   position: [2, 0, -5],
                    rotation: [0, 1, 1], },
                {   position: [3, 0, -5],
                    rotation: [0, 1, 1], },
            ],
        },
    ],
};

window.keyInput = {};
window.addEventListener("load", () => {
    window.scene = new E3.Scene({
        children: [
            new E3.ForEach({
                model: scope => scope.enemy_groups,
                child: () =>
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
                }),
            }),
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

        for (const grp of model3d.enemy_groups) {
            for (let i = 0; i < grp.enemies.length; i++) {
                grp.enemies[i].rotation[0] = Math.sin(elapsed+i);
                grp.enemies[i].rotation[1] = Math.cos(elapsed+i);
            }
        }

        if (keyInput.Enter) {
            let grp_num = 0;
            for (const grp of model3d.enemy_groups) {

                const num_enemies = Math.random() * 10;
                const difflen = Math.abs(num_enemies, grp.enemies.length);

                if (num_enemies !== grp.enemies.length) {
                    if (num_enemies < grp.enemies.length) {
                        grp.enemies = grp.enemies.slice(0, num_enemies);
                    } else {
                        for (let i = 0; i < difflen; i++) {
                            grp.enemies.push({
                                position: [i-5, grp_num*2, -5],
                                rotation: [0, 1, 1],
                            });
                        }
                    }
                }
                grp_num++;
            }

        }

        scene.update(delta);
        window.requestAnimationFrame(frame);
    }
    frame();
});
