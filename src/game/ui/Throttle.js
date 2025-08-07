export function createThrottle(scene) {
    const width = scene.cameras.main.width;
    const height = scene.cameras.main.height;
    const margin = 20;
    const controlMargin = 60;

    // Detectar a orientação da tela
    const isLandscape = width > height;

    // Definir a posição do throttle com base na orientação
    let throttleX, throttleY;
    if (isLandscape) {
        // Posição para tela horizontal (50px da margem direita)
        throttleX = width - 100;
        throttleY = height - margin - 250; // 30px do fundo
    } else {
        // Posição para tela vertical (canto inferior direito)
        throttleX = width - margin - 10;
        throttleY = height - margin - 300;
    }

    // Calcular altura do throttle
    const throttleHeight = Math.min(100, height - controlMargin * 2);

    // Criar elementos do throttle
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

    // Atualizar limites do throttle
    scene.throttleTop = throttleY - throttleHeight / 2;
    scene.throttleBottom = throttleY + throttleHeight / 2;

    // Adicionar textos de seta
    const arrowUp = scene.add.text(throttleX + 20, scene.throttleTop - 5, "↑", {
        fontSize: "12px",
        fill: "#ffffff",
    });

    const arrowDown = scene.add.text(
        throttleX + 20,
        scene.throttleBottom + 5,
        "↓",
        {
            fontSize: "12px",
            fill: "#ffffff",
        }
    );

    // Adicionar evento para atualizar posição quando a orientação mudar
    scene.scale.on("resize", () => {
        const newWidth = scene.cameras.main.width;
        const newHeight = scene.cameras.main.height;
        const newIsLandscape = newWidth > newHeight;

        // Recalcular posição com base na nova orientação
        if (newIsLandscape) {
            throttleX = newWidth - 50; // 50px da margem direita
            throttleY = newHeight - margin - 30; // 30px do fundo
        } else {
            throttleX = newWidth - margin - 10;
            throttleY = newHeight - margin - 300;
        }

        // Recalcular altura do throttle
        const newThrottleHeight = Math.min(100, newHeight - controlMargin * 2);

        // Atualizar posição do throttle base
        throttleBase.setPosition(throttleX, throttleY);
        throttleBase.setSize(10, newThrottleHeight);

        // Atualizar posição do throttle handle
        throttleHandle.setPosition(
            throttleX,
            throttleY + newThrottleHeight / 2
        );

        // Atualizar limites do throttle
        scene.throttleTop = throttleY - newThrottleHeight / 2;
        scene.throttleBottom = throttleY + newThrottleHeight / 2;

        // Atualizar posição das setas
        arrowUp.setPosition(throttleX + 20, scene.throttleTop - 5);
        arrowDown.setPosition(throttleX + 20, scene.throttleBottom + 5);
    });

    return { throttleBase, throttleHandle };
}

