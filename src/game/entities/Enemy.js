import { Entity } from "./Entity";

export class Enemy extends Entity {
    constructor(scene, x, y, sprite, speed, angle) {
        super(scene, x, y, sprite);
        if (!this.sprite) return;
        this.scene.physics.velocityFromRotation(
            angle,
            speed,
            this.sprite.body.velocity
        );
        this.sprite.rotation = angle;
    }

    sink() {
        this.scene.tweens.add({
            targets: this.sprite,
            scale: 0.5,
            alpha: 0,
            duration: 1000,
            ease: "Linear",
            onComplete: () => {
                this.destroy();
                this.scene.time.delayedCall(5000, () => {
                    this.scene.levelManager.spawnEnemy();
                });
            },
        });
    }
}