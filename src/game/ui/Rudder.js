export function createRudder(scene) {
    const width = scene.cameras.main.width;
    const height = scene.cameras.main.height;
    const margin = 20;
    const controlMargin = 60;

    const rudderWidth = Math.min(120, width - controlMargin * 2);
    const rudderX = width - margin - 40;
    const rudderY = height - margin - 130;
    const rudderBase = scene.add.rectangle(
        rudderX,
        rudderY,
        rudderWidth,
        10,
        0x808080
    );
    const rudderSlider = scene.add
        .rectangle(rudderX, rudderY, 45, 45, 0xffffff)
        .setInteractive();

    scene.rudderLeft = rudderX - rudderWidth / 2 + rudderSlider.width / 2;
    scene.rudderRight = rudderX + rudderWidth / 2 - rudderSlider.width / 2;
    scene.rudderCenter = rudderX;

    scene.add.text(scene.rudderLeft - 15, rudderY - 5, "←", {
        fontSize: "16px",
        fill: "#ffffff",
    });
    scene.add.text(scene.rudderRight + 5, rudderY - 5, "→", {
        fontSize: "16px",
        fill: "#ffffff",
    });

    return { rudderBase, rudderSlider };
}