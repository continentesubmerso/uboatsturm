export function createDiveButton(scene) {
    const width = scene.cameras.main.width;
    const height = scene.cameras.main.height;
    const margin = 20;
    const diveButtonX = width - margin - 10;
    const diveButtonY = height - margin - 480;

    // Criar o botão de mergulho (círculo)
    const diveButton = scene.add
        .circle(diveButtonX, diveButtonY, 30, 0x000066)
        .setInteractive();

    // Criar o texto do contador acima do botão
    const counterText = scene.add
        .text(diveButtonX, diveButtonY - 40, "", {
            fontSize: "24px",
            fill: "#ffffff",
            fontFamily: "Arial",
            backgroundColor: "#333333",
            padding: { x: 10, y: 5 },
        })
        .setOrigin(0.5)
        .setVisible(false); // Inicialmente invisível

    // Variável para rastrear se o contador está ativo
    let isCounting = false;

    // Evento de clique no botão
    diveButton.on("pointerdown", () => {
        // Impedir cliques se o contador estiver ativo ou o jogo estiver em game over
        if (isCounting || scene.gameOver) return;

        // Verificar condições para iniciar o mergulho
        if (
            scene.submarine.isDiving ||
            (!scene.submarine.isBatteryDepleted &&
                scene.submarine.batteryLevel > 5)
        ) {
            isCounting = true;
            diveButton.setInteractive(false); // Desativar o botão durante a contagem
            counterText.setVisible(true);

            let countdown = 3;
            counterText.setText(`${countdown}`);

            // Criar um temporizador para a contagem regressiva
            scene.time.addEvent({
                delay: 1000, // 1 segundo por iteração
                repeat: 3, // Repetir 3 vezes (3, 2, 1, 0)
                callback: () => {
                    countdown--;
                    counterText.setText(`${countdown}`);
                    if (countdown === 0) {
                        // Quando o contador chegar a 0, acionar o mergulho
                        if (scene.submarine.isDiving) {
                            scene.toggleDiveMode();
                        } else if (
                            !scene.submarine.isBatteryDepleted &&
                            scene.submarine.batteryLevel > 5
                        ) {
                            scene.toggleDiveMode();
                        }
                        // Resetar o estado
                        counterText.setVisible(false);
                        isCounting = false;
                        diveButton.setInteractive(true); // Reativar o botão
                    }
                },
            });
        }
    });

    // Efeitos visuais (opcional)
    diveButton.on("pointerover", () => {
        if (!isCounting) diveButton.setFillStyle(0x3333cc); // Azul mais claro ao passar o mouse
    });
    diveButton.on("pointerout", () => {
        if (!isCounting) diveButton.setFillStyle(0x000066); // Voltar à cor original
    });

    return diveButton;
}
