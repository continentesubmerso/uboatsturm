export function createDiveButton(scene) {
    const width = scene.cameras.main.width;
    const height = scene.cameras.main.height;
    const margin = 20;
    const diveButtonX = width - margin - 10;
    const diveButtonY = height - margin - 480;

    
    const diveButton = scene.add
        .circle(diveButtonX, diveButtonY, 30, 0x000066)
        .setInteractive();

    
    const counterText = scene.add
        .text(diveButtonX, diveButtonY - 40, "", {
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

    return diveButton;
}