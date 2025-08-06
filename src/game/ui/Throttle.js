export function createThrottle(scene) {
    const width = scene.cameras.main.width;
    const height = scene.cameras.main.height;
    const margin = 20;
    const controlMargin = 60;
    const throttleX = width - margin - 10;
    const throttleY = height - margin - 300;
    const throttleHeight = Math.min(100, height - controlMargin * 2);
    const throttleBase = scene.add.rectangle(
        throttleX,
        throttleY,
        10,
        throttleHeight,
        0x808080
    );
    const throttleHandle = scene.add
        .rectangle(throttleX, throttleY + throttleHeight / 2, 45, 45, 0xffffff)
        .setInteractive();
    scene.throttleTop = throttleY - throttleHeight / 2;
    scene.throttleBottom = throttleY + throttleHeight / 2;

    scene.add.text(throttleX + 20, scene.throttleTop - 5, "↑", {
        fontSize: "12px",
        fill: "#ffffff",
    });
    scene.add.text(throttleX + 20, scene.throttleBottom + 5, "↓", {
        fontSize: "12px",
        fill: "#ffffff",
    });
    return { throttleBase, throttleHandle };
}