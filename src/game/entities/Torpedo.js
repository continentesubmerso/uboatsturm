import { Entity } from "./Entity";
export class Torpedo extends Entity {
    constructor(scene, x, y, angle) {
        // Criando um container para o torpedo
        const torpedoContainer = scene.add.container(x, y);
        torpedoContainer.setRotation(angle);

        // Corpo principal do torpedo - mais fino e proporcional ao submarino
        const body = scene.add.rectangle(0, 0, 18, 4, 0x3a6ea5);
        body.setStrokeStyle(0.5, 0x1e3a5f);

        // Detalhes sutis no corpo do torpedo
        const midSection = scene.add.rectangle(0, 0, 6, 2, 0x4299e1);

        // Adicionando todos os componentes ao container
        torpedoContainer.add([body, midSection]);

        super(scene, x, y, torpedoContainer);

        if (!this.sprite) return;

        // Ajustando o corpo físico para corresponder ao novo visual
        this.sprite.body
            .setSize(18, 4) // Tamanho correspondente ao corpo principal
            .setOffset(-9, -2) // Offset centralizado
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
            // Ajustando a posição das bolhas para a parte traseira do torpedo
            const offset = new Phaser.Math.Vector2(-10, 0).rotate(
                this.sprite.rotation
            );

            // Emitir múltiplas bolhas
            const bubbleCount = 10; // Altere este valor para controlar a quantidade de bolhas
            for (let i = 0; i < bubbleCount; i++) {
                const bubbleX = this.x + offset.x + Phaser.Math.Between(-2, 2);
                const bubbleY = this.y + offset.y + Phaser.Math.Between(-2, 2);

                // Calcular o ângulo oposto ao movimento do torpedo (para trás)
                // Adicionamos Math.PI (180 graus) ao ângulo do torpedo para inverter a direção
                const bubbleAngle = this.sprite.rotation + Math.PI;

                // Criar bolhas menores e mais sutis
                this.scene.bubbleManager.createBubble(
                    bubbleX,
                    bubbleY,
                    bubbleAngle, // Ângulo ajustado para as bolhas irem para trás
                    null,
                    1, // tamanho menor
                    0xffffff // cor branca para bolhas de ar
                );
            }
        }
    }
}

