export class BatteryMeter {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;

        
        this.container = scene.add.container(x, y);

        
        this.background = scene.add.rectangle(0, 0, 200, 20, 0x333333);
        this.background.setStrokeStyle(2, 0x000000);

        
        this.bar = scene.add.rectangle(-95, 0, 190, 16, 0x00ff00);
        this.bar.setOrigin(0, 0.5);

        
        this.text = scene.add.text(0, 0, "100%", {
            fontSize: "14px",
            fill: "#000000", 
            fontStyle: "bold", 
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

        
        this.container.add([this.background, this.bar, this.text]);

        
        this.batteryLevel = 100;

        
        this.updateBar();
    }

    updateBatteryLevel(level) {
        
        this.batteryLevel = Math.round(level * 10) / 10;

        
        this.batteryLevel = Math.max(0, Math.min(100, this.batteryLevel));

        
        this.updateBar();
    }

    updateBar() {
        
        const width = 190 * (this.batteryLevel / 100);
        this.bar.width = width;

        
        this.text.setText(`${Math.round(this.batteryLevel)}%`);

        
        if (this.batteryLevel > 50) {
            this.bar.setFillStyle(0x00ff00); 
        } else if (this.batteryLevel > 20) {
            this.bar.setFillStyle(0xffff00); 
        } else {
            this.bar.setFillStyle(0xff0000); 
        }
    }

    setVisible(visible) {
        this.container.setVisible(visible);
    }
}