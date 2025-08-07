export function createDiveButton(scene) {
    const width = scene.cameras.main.width;
    const height = scene.cameras.main.height;
    const margin = 20;

    // Detectar a orientação da tela
    const isLandscape = width > height;

    // Definir a posição do botão com base na orientação
    let diveButtonX, diveButtonY;

    if (isLandscape) {
        // Posição para tela horizontal (canto superior esquerdo)
        diveButtonX = margin + 30;
        diveButtonY = margin + 30;
    } else {
        // Posição para tela vertical (canto inferior direito)
        diveButtonX = width - margin - 10;
        diveButtonY = height - margin - 480;
    }

    const diveButton = scene.add
        .circle(diveButtonX, diveButtonY, 30, 0x000066)
        .setInteractive();

    // Ajustar a posição do texto com base na orientação
    let counterTextX, counterTextY;
    if (isLandscape) {
        // Posicionar o texto abaixo do botão na horizontal
        counterTextX = diveButtonX;
        counterTextY = diveButtonY + 40;
    } else {
        // Posicionar o texto acima do botão na vertical
        counterTextX = diveButtonX;
        counterTextY = diveButtonY - 40;
    }

    const counterText = scene.add
        .text(counterTextX, counterTextY, "", {
            fontSize: "24px",
            fill: "#ffffff",
            fontFamily: "Arial",
            backgroundColor: "#333333",
            padding: { x: 10, y: 5 },
        })
        .setOrigin(0.5)
        .setVisible(false);

    let isCounting = false;

    diveButton.on("pointerdown", () => {
        if (isCounting || scene.gameOver) return;

        if (
            scene.submarine.isDiving ||
            (!scene.submarine.isBatteryDepleted &&
                scene.submarine.batteryLevel > 5)
        ) {
            isCounting = true;
            diveButton.setInteractive(false);
            counterText.setVisible(true);
            let countdown = 3;
            counterText.setText(`${countdown}`);

            scene.time.addEvent({
                delay: 1000,
                repeat: 3,
                callback: () => {
                    countdown--;
                    counterText.setText(`${countdown}`);
                    if (countdown === 0) {
                        if (scene.submarine.isDiving) {
                            scene.toggleDiveMode();
                        } else if (
                            !scene.submarine.isBatteryDepleted &&
                            scene.submarine.batteryLevel > 5
                        ) {
                            scene.toggleDiveMode();
                        }

                        counterText.setVisible(false);
                        isCounting = false;
                        diveButton.setInteractive(true);
                    }
                },
            });
        }
    });

    diveButton.on("pointerover", () => {
        if (!isCounting) diveButton.setFillStyle(0x3333cc);
    });
    diveButton.on("pointerout", () => {
        if (!isCounting) diveButton.setFillStyle(0x000066);
    });

    // Adicionar um evento para atualizar a posição quando a orientação da tela mudar
    scene.scale.on("resize", () => {
        const newWidth = scene.cameras.main.width;
        const newHeight = scene.cameras.main.height;
        const newIsLandscape = newWidth > newHeight;

        // Atualizar a posição do botão
        if (newIsLandscape) {
            diveButtonX = margin + 30;
            diveButtonY = margin + 30;
        } else {
            diveButtonX = newWidth - margin - 10;
            diveButtonY = newHeight - margin - 480;
        }

        diveButton.setPosition(diveButtonX, diveButtonY);

        // Atualizar a posição do texto
        if (newIsLandscape) {
            counterTextX = diveButtonX;
            counterTextY = diveButtonY + 40;
        } else {
            counterTextX = diveButtonX;
            counterTextY = diveButtonY - 40;
        }

        counterText.setPosition(counterTextX, counterTextY);
    });

    return diveButton;
}
