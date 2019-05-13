"use strict";

const Assemblages = {
    player() {
        return {
            position: [0, 0, -5],
            rotation: [0, 0, 0],
            fire_cooldown: 0,
        };
    },
    bullet(position=[0,0,0], direction=[0,0,-1], lifetime=2) {
        return {position, lifetime, direction};
    },
    enemy(position=[0,0,-10], health=100.0) {
        return {position, health};
    },
};

const model3d = {
    player: Assemblages.player(),
    camera: {
        position: [0, 2, 3],
    },

    bullets: [],
    enemies: [
        Assemblages.enemy(),
    ],
};
