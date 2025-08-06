import { Entity } from "./Entity";
export class Torpedo extends Entity {
    constructor(scene, x, y, angle) {
        
        const torpedoContainer = scene.add.container(x, y);
        torpedoContainer.setRotation(angle);

        
        const body = scene.add.rectangle(0, 0, 18, 4, 0x3a6ea5);
        body.setStrokeStyle(0.5, 0x1e3a5f);

        
        const midSection = scene.add.rectangle(0, 0, 6, 2, 0x4299e1);

        
        torpedoContainer.add([body, midSection]);

        super(scene, x, y, torpedoContainer);

        if (!this.sprite) return;

        
        this.sprite.body
            .setSize(18, 4) 
            .setOffset(-9, -2) 
            .setAllowGravity(false)
            .setCollideWorldBounds(false);

        this.startX = x;
        this.startY = y;
        this.bubbleTimer = 0;
        this.sprite.entity = this;
    }

    update(delta) {
        if (!this.sprite.active) return;

        this.bubbleTimer += delta;
        if (this.bubbleTimer > 150) {
            this.bubbleTimer = 0;
            
            const offset = new Phaser.Math.Vector2(-10, 0).rotate(
                this.sprite.rotation
            );

            
            const bubbleCount = 10; 
            for (let i = 0; i < bubbleCount; i++) {
                const bubbleX = this.x + offset.x + Phaser.Math.Between(-2, 2);
                const bubbleY = this.y + offset.y + Phaser.Math.Between(-2, 2);

                
                
                const bubbleAngle = this.sprite.rotation + Math.PI;

                
                this.scene.bubbleManager.createBubble(
                    bubbleX,
                    bubbleY,
                    bubbleAngle, 
                    null,
                    1, 
                    0xffffff 
                );
            }
        }
    }
}