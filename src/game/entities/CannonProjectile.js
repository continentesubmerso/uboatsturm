import { Entity } from "./Entity";
export class CannonProjectile extends Entity {
    constructor(scene, x, y, angle) {
        // Criando um container para o projétil
        const projectileContainer = scene.add.container(x, y);
        projectileContainer.setRotation(angle);

        // Corpo principal do projétil - formato característico de projétil naval
        const body = scene.add.rectangle(0, 0, 12, 4, 0x2c3e50);
        body.setStrokeStyle(0.5, 0x1a252f);

        // Ogiva do projétil - formato mais pontiagudo para projéteis antitanque/naval
        const tip = scene.add.triangle(
            6,
            0, // posição do centro
            6,
            -2, // ponto superior
            10,
            0, // ponta
            6,
            2 // ponto inferior
        );
        tip.setFillStyle(0x34495e);
        tip.setStrokeStyle(0.5, 0x1a252f);

        // Cintura do projétil - parte mais larga onde se conecta com o estojo
        const waist = scene.add.rectangle(-2, 0, 4, 5, 0x2c3e50);
        waist.setStrokeStyle(0.5, 0x1a252f);

        // Anel de giramento - característica de projéteis navais
        const rotatingBand = scene.add.rectangle(-4, 0, 1, 5, 0xe74c3c);
        rotatingBand.setStrokeStyle(0.5, 0x922b21);

        // Detalhes no corpo do projétil - faixas de identificação
        const detail1 = scene.add.rectangle(1, 0, 2, 1, 0x7f8c8d);
        const detail2 = scene.add.rectangle(-1, 0, 2, 1, 0x7f8c8d);

        // Adicionando todos os componentes ao container
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

        // Ajustando o corpo físico para corresponder ao novo visual
        this.sprite.body
            .setSize(12, 5) // Tamanho correspondente ao corpo principal
            .setOffset(-6, -2.5) // Offset centralizado
            .setAllowGravity(false);

        this.startX = x;
        this.startY = y;
        this.sprite.entity = this;

        // Adicionando um leve brilho para simular o calor do disparo
        this.muzzleFlash = scene.add.circle(10, 0, 6, 0xff9900);
        this.muzzleFlash.setAlpha(0.7);
        projectileContainer.add(this.muzzleFlash);

        // Animar o desaparecimento do flash do cano
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

        // Adicionar um leve rastro de fumaça para o projétil
        if (Math.random() < 0.3) {
            // 30% de chance a cada frame
            const trailX = this.x - Math.cos(this.rotation) * 5;
            const trailY = this.y - Math.sin(this.rotation) * 5;

            this.scene.bubbleManager.createBubble(
                trailX,
                trailY,
                this.rotation + Math.PI, // Direção oposta ao movimento
                Phaser.Math.Between(10, 20),
                1,
                0xaaaaaa // Cinza claro para a fumaça
            );
        }
    }
}
