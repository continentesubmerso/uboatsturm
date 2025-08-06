import { Entity } from "./Entity";
export class CannonProjectile extends Entity {
    constructor(scene, x, y, angle) {
        
        const projectileContainer = scene.add.container(x, y);
        projectileContainer.setRotation(angle);

        
        const body = scene.add.rectangle(0, 0, 12, 4, 0x2c3e50);
        body.setStrokeStyle(0.5, 0x1a252f);

        
        const tip = scene.add.triangle(
            6,
            0, 
            6,
            -2, 
            10,
            0, 
            6,
            2 
        );
        tip.setFillStyle(0x34495e);
        tip.setStrokeStyle(0.5, 0x1a252f);

        
        const waist = scene.add.rectangle(-2, 0, 4, 5, 0x2c3e50);
        waist.setStrokeStyle(0.5, 0x1a252f);

        
        const rotatingBand = scene.add.rectangle(-4, 0, 1, 5, 0xe74c3c);
        rotatingBand.setStrokeStyle(0.5, 0x922b21);

        
        const detail1 = scene.add.rectangle(1, 0, 2, 1, 0x7f8c8d);
        const detail2 = scene.add.rectangle(-1, 0, 2, 1, 0x7f8c8d);

        
        projectileContainer.add([
            body,
            tip,
            waist,
            rotatingBand,
            detail1,
            detail2,
        ]);

        super(scene, x, y, projectileContainer);

        if (!this.sprite) return;

        
        this.sprite.body
            .setSize(12, 5) 
            .setOffset(-6, -2.5) 
            .setAllowGravity(false);

        this.startX = x;
        this.startY = y;
        this.sprite.entity = this;

        
        this.muzzleFlash = scene.add.circle(10, 0, 6, 0xff9900);
        this.muzzleFlash.setAlpha(0.7);
        projectileContainer.add(this.muzzleFlash);

        
        scene.tweens.add({
            targets: this.muzzleFlash,
            alpha: 0,
            scale: 0.5,
            duration: 200,
            ease: "Power2",
        });
    }

    update(delta) {
        if (!this.sprite.active) return;

        
        if (Math.random() < 0.3) {
            
            const trailX = this.x - Math.cos(this.rotation) * 5;
            const trailY = this.y - Math.sin(this.rotation) * 5;

            this.scene.bubbleManager.createBubble(
                trailX,
                trailY,
                this.rotation + Math.PI, 
                Phaser.Math.Between(10, 20),
                1,
                0xaaaaaa 
            );
        }
    }
}