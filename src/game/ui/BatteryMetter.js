// src/game/ui/BatteryMetter.js
export class BatteryMeter {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;

        // Criar container para o medidor
        this.container = scene.add.container(x, y);

        // Fundo do medidor
        this.background = scene.add.rectangle(0, 0, 200, 20, 0x333333);
        this.background.setStrokeStyle(2, 0x000000);

        // Barra de carga
        this.bar = scene.add.rectangle(-95, 0, 190, 16, 0x00ff00);
        this.bar.setOrigin(0, 0.5);

        // Texto de porcentagem
        this.text = scene.add.text(0, 0, "100%", {
            fontSize: "14px",
            fill: "#000000", // Cor preta
            fontStyle: "bold", // Texto em negrito
            align: "center",
            shadow: {
                offsetX: 1,
                offsetY: 1,
                color: "#fff",
                blur: 1,
                stroke: true,
                fill: true,
            },
        });
        this.text.setOrigin(0.5);

        // Adicionar ao container
        this.container.add([this.background, this.bar, this.text]);

        // Valor inicial da bateria (100%)
        this.batteryLevel = 100;

        // Atualizar a barra inicialmente
        this.updateBar();
    }

    updateBatteryLevel(level) {
        // Arredondar para evitar problemas de precisão de ponto flutuante
        this.batteryLevel = Math.round(level * 10) / 10;

        // Garantir que o nível esteja entre 0 e 100
        this.batteryLevel = Math.max(0, Math.min(100, this.batteryLevel));

        // Atualizar a barra
        this.updateBar();
    }

    updateBar() {
        // Atualizar a largura da barra com base no nível da bateria
        const width = 190 * (this.batteryLevel / 100);
        this.bar.width = width;

        // Atualizar o texto
        this.text.setText(`${Math.round(this.batteryLevel)}%`);

        // Mudar a cor da barra com base no nível
        if (this.batteryLevel > 50) {
            this.bar.setFillStyle(0x00ff00); // Verde
        } else if (this.batteryLevel > 20) {
            this.bar.setFillStyle(0xffff00); // Amarelo
        } else {
            this.bar.setFillStyle(0xff0000); // Vermelho
        }
    }

    setVisible(visible) {
        this.container.setVisible(visible);
    }
}

