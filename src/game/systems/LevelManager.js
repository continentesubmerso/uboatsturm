import { Corvette } from "../entities/Corvette";

export class LevelManager {
    constructor(scene) {
        this.scene = scene;
        this.level = 1;
        this.enemyTypes = [Corvette];
        this.maxEnemies = 3;
        this.currentEnemies = 0;
    }

    increaseDifficulty() {
        this.level++;
        this.maxEnemies = Math.min(5, 2 + Math.floor(this.level / 2));
    }

    spawnEnemy() {
        if (this.currentEnemies >= this.maxEnemies) return;

        const respawnTime = Phaser.Math.Between(3000, 8000);
        this.scene.time.delayedCall(respawnTime, () => {
            const width = this.scene.cameras.main.width;
            const height = this.scene.cameras.main.height;
            const side = Phaser.Math.Between(0, 3);
            let x, y, angle;

            switch (side) {
                case 0:
                    x = Phaser.Math.Between(0, width);
                    y = -50;
                    angle = Phaser.Math.FloatBetween(
                        Math.PI / 4,
                        (3 * Math.PI) / 4
                    );
                    break;
                case 1:
                    x = width + 50;
                    y = Phaser.Math.Between(0, height);
                    angle = Phaser.Math.FloatBetween(
                        (3 * Math.PI) / 4,
                        (5 * Math.PI) / 4
                    );
                    break;
                case 2:
                    x = Phaser.Math.Between(0, width);
                    y = height + 50;
                    angle = Phaser.Math.FloatBetween(
                        (5 * Math.PI) / 4,
                        (7 * Math.PI) / 4
                    );
                    break;
                case 3:
                    x = -50;
                    y = Phaser.Math.Between(0, height);
                    angle = Phaser.Math.FloatBetween(-Math.PI / 4, Math.PI / 4);
                    break;
            }

            const EnemyType = this.enemyTypes[0];
            const enemy = new EnemyType(this.scene, x, y, angle);
            if (enemy && enemy.sprite) {
                this.scene.enemies.push(enemy);
                this.scene.enemyGroup.add(enemy.sprite);
                this.currentEnemies++;

                enemy.sprite.on("destroy", () => {
                    this.currentEnemies--;
                });
            }
        });
    }
}
