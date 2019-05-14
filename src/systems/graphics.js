"use strict";

const render_player = () =>
    G3.cubeMesh({
        onInitialize(obj, model) {
            obj.position.x = 0;
            obj.position.y = 0;
            obj.position.z = 0;
        },
        onUpdate(obj, model) {
            obj.position.x = model.player.position[0];
            obj.position.y = model.player.position[1];
            obj.position.z = model.player.position[2];
        },
    });


const render_bullets = () =>

    new G3.ForEach({
        model: scope => scope.bullets,
        child: () => 
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
        }),
    });


const render_enemies = () =>
    new G3.ForEach({
        model: scope => scope.enemies,
        child: () =>
        G3.cubeMesh({
            onInitialize(obj, enemy) {
                obj.position.x = enemy.position[0];
                obj.position.y = enemy.position[1];
                obj.position.z = enemy.position[2];
                Object.assign(obj.material.color, {r:1,g:0,b:0});
            },
            onUpdate(obj, enemy) {
                obj.position.x = enemy.position[0];
                obj.position.y = enemy.position[1];
                obj.position.z = enemy.position[2];
            },
        }),
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


function init_graphics() {

    const scene = 
        new G3.Scene({
            camera: game_camera(),
            children: [
                render_player(),
                render_bullets(),
                render_enemies(),
            ],
        });

    return (delta) => scene.update(delta);
}

