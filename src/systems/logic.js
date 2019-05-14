"use strict";

function init_logic() {

    window.keyInput = {};
    window.onkeyup = function(e) { keyInput[e.key] = false; }
    window.onkeydown = function(e) { keyInput[e.key] = true; }
    let elapsed = 0;

    return (delta) => {

        elapsed += delta;

        const movement_vector = [0, 0, 0];
        const x_speed = 8;
        const z_speed = 2;

        if (keyInput.w) {
            movement_vector[2] -= z_speed * delta;
        }
        if (keyInput.s) {
            movement_vector[2] += z_speed * delta;
        }
        if (keyInput.a) {
            movement_vector[0] -= x_speed * delta;
        }
        if (keyInput.d) {
            movement_vector[0] += x_speed * delta;
        }

        const player = model3d.player;
        if (player.fire_cooldown <= 0) {
            if (keyInput[" "]) {
                model3d.bullets.push(
                    Assemblages.bullet(player.position.slice())
                );
                player.fire_cooldown = 0.2;
            }
        } else {
            player.fire_cooldown -= delta;
        }

        const dead_bullets = [];
        for (let i = 0; i < model3d.bullets.length; i++) {
            const bullet = model3d.bullets[i];
            bullet.position[2] -= delta * 10;
            bullet.lifetime -= delta;
        }

        // remove expired bullets //
        model3d.bullets = model3d.bullets.filter(b => b.lifetime > 0);

        model3d.player.position.forEach((val, i) => {
            model3d.player.position[i] += movement_vector[i];
        });

    };
}
