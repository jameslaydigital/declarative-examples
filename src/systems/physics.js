"use strict";

function init_physics() {
    window.world = new P3.World({
        onInitialize(obj, scope) {
            obj.gravity.set(0, -9.82, 0);
        },
        children: [

            new P3.ForEach({
                model: scope => [scope.player],
                child: () => physics_player(),
            }),

            new P3.ForEach({
                model: scope => scope.enemies.filter(enemy => enemy.health > 0),
                child: () => physics_player(),
            }),

            P3.groundBody({}),
        ],
    });
    return (delta) => {
        world.update(delta);
    };
}

const physics_player = () =>
    P3.boxBody({
        onInitialize(obj, player) {
            obj.position.set(
                player.position[0],
                player.position[1],
                player.position[2]
            );
            // TODO - add this into P3
            obj.addEventListener("collide", ({body, contact}) => { });
        },
        onPreStep(obj, player) {
            obj.force.set(
                player.force[0],
                player.force[1],
                player.force[2]
            );
        },
        onPostStep(obj, player) {
            player.position[0] = obj.position.x
            player.position[1] = obj.position.y;
            player.position[2] = obj.position.z;
        },
    });
