import { Scene } from "phaser";

export class Help extends Scene {
    constructor() {
        super("Help");
    }

    preload() {
        this.load.image("uboat-help", "assets/uboat-help.png");
    }

    create() {
        this.cameras.main.setBackgroundColor(0x333333);

        // Obter as dimensões da tela
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        this.add
            .text(width / 2, 100, "START", {
                fontFamily: "Arial Black",
                fontSize: 64,
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 8,
                align: "center",
            })
            .setOrigin(0.5)
            .setDepth(100);

        // Adicionar a imagem centralizada
        this.add.image(width / 2, height / 2, "uboat-help").setOrigin(0.5);

        // Evento para iniciar o jogo
        this.input.once("pointerdown", () => {
            this.scene.start("Game");
        });
    }
}

