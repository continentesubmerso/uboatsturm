import { Enemy } from "./Enemy";
import { CannonProjectile } from "./CannonProjectile";
import { BubbleManager } from "../systems/BubbleManager";

export class Corvette extends Enemy {
    constructor(scene, x, y, angle) {
        angle = isNaN(angle) ? 0 : angle;

        const hullColor = 0x6b7280;
        const deckColor = 0x4b5563;
        const bridgeColor = 0x374151;
        const gunColor = 0x1f2937;
        const mastColor = 0x8b4513;
        const smokeStackColor = 0x2d3748;

        const sprite = scene.add
            .container(x, y, [
                scene.add
                    .ellipse(0, 0, 70, 16, hullColor)
                    .setStrokeStyle(1, 0x1f2937),

                scene.add
                    .rectangle(0, 0, 60, 10, deckColor)
                    .setStrokeStyle(1, 0x374151),

                scene.add
                    .rectangle(5, 0, 22, 8, bridgeColor)
                    .setStrokeStyle(1, 0x1f2937),

                scene.add
                    .rectangle(8, -1, 12, 5, 0x1f2937)
                    .setStrokeStyle(1, 0x111827),

                scene.add
                    .rectangle(-5, -1, 7, 7, smokeStackColor)
                    .setStrokeStyle(1, 0x111827),

                scene.add.rectangle(-5, -4, 8, 1.5, 0x111827),

                scene.add.rectangle(22, 0, 10, 3, gunColor),
                scene.add.rectangle(27, 0, 6, 1.5, gunColor),

                scene.add.rectangle(-18, 0, 5, 2.5, gunColor),

                scene.add.rectangle(12, -6, 0.8, 6, mastColor),

                scene.add.rectangle(-12, -5, 0.8, 5, mastColor),

                scene.add.rectangle(12, -9, 3, 0.8, 0x666666),

                scene.add.ellipse(-2, -5, 6, 2.5, 0x8b4513),
                scene.add.ellipse(-2, 5, 6, 2.5, 0x8b4513),

                scene.add.circle(-25, -3, 1.5, 0x2d3748),
                scene.add.circle(-25, 0, 1.5, 0x2d3748),
                scene.add.circle(-25, 3, 1.5, 0x2d3748),

                scene.add.rectangle(-20, 0, 5, 6, gunColor),

                scene.add.rectangle(0, -2.5, 55, 0.4, 0x6b7280),
                scene.add.rectangle(0, 2.5, 55, 0.4, 0x6b7280),

                scene.add.circle(0, -3, 1.2, 0x374151),
                scene.add.circle(-12, 0, 1.2, 0x374151),

                scene.add.circle(8, -4, 0.8, 0x4b5563),
                scene.add.circle(-8, 4, 0.8, 0x4b5563),

                scene.add.star(30, 0, 3, 1.5, 4, 0x1f2937),
            ])
            .setRotation(angle);

        super(scene, x, y, sprite, 50, angle);

        this.smokeManager = new BubbleManager(scene);
        this.smokeInterval = 0;
        this.smokeEmitterPosition = { x: -5, y: 0 };

        if (!this.sprite) return;

        this.sprite.body
            .setCircle(30)
            .setOffset(-25, -25)
            .setDamping(false)
            .setDrag(2)
            .setAngularDrag(3);

        this.lastCannonShot = 0;

        this.mainGun = this.sprite.list[9];
        this.gunBarrel = this.sprite.list[10];
        this.funnel = this.sprite.list[6];
    }

    update(delta, submarine) {
        if (!this.sprite.active) return;

        if (isNaN(this.sprite.rotation) || !isFinite(this.sprite.rotation)) {
            this.sprite.rotation = 0;
        }

        this.scene.physics.velocityFromRotation(
            this.sprite.rotation,
            Math.abs(this.speed),
            this.sprite.body.velocity
        );

        if (
            isNaN(this.sprite.body.velocity.x) ||
            isNaN(this.sprite.body.velocity.y)
        ) {
            this.speed = 50;
            this.sprite.rotation = isNaN(this.sprite.rotation)
                ? 0
                : this.sprite.rotation;
            this.scene.physics.velocityFromRotation(
                this.sprite.rotation,
                this.speed,
                this.sprite.body.velocity
            );
        }

        this.updateSmoke(delta);

        if (!submarine.active || submarine.scene.isDiving) return;
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        const marginX = width * 0.1;
        const marginY = height * 0.1;

        if (
            submarine.x > marginX &&
            submarine.x < width - marginX &&
            submarine.y > marginY &&
            submarine.y < height - marginY &&
            this.scene.time.now - this.lastCannonShot >= 3000
        ) {
            this.lastCannonShot = this.scene.time.now;
            let angle = Phaser.Math.Angle.Between(
                this.x,
                this.y,
                submarine.x,
                submarine.y
            );

            if (Phaser.Math.Between(0, 100) < 60) {
                angle += Phaser.Math.DegToRad(Phaser.Math.Between(-45, 45));
            }

            const cannonX = this.x + Math.cos(this.rotation) * 22;
            const cannonY = this.y + Math.sin(this.rotation) * 22;

            const projectile = new CannonProjectile(
                this.scene,
                cannonX,
                cannonY,
                angle
            );

            if (projectile.sprite) {
                this.scene.cannonProjectiles.add(projectile.sprite);
                this.scene.physics.add.existing(projectile.sprite);
                const speed = 250; //velocidade do projétil
                projectile.sprite.body.setVelocity(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                );

                this.animateGunRecoil();
            }
        }
    }

    updateSmoke(delta) {
        this.smokeInterval += delta;

        if (this.smokeInterval >= 100) {
            this.smokeInterval = 0;

            const worldX =
                this.x +
                Math.cos(this.rotation) * this.smokeEmitterPosition.x -
                Math.sin(this.rotation) * this.smokeEmitterPosition.y;
            const worldY =
                this.y +
                Math.sin(this.rotation) * this.smokeEmitterPosition.x +
                Math.cos(this.rotation) * this.smokeEmitterPosition.y;

            this.smokeManager.createBubble(
                worldX,
                worldY,
                null,
                Phaser.Math.Between(20, 40),
                Phaser.Math.Between(4, 8),
                0x111111
            );

            if (Phaser.Math.Between(0, 100) > 70) {
                this.smokeManager.createBubble(
                    worldX,
                    worldY,
                    null,
                    Phaser.Math.Between(15, 30),
                    Phaser.Math.Between(3, 6),
                    0x333333
                );
            }
        }

        this.smokeManager.update(delta);
    }

    animateGunRecoil() {
        if (this.gunBarrel) {
            this.scene.tweens.add({
                targets: this.gunBarrel,
                x: this.gunBarrel.x - 2,
                duration: 100,
                yoyo: true,
                ease: "Power2",
            });
        }
    }

    destroy() {
        const worldX =
            this.x +
            Math.cos(this.rotation) * this.smokeEmitterPosition.x -
            Math.sin(this.rotation) * this.smokeEmitterPosition.y;
        const worldY =
            this.y +
            Math.sin(this.rotation) * this.smokeEmitterPosition.x +
            Math.cos(this.rotation) * this.smokeEmitterPosition.y;

        for (let i = 0; i < 15; i++) {
            this.smokeManager.createBubble(
                worldX,
                worldY,
                null,
                Phaser.Math.Between(50, 150),
                Phaser.Math.Between(6, 12),
                0x222222
            );
        }

        super.destroy();
    }
}

