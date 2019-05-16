"use strict";

function init_graphics() {

    window.scene = 
        new G3.Scene({
            camera: game_camera(),
            children: [

                // player 
                new G3.ForEach({
                    model: scope => [scope.player],
                    child: () => render_player(),
                }),

                // enemies 
                new G3.ForEach({
                    model: scope => scope.enemies.filter(enemy => enemy.health > 0),
                    child: () => render_player(),
                }),

                // bullets 
                new G3.ForEach({
                    model: scope => scope.bullets,
                    child: () => render_bullet(),
                }),

            ],
        });

    return (delta) => scene.update(delta);
}

const render_player = () =>
    G3.cubeMesh({
        onInitialize(obj, player) {
            obj.position.x = player.position[0];
            obj.position.y = player.position[1];
            obj.position.z = player.position[2];
            Object.assign(obj.material.color, {
                r:player.color[0],
                g:player.color[1],
                b:player.color[2]
            });
        },
        onUpdate(obj, player) {
            obj.position.x = player.position[0];
            obj.position.y = player.position[1];
            obj.position.z = player.position[2];
        },
    });

const render_bullet = () =>
    G3.sphereMesh({
        radius: 0.5,
        widthSegments: 3,
        heightSegments: 3,
        onInitialize(obj, model) {
            Object.assign(obj.scale, {x:0.5,y:0.5,z:0.5});
            Object.assign(obj.material.color, {r:1,g:1,b:0});
        },
        onUpdate(obj, bullet) {
            obj.position.x = bullet.position[0];
            obj.position.y = bullet.position[1];
            obj.position.z = bullet.position[2];
            Object.assign(obj.material.color, {r:1, g:(bullet.lifetime * bullet.lifetime), b:1});
        }
    });

const game_camera = () => 
    new G3.PerspectiveCamera({
        onInitialize(obj, scope) {
            obj.position.x = scope.camera.position[0];
            obj.position.y = scope.camera.position[1];
            obj.position.z = scope.camera.position[2];
        },
        onUpdate(obj, scope) {
            obj.position.x = scope.camera.position[0];
            obj.position.y = scope.camera.position[1];
            obj.position.z = scope.camera.position[2];
        },
    });

