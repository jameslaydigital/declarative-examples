"use strict";

const Assemblages = {
    player() {
        return {
            position: [0, 3, -5],
            force: [0, 0, 0],
            rotation: [0, 0, 0],
            color: [0, 0.5, 1],
            fire_cooldown: 0,
        };
    },
    bullet(position=[0,0,0], direction=[0,0,-1], lifetime=2) {
        return {position, lifetime, direction};
    },
    enemy(position=[0,5,-10], health=100.0) {
        return {
            health,
            position,
            force: [0, 0, 0],
            color: [1, 0.5, 0],
        };
    },
};

const model3d = {
    player: Assemblages.player(),
    camera: {
        position: [0, 2, 3],
    },
    bullets: [],
    enemies: [
        Assemblages.enemy([-3, 4, -8]),
        Assemblages.enemy([1, 5, -10]),
    ],
};
