export function createFireButton(scene) {
    const width = scene.cameras.main.width;
    const height = scene.cameras.main.height;
    const margin = 20;

    const fireButtonX = width - margin - 10;
    const fireButtonY = height - margin - 400;
    const fireButton = scene.add
        .circle(fireButtonX, fireButtonY, 30, 0xff0000)
        .setInteractive()
        .on("pointerdown", () => scene.fireTorpedo());

    return fireButton;
}