export function createRudder(scene) {
    const width = scene.cameras.main.width;
    const height = scene.cameras.main.height;
    const margin = 20;
    const controlMargin = 60;

    // Detectar a orientação da tela
    const isLandscape = width > height;

    // Definir a posição do leme com base na orientação
    let rudderX, rudderY;
    if (isLandscape) {
        // Posição para tela horizontal (50px da margem direita)
        rudderX = width - 100;
        rudderY = height - margin - 30; // 30px do fundo
    } else {
        // Posição para tela vertical (canto inferior direito)
        rudderX = width - margin - 40;
        rudderY = height - margin - 130;
    }

    // Calcular largura do leme
    const rudderWidth = Math.min(120, width - controlMargin * 2);

    // Criar elementos do leme
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

    // Atualizar limites do leme
    scene.rudderLeft = rudderX - rudderWidth / 2 + rudderSlider.width / 2;
    scene.rudderRight = rudderX + rudderWidth / 2 - rudderSlider.width / 2;
    scene.rudderCenter = rudderX;

    // Adicionar textos de seta
    const arrowLeft = scene.add.text(scene.rudderLeft - 15, rudderY - 5, "←", {
        fontSize: "16px",
        fill: "#ffffff",
    });

    const arrowRight = scene.add.text(scene.rudderRight + 5, rudderY - 5, "→", {
        fontSize: "16px",
        fill: "#ffffff",
    });

    // Adicionar evento para atualizar posição quando a orientação mudar
    scene.scale.on("resize", () => {
        const newWidth = scene.cameras.main.width;
        const newHeight = scene.cameras.main.height;
        const newIsLandscape = newWidth > newHeight;

        // Recalcular posição com base na nova orientação
        if (newIsLandscape) {
            rudderX = newWidth - 50; // 50px da margem direita
            rudderY = newHeight - margin - 30; // 30px do fundo
        } else {
            rudderX = newWidth - margin - 40;
            rudderY = newHeight - margin - 130;
        }

        // Recalcular largura do leme
        const newRudderWidth = Math.min(120, newWidth - controlMargin * 2);

        // Atualizar posição do leme base
        rudderBase.setPosition(rudderX, rudderY);
        rudderBase.setSize(newRudderWidth, 10);

        // Atualizar posição do leme slider
        rudderSlider.setPosition(rudderX, rudderY);

        // Atualizar limites do leme
        scene.rudderLeft =
            rudderX - newRudderWidth / 2 + rudderSlider.width / 2;
        scene.rudderRight =
            rudderX + newRudderWidth / 2 - rudderSlider.width / 2;
        scene.rudderCenter = rudderX;

        // Atualizar posição das setas
        arrowLeft.setPosition(scene.rudderLeft - 15, rudderY - 5);
        arrowRight.setPosition(scene.rudderRight + 5, rudderY - 5);
    });

    return { rudderBase, rudderSlider };
}

