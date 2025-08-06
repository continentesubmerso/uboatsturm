export class BubbleManager {
    constructor(scene) {
        this.scene = scene;
        this.bubbles = [];
    }

    createBubble(x, y, angle, speed = null, size = 2, color = 0x99ccff) {
        const bubble = this.scene.add.circle(x, y, size, color, 0.8);
        this.scene.physics.add.existing(bubble);
        const bubbleSpeed = speed || Phaser.Math.Between(30, 60);
        const offsetAngle =
            angle !== null
                ? angle + Math.PI + Phaser.Math.FloatBetween(0.5, 0.5)
                : Phaser.Math.FloatBetween(0, 2 * Math.PI);
        bubble.body.setVelocity(
            Math.cos(offsetAngle) * bubbleSpeed,
            Math.sin(offsetAngle) * bubbleSpeed
        );
        this.bubbles.push({ sprite: bubble, life: 1.0 });
        return bubble;
    }

    createExplosion(x, y) {
        for (let i = 0; i < 8; i++) {
            this.createBubble(
                x,
                y,
                Phaser.Math.FloatBetween(0, 2 * Math.PI),
                Phaser.Math.Between(50, 100),
                Phaser.Math.Between(4, 6)
            );
        }
    }

    update(delta) {
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const bubble = this.bubbles[i];
            bubble.life -= delta / 1000;
            if (bubble.life > 0) {
                bubble.sprite
                    .setAlpha(bubble.life * 0.8)
                    .setScale(1 + (1 - bubble.life) * 0.5);
            } else {
                bubble.sprite.destroy();
                this.bubbles.splice(i, 1);
            }
        }
    }
}