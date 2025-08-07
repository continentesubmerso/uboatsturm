export function createFireButton(scene) {
    const width = scene.cameras.main.width;
    const height = scene.cameras.main.height;
    const margin = 20;

    // Detectar a orientação da tela
    const isLandscape = width > height;

    // Definir a posição do botão com base na orientação
    let fireButtonX, fireButtonY;

    if (isLandscape) {
        // Posição para tela horizontal (lado esquerdo)
        fireButtonX = margin + 30;
        fireButtonY = height - margin - 30;
    } else {
        // Posição para tela vertical (canto inferior direito)
        fireButtonX = width - margin - 10;
        fireButtonY = height - margin - 400;
    }

    const fireButton = scene.add
        .circle(fireButtonX, fireButtonY, 30, 0xff0000)
        .setInteractive()
        .on("pointerdown", () => scene.fireTorpedo());

    // Adicionar um evento para atualizar a posição quando a orientação da tela mudar
    scene.scale.on("resize", () => {
        const newWidth = scene.cameras.main.width;
        const newHeight = scene.cameras.main.height;
        const newIsLandscape = newWidth > newHeight;

        // Atualizar a posição do botão
        if (newIsLandscape) {
            fireButtonX = margin + 30;
            fireButtonY = newHeight - margin - 30;
        } else {
            fireButtonX = newWidth - margin - 10;
            fireButtonY = newHeight - margin - 400;
        }

        fireButton.setPosition(fireButtonX, fireButtonY);
    });

    return fireButton;
}
