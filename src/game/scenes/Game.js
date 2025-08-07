import { Scene } from "phaser";
import { Submarine } from "../entities/Submarine";
import { Torpedo } from "../entities/Torpedo";
import { LevelManager } from "../systems/LevelManager";
import { BubbleManager } from "../systems/BubbleManager";
import { createThrottle } from "../ui/Throttle";
import { createRudder } from "../ui/Rudder";
import { createFireButton } from "../ui/FireButton";
import { createDiveButton } from "../ui/DiveButton";
import { BatteryMeter } from "../ui/BatteryMetter";

export class Game extends Scene {
    constructor() {
        super("Game");
        this.corvettesSunk = 0;
        // Variáveis para controle de orientação
        this.currentOrientation = null;
        this.resizeHandler = null;
        this.orientationHandler = null;
    }

    init() {
        this.cameras.main.setViewport(
            0,
            0,
            this.scale.width,
            this.scale.height
        );

        // Detectar orientação inicial
        this.currentOrientation = this.getOrientation();

        // Configurar listeners para mudança de orientação
        this.setupOrientationDetection();
    }

    // Método simples para detectar orientação
    getOrientation() {
        return window.innerWidth > window.innerHeight
            ? "landscape"
            : "portrait";
    }

    // Método para configurar detecção de orientação
    setupOrientationDetection() {
        // Listener para evento de resize
        this.resizeHandler = () => {
            this.scale.refresh();
            this.checkOrientationChange();
        };
        window.addEventListener("resize", this.resizeHandler);

        // Listener para evento de mudança de orientação
        this.orientationHandler = () => {
            this.scale.refresh();
            this.time.delayedCall(300, () => {
                this.checkOrientationChange();
            });
        };
        window.addEventListener("orientationchange", this.orientationHandler);
    }

    // Método para verificar e agir sobre mudança de orientação
    checkOrientationChange() {
        const newOrientation = this.getOrientation();

        // Se a orientação mudou, forçar refresh da página
        if (newOrientation !== this.currentOrientation) {
            this.currentOrientation = newOrientation;
            this.forceRefresh();
        }
    }

    // Método para forçar refresh da página
    forceRefresh() {
        // Limpar listeners
        if (this.resizeHandler) {
            window.removeEventListener("resize", this.resizeHandler);
            this.resizeHandler = null;
        }

        if (this.orientationHandler) {
            window.removeEventListener(
                "orientationchange",
                this.orientationHandler
            );
            this.orientationHandler = null;
        }

        // Forçar refresh da página
        window.location.reload();
    }

    create() {
        this.enemies = [];
        this.gameOver = false;
        this.corvettesSunk = 0;
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.physics.world.setBounds(
            0,
            0,
            width,
            height,
            false,
            false,
            false,
            false
        );

        this.cameras.main.setBackgroundColor("#0000FF");

        this.submarine = new Submarine(
            this,
            width / 2,
            height / 2,
            Math.PI / 2
        );
        this.submarine.sprite.rotation = (3 * Math.PI) / 2;

        this.batteryMeter = new BatteryMeter(
            this,
            this.cameras.main.width / 2,
            30
        );
        this.submarine.setBatteryMeter(this.batteryMeter);

        if (!this.submarine.sprite) return;

        const { throttleBase, throttleHandle } = createThrottle(this);
        this.throttleBase = throttleBase;
        this.throttleHandle = throttleHandle;
        this.updateThrottle(this.throttleTop);

        const tenPercentPosition =
            this.throttleBottom -
            (this.throttleBottom - this.throttleTop) * 0.5;
        this.throttleHandle.y = tenPercentPosition;
        this.submarine.currentSpeed = 60 * 0.5;

        const { rudderBase, rudderSlider } = createRudder(this);
        this.rudderBase = rudderBase;
        this.rudderSlider = rudderSlider;

        this.fireButton = createFireButton(this);
        this.diveButton = createDiveButton(this);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.cursors.space = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );
        this.cursors.d = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.D
        );

        this.bubbleManager = new BubbleManager(this);

        this.torpedoes = this.physics.add.group({
            maxSize: 10,
            runChildUpdate: true,
        });

        this.cannonProjectiles = this.physics.add.group({
            classType: Phaser.GameObjects.Rectangle,
            runChildUpdate: true,
        });

        this.enemyGroup = this.physics.add.group();
        this.levelManager = new LevelManager(this);
        this.levelManager.spawnEnemy();

        this.setupColliders();

        this.input.setDraggable([this.throttleHandle, this.rudderSlider]);
        this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
            if (gameObject === this.throttleHandle) this.updateThrottle(dragY);
            else if (gameObject === this.rudderSlider)
                this.updateRudderSlider(dragX);
        });

        this.input.on("dragstart", (pointer, gameObject) => {
            if (gameObject === this.rudderSlider) this.isDraggingRudder = true;
        });

        this.input.on("dragend", (pointer, gameObject) => {
            if (gameObject === this.rudderSlider) this.isDraggingRudder = false;
        });
    }

    update(time, delta) {
        this.submarine.update(time, delta);
        if (!this.submarine.active) {
            this.bubbleManager.update(delta);
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(this.cursors.d)) {
            if (this.submarine.isDiving) {
                this.toggleDiveMode();
            } else if (
                !this.submarine.isBatteryDepleted ||
                this.submarine.batteryLevel > 5
            ) {
                this.toggleDiveMode();
            }
        }

        const speedFactor =
            1 -
            (this.submarine.currentSpeed / (this.isDiving ? 50 : 200)) *
                this.submarine.hydrodynamicsFactor;
        const adjustedAngularAcceleration =
            this.submarine.angularAcceleration * speedFactor;

        if (
            !this.isDraggingRudder &&
            !this.cursors.left.isDown &&
            !this.cursors.right.isDown
        ) {
            const distanceToCenter = this.rudderCenter - this.rudderSlider.x;
            if (Math.abs(distanceToCenter) > 1) {
                this.rudderSlider.x += distanceToCenter * 0.08;
                const sliderPosition =
                    (this.rudderSlider.x - this.rudderCenter) /
                    ((this.rudderRight - this.rudderLeft) / 2);
                this.targetAngularVelocity =
                    sliderPosition * this.submarine.maxAngularVelocity;
            } else {
                this.rudderSlider.x = this.rudderCenter;
                this.targetAngularVelocity = 0;
            }
        }

        const keyboardInput =
            this.cursors.left.isDown || this.cursors.right.isDown;

        if (!keyboardInput) {
            const angularDifference =
                this.targetAngularVelocity -
                this.submarine.currentAngularVelocity;
            if (Math.abs(angularDifference) > 0.5) {
                const acceleration =
                    Math.sign(angularDifference) *
                    adjustedAngularAcceleration *
                    (delta / 1000);
                this.submarine.currentAngularVelocity =
                    Math.abs(acceleration) > Math.abs(angularDifference)
                        ? this.targetAngularVelocity
                        : this.submarine.currentAngularVelocity + acceleration;
            } else {
                this.submarine.currentAngularVelocity =
                    this.targetAngularVelocity;
            }
        }

        if (this.cursors.left.isDown) {
            this.submarine.currentAngularVelocity -=
                adjustedAngularAcceleration * (delta / 1000);
        } else if (this.cursors.right.isDown) {
            this.submarine.currentAngularVelocity +=
                adjustedAngularAcceleration * (delta / 1000);
        } else if (this.targetAngularVelocity === 0 && !this.isDraggingRudder) {
            if (Math.abs(this.submarine.currentAngularVelocity) > 0.5) {
                const deceleration =
                    Math.sign(this.submarine.currentAngularVelocity) *
                    -this.submarine.angularDeceleration *
                    (delta / 1000);
                this.submarine.currentAngularVelocity =
                    Math.abs(deceleration) >
                    Math.abs(this.submarine.currentAngularVelocity)
                        ? 0
                        : this.submarine.currentAngularVelocity + deceleration;
            } else {
                this.submarine.currentAngularVelocity = 0;
            }
        }

        this.submarine.currentAngularVelocity = Phaser.Math.Clamp(
            this.submarine.currentAngularVelocity,
            -this.submarine.maxAngularVelocity,
            this.submarine.maxAngularVelocity
        );

        this.updateRudderSliderPosition();

        this.submarine.sprite.body.setAngularVelocity(
            this.submarine.currentSpeed > 0
                ? this.submarine.currentAngularVelocity
                : 0
        );

        if (this.cursors.up.isDown)
            this.updateThrottle(this.throttleHandle.y - 2);
        else if (this.cursors.down.isDown)
            this.updateThrottle(this.throttleHandle.y + 2);

        if (Phaser.Input.Keyboard.JustDown(this.cursors.space))
            this.fireTorpedo();

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.torpedoes.children.iterate((torpedo) => {
            if (torpedo.active && torpedo.entity) {
                if (
                    Phaser.Math.Distance.Between(
                        torpedo.x,
                        torpedo.y,
                        torpedo.entity.startX,
                        torpedo.entity.startY
                    ) > 1000 ||
                    torpedo.x < -50 ||
                    torpedo.x > width + 50 ||
                    torpedo.y < -50 ||
                    torpedo.y > height + 50
                ) {
                    torpedo.body.enable = false;
                    this.bubbleManager.createExplosion(torpedo.x, torpedo.y);
                    torpedo.setActive(false).setVisible(false);
                    return;
                }
                torpedo.entity.update(delta);
            }
        });

        this.cannonProjectiles.children.iterate((projectile) => {
            if (projectile.active && projectile.entity) {
                if (
                    Phaser.Math.Distance.Between(
                        projectile.x,
                        projectile.y,
                        projectile.entity.startX,
                        projectile.entity.startY
                    ) > 1000 ||
                    projectile.x < -50 ||
                    projectile.x > width + 50 ||
                    projectile.y < -50 ||
                    projectile.y > height + 50
                ) {
                    projectile.body.enable = false;
                    this.bubbleManager.createExplosion(
                        projectile.x,
                        projectile.y
                    );
                    projectile.setActive(false).setVisible(false);
                }
            }
        });

        this.physics.velocityFromRotation(
            this.submarine.rotation,
            this.submarine.currentSpeed,
            this.submarine.sprite.body.velocity
        );

        this.submarine.x = Phaser.Math.Wrap(this.submarine.x, -50, width + 50);
        this.submarine.y = Phaser.Math.Wrap(this.submarine.y, -50, height + 50);

        this.enemies.forEach((enemy) => {
            if (enemy.active) {
                if (isNaN(enemy.sprite.body.x) || isNaN(enemy.sprite.body.y)) {
                    enemy.sprite.body.x = width / 2;
                    enemy.sprite.body.y = height / 2;
                    enemy.scene.physics.velocityFromRotation(
                        enemy.sprite.rotation,
                        50,
                        enemy.sprite.body.velocity
                    );
                }
                enemy.sprite.body.x = Phaser.Math.Wrap(
                    enemy.sprite.body.x,
                    -50,
                    width + 50
                );
                enemy.sprite.body.y = Phaser.Math.Wrap(
                    enemy.sprite.body.y,
                    -50,
                    height + 50
                );
                enemy.update(delta, this.submarine);
            }
        });

        this.isMoving = this.submarine.currentSpeed > 5;

        if (this.isMoving) {
            if (this.bubbleTimer > 150) {
                if (this.isDiving) {
                    const offset = new Phaser.Math.Vector2(-30, 0).rotate(
                        this.submarine.rotation
                    );
                    const bubbleX =
                        this.submarine.x +
                        offset.x +
                        Phaser.Math.Between(-8, 8);
                    const bubbleY =
                        this.submarine.y +
                        offset.y +
                        Phaser.Math.Between(-8, 8);
                    this.bubbleManager.createBubble(
                        bubbleX,
                        bubbleY,
                        this.submarine.rotation,
                        null,
                        3,
                        0xffffff
                    );
                } else {
                    const offset = new Phaser.Math.Vector2(0, 0);
                    const smokeX =
                        this.submarine.x +
                        offset.x +
                        Phaser.Math.Between(-8, 8);
                    const smokeY =
                        this.submarine.y +
                        offset.y +
                        Phaser.Math.Between(-8, 8);
                    this.bubbleManager.createBubble(
                        smokeX,
                        smokeY,
                        this.submarine.rotation,
                        null,
                        3,
                        0x808080
                    );
                }
            }
        } else {
            this.bubbleTimer = 0;
        }

        this.bubbleManager.update(delta);
    }

    setupColliders() {
        if (this.submarineEnemyCollider) {
            this.submarineEnemyCollider.destroy();
            this.submarineEnemyCollider = null;
        }

        if (!this.isDiving && this.submarine.active) {
            this.submarineEnemyCollider = this.physics.add.collider(
                this.submarine.sprite,
                this.enemies.map((e) => e.sprite),
                (submarine, enemy) => {
                    if (
                        submarine.active &&
                        enemy.active &&
                        this.submarine.active
                    ) {
                        this.bubbleManager.createExplosion(
                            submarine.x,
                            submarine.y
                        );
                        this.bubbleManager.createExplosion(enemy.x, enemy.y);
                        const targetEnemy = this.enemies.find(
                            (e) => e.sprite === enemy
                        );
                        if (targetEnemy) {
                            targetEnemy.destroy();
                            this.corvettesSunk++;
                            this.enemies = this.enemies.filter(
                                (e) => e !== targetEnemy
                            );
                            this.levelManager.spawnEnemy();
                        }
                        this.submarine.destroy();
                        this.showGameOver();
                    }
                },
                null,
                this
            );
        }

        this.physics.add.collider(
            this.submarine.sprite,
            this.cannonProjectiles,
            (submarine, projectile) => {
                if (
                    submarine.active &&
                    projectile.active &&
                    this.submarine.active &&
                    !this.isDiving
                ) {
                    this.bubbleManager.createExplosion(
                        submarine.x,
                        submarine.y
                    );
                    this.bubbleManager.createExplosion(
                        projectile.x,
                        projectile.y
                    );
                    projectile.body.enable = false;
                    projectile.setActive(false).setVisible(false);
                    this.submarine.destroy();
                    this.showGameOver();
                }
            },
            null,
            this
        );

        this.physics.add.collider(
            this.torpedoes,
            this.enemyGroup,
            (torpedo, enemy) => {
                if (torpedo.active && enemy.active) {
                    torpedo.body.enable = false;
                    this.bubbleManager.createExplosion(torpedo.x, torpedo.y);
                    torpedo.setActive(false).setVisible(false);
                    const targetEnemy = this.enemies.find(
                        (e) => e.sprite === enemy
                    );
                    if (targetEnemy) {
                        this.bubbleManager.createExplosion(enemy.x, enemy.y);
                        targetEnemy.sink();
                        this.corvettesSunk++;
                        this.enemies = this.enemies.filter(
                            (e) => e !== targetEnemy
                        );
                    }
                }
            },
            null,
            this
        );
    }

    toggleDiveMode() {
        if (!this.submarine.active || this.gameOver) return;

        if (this.submarine.isDiving) {
            this.isDiving = false;
            this.submarine.setDiveMode(false);
            this.throttleHandle.setFillStyle(0xffffff);
            this.throttleBase.setFillStyle(0x808080);

            const fiftyPercentPosition =
                this.throttleBottom -
                (this.throttleBottom - this.throttleTop) * 0.5;
            this.throttleHandle.y = fiftyPercentPosition;

            const maxSpeed = 60;
            this.submarine.currentSpeed = maxSpeed * 0.5;

            this.setupColliders();
        } else if (
            !this.submarine.isBatteryDepleted ||
            this.submarine.batteryLevel > 5
        ) {
            this.isDiving = true;
            this.submarine.setDiveMode(true);
            this.throttleHandle.setFillStyle(0xff0000);
            this.throttleBase.setFillStyle(0x000000);

            this.setupColliders();
        }
    }

    fireTorpedo() {
        if (
            this.time.now - this.lastTorpedoTime < 1000 ||
            !this.submarine.active ||
            this.gameOver
        )
            return;

        this.lastTorpedoTime = this.time.now;

        const x = this.submarine.x + Math.cos(this.submarine.rotation) * 30;
        const y = this.submarine.y + Math.sin(this.submarine.rotation) * 30;
        const angle = this.submarine.rotation;

        const torpedo = new Torpedo(this, x, y, angle);

        if (torpedo.sprite) {
            this.torpedoes.add(torpedo.sprite);
            const speed = 85;
            torpedo.sprite.body.setVelocity(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );
            torpedo.update(0);
        }
    }

    updateThrottle(newY) {
        if (this.submarine.isDiving && this.submarine.isBatteryDepleted) {
            this.throttleHandle.y = this.throttleBottom;
            this.submarine.currentSpeed = 0;
            return;
        }

        this.throttleHandle.y = Phaser.Math.Clamp(
            newY,
            this.throttleTop,
            this.throttleBottom
        );

        const maxSpeed = this.isDiving ? 27 : 60;
        this.submarine.currentSpeed = Phaser.Math.Linear(
            maxSpeed,
            0,
            (this.throttleBottom - this.throttleHandle.y) /
                (this.throttleBottom - this.throttleTop)
        );
    }

    updateRudderSlider(newX) {
        this.rudderSlider.x = Phaser.Math.Clamp(
            newX,
            this.rudderLeft,
            this.rudderRight
        );

        const sliderPosition =
            (this.rudderSlider.x - this.rudderCenter) /
            ((this.rudderRight - this.rudderLeft) / 2);

        this.targetAngularVelocity =
            sliderPosition * this.submarine.maxAngularVelocity;
    }

    updateRudderSliderPosition() {
        const sliderPosition =
            this.submarine.currentAngularVelocity /
            this.submarine.maxAngularVelocity;

        this.rudderSlider.x = Phaser.Math.Clamp(
            this.rudderCenter +
                (sliderPosition * (this.rudderRight - this.rudderLeft)) / 2,
            this.rudderLeft,
            this.rudderRight
        );

        this.submarine.updateRudder(-sliderPosition);
    }

    showGameOver() {
        this.gameOver = true;
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);

        this.add
            .text(width / 2, height / 2 - 50, "GAME OVER", {
                fontSize: "32px",
                fill: "#ff0000",
                fontFamily: "Arial",
            })
            .setOrigin(0.5);

        this.add
            .text(
                width / 2,
                height / 2 - 20,
                `Corvettes Sunk: ${this.corvettesSunk}`,
                {
                    fontSize: "24px",
                    fill: "#ffffff",
                    fontFamily: "Arial",
                }
            )
            .setOrigin(0.5);

        const retryButton = this.add
            .text(width / 2, height / 2 + 50, "Retry", {
                fontSize: "24px",
                fill: "#ffffff",
                backgroundColor: "#333333",
                padding: { x: 20, y: 10 },
                fontFamily: "Arial",
            })
            .setOrigin(0.5)
            .setInteractive();

        retryButton.on("pointerover", () => {
            retryButton.setStyle({ fill: "#ffff00" });
        });

        retryButton.on("pointerout", () => {
            retryButton.setStyle({ fill: "#ffffff" });
        });

        retryButton.on("pointerdown", () => {
            this.scene.restart();
        });
    }

    // Método para limpar recursos quando a cena for destruída
    destroy() {
        // Remover listeners de evento
        if (this.resizeHandler) {
            window.removeEventListener("resize", this.resizeHandler);
            this.resizeHandler = null;
        }

        if (this.orientationHandler) {
            window.removeEventListener(
                "orientationchange",
                this.orientationHandler
            );
            this.orientationHandler = null;
        }

        super.destroy();
    }
}
