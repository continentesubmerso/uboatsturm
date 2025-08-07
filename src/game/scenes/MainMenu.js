import { Scene } from "phaser";

export class MainMenu extends Scene {
    constructor() {
        super("MainMenu");
    }
    preload() {
        this.load.image("titulo", "assets/uboat_sturm_icon.svg");
    }
    create() {
        this.cameras.main.setBackgroundColor(0x333333);

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        this.add
            .image(width / 2, 180, "titulo")
            .setOrigin(0.5)
            .setScale(2);

        this.add
            .text(width / 2, height / 2, "START", {
                fontFamily: "Arial Black",
                fontSize: 64,
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 8,
                align: "center",
            })
            .setOrigin(0.5)
            .setDepth(100);

        this.input.once("pointerdown", () => {
            this.scene.start("Help");
        });
    }
}

