import Phaser from "phaser";
import { Game } from "./scenes/Game";
import { MainMenu } from "./scenes/MainMenu";
import { Help } from "./scenes/Help";

const config = {
    type: Phaser.AUTO,
    width: "100%",
    height: "100%",
    parent: "game-container",
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            debug: false,
        },
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [MainMenu, Game, Help],
};

const StartGame = (parent) => {
    return new Phaser.Game({ ...config, parent });
};

export default StartGame;

