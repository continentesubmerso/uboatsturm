import { Entity } from "./Entity";
import { BubbleManager } from "../systems/BubbleManager";

export class Submarine extends Entity {
    constructor(scene, x, y) {
        const submarineContainer = scene.add.container(x, y);
        submarineContainer.setSize(60, 12);
        super(scene, x, y, submarineContainer);
        this.particleManager = new BubbleManager(scene);
        this.smokeInterval = 0;
        this.bubbleInterval = 0;
        this.smokeEmitterPosition = { x: -10, y: 0 };
        this.bubbleEmitterPosition = { x: -25, y: 0 };

        // Propriedades da bateria
        this.batteryLevel = 100; // 100% de carga
        this.batteryDrainRate = 100 / 30; // 100% em 30 segundos (por segundo) - modo dive
        this.batteryChargeRate = 100 / 180; // 100% em 180 segundos (3 minutos) - modo superfície
        this.isBatteryDepleted = false;

        // Propriedades para transição suave entre modos
        this.isTransitioning = false;
        this.transitionStartTime = 0;
        this.transitionDuration = 0;
        this.transitionStartSpeed = 0;
        this.transitionEndSpeed = 0;
        this.targetSpeed = 0;

        if (!this.sprite) return;

        // Cores para o submarino
        const hullColor = 0x4a4a4a;
        const deckColor = 0x3a3a3a;
        const towerColor = 0x2a2a2a;

        // Criando o casco do submarino (baseado nos vértices do Matter Physics)
        // Como estamos usando Arcade Physics, vamos usar uma elipse para o casco
        const hull = scene.add.ellipse(0, 0, 60, 12, hullColor);
        hull.setStrokeStyle(1, 0x1a1a1a);

        // Torre de comando (conning tower)
        const conningTower = scene.add.ellipse(0, 0, 16, 8, towerColor);
        conningTower.setStrokeStyle(1, 0x0a0a0a);

        // Canhão
        const cannon = scene.add.rectangle(0, 0, 20, 2, 0x444444);
        cannon.setOrigin(0, 0.5);

        // Base do canhão
        const cannonBase = scene.add.circle(0, 0, 2.5, 0x444444);

        // Periscópio
        const periscope = scene.add.rectangle(-5, -6, 1, 4, 0x666666);

        // Convés
        const deck = scene.add.rectangle(0, 0, 50, 3, deckColor);

        // Leme (rudder)
        const rudder = scene.add.rectangle(-25, 0, 10, 2, 0x222222);
        rudder.setOrigin(1.5, 0.5); // Ajuste de origem para corresponder ao exemplo do Matter Physics

        // Escotilha (hatch)
        const hatch = scene.add.circle(-5, -2, 2, 0x1a1a1a);

        // Linhas do convés para detalhe
        const deckLine1 = scene.add.rectangle(0, -1, 45, 0.5, 0x5a5a5a);
        const deckLine2 = scene.add.rectangle(0, 1, 45, 0.5, 0x5a5a5a);

        // Adicionando todos os componentes ao container
        submarineContainer.add([
            hull,
            deck,
            deckLine1,
            deckLine2,
            conningTower,
            hatch,
            periscope,
            rudder,
            cannon,
            cannonBase,
        ]);

        // Adicionando física ao container
        scene.physics.add.existing(submarineContainer);
        submarineContainer.body
            .setCircle(15) // Usando um círculo para a colisão, que é mais eficiente no Arcade Physics
            .setOffset(16, -6)
            .setDamping(true)
            .setDrag(0.98)
            .setAngularDrag(100)
            .setVelocity(0, 0);

        // Inicializando variáveis de movimento
        this.currentSpeed = 0;
        this.currentAngularVelocity = 0;
        this.maxAngularVelocity = 60;
        this.angularAcceleration = 120;
        this.hydrodynamicsFactor = 0.3;
        this.angularDeceleration = 180;

        // Referências aos componentes para manipulação posterior
        this.rudder = rudder;
        this.periscope = periscope;
        this.hull = hull;
        this.deck = deck;
        this.conningTower = conningTower;
        this.hatch = hatch;
        this.deckLine1 = deckLine1;
        this.deckLine2 = deckLine2;
        this.cannon = cannon;
        this.cannonBase = cannonBase;

        // Armazenando as cores originais para restauração posterior
        this.originalColors = {
            hull: hullColor,
            deck: deckColor,
            conningTower: towerColor,
            hatch: 0x1a1a1a,
            deckLine1: 0x5a5a5a,
            deckLine2: 0x5a5a5a,
            rudder: 0x333333,
            cannon: 0x444444,
            cannonBase: 0x444444,
        };

        // Estado inicial do modo de mergulho
        this.isDiving = false;
    }

    update(time, delta) {
        const deltaSeconds = delta / 1000;

        // Lógica da bateria
        if (this.isDiving) {
            // Se estiver em modo dive, drenar a bateria
            if (!this.isBatteryDepleted || this.batteryLevel > 0) {
                this.batteryLevel -= this.batteryDrainRate * deltaSeconds;

                // Garantir que não fique abaixo de 0
                if (this.batteryLevel <= 0) {
                    this.batteryLevel = 0;
                    this.isBatteryDepleted = true;
                    // Parar o submarino
                    this.stopSubmarine();
                }
            }
        } else {
            // Se não estiver em modo dive (superfície), carregar a bateria
            if (this.batteryLevel < 100) {
                this.batteryLevel += this.batteryChargeRate * deltaSeconds;

                // Garantir que não ultrapasse 100%
                if (this.batteryLevel >= 100) {
                    this.batteryLevel = 100;
                }

                // Se a bateria tiver carga suficiente, resetar o estado de esgotado
                if (this.batteryLevel > 5 && this.isBatteryDepleted) {
                    this.isBatteryDepleted = false;
                }
            }
        }

        // Atualizar o medidor de bateria (se existir)
        if (this.batteryMeter) {
            this.batteryMeter.updateBatteryLevel(this.batteryLevel);
        }

        // Lógica de transição suave entre modos
        if (this.isTransitioning) {
            const elapsed = time - this.transitionStartTime;
            const progress = Math.min(elapsed / this.transitionDuration, 1);

            // Função de easing para uma transição mais suave
            const easedProgress = this.easeInOutQuad(progress);

            // Calcular a velocidade atual durante a transição
            this.currentSpeed = Phaser.Math.Linear(
                this.transitionStartSpeed,
                this.transitionEndSpeed,
                easedProgress
            );

            // Se a transição estiver completa
            if (progress >= 1) {
                this.isTransitioning = false;
                this.currentSpeed = this.transitionEndSpeed;
            }
        }

        // Lógica das partículas
        if (this.isDiving) {
            this.updateBubbles(delta);
        } else {
            this.updateSmoke(delta);
        }

        // Verificar se o submarino deve estar parado
        if (this.isDiving && this.isBatteryDepleted) {
            this.stopSubmarine();
        }
    }

    // Função de easing para transições suaves
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    // Novo método para parar o submarino
    stopSubmarine() {
        if (this.sprite && this.sprite.body) {
            this.sprite.body.setVelocity(0, 0);
            this.sprite.body.setAngularVelocity(0);
        }
        this.currentSpeed = 0;
        this.currentAngularVelocity = 0;
    }

    // Sobrescrever o método updateSpeed da classe Entity para verificar a bateria
    updateSpeed(delta) {
        // Se estiver em modo dive e a bateria estiver esgotada, não atualizar a velocidade
        if (this.isDiving && this.isBatteryDepleted) {
            return;
        }

        // Caso contrário, chamar o método original
        super.updateSpeed(delta);
    }

    updateSmoke(delta) {
        if (Math.abs(this.currentSpeed) < 10) return;
        this.smokeInterval += delta;
        if (this.smokeInterval >= 150) {
            this.smokeInterval = 0;
            const worldX =
                this.x +
                Math.cos(this.rotation) * this.smokeEmitterPosition.x -
                Math.sin(this.rotation) * this.smokeEmitterPosition.y;
            const worldY =
                this.y +
                Math.sin(this.rotation) * this.smokeEmitterPosition.x +
                Math.cos(this.rotation) * this.smokeEmitterPosition.y;
            this.particleManager.createBubble(
                worldX,
                worldY,
                this.rotation + Math.PI + Phaser.Math.FloatBetween(-0.1, 0.1),
                Phaser.Math.Between(10, 10),
                Phaser.Math.Between(4, 8),
                0x333333
            );
            if (Phaser.Math.Between(0, 100) > 70) {
                this.particleManager.createBubble(
                    worldX,
                    worldY,
                    this.rotation +
                        Math.PI +
                        Phaser.Math.FloatBetween(-0.1, 0.1),
                    Phaser.Math.Between(10, 10),
                    Phaser.Math.Between(3, 9),
                    0x000000
                );
            }
        }
        this.particleManager.update(delta);
    }

    updateBubbles(delta) {
        if (Math.abs(this.currentSpeed) < 10) return;
        this.bubbleInterval += delta;
        if (this.bubbleInterval >= 150) {
            this.bubbleInterval = 0;

            // Ajustando a posição das bolhas para a parte traseira do submarino
            const offset = new Phaser.Math.Vector2(-25, 0).rotate(
                this.rotation
            );

            // Emitir múltiplas bolhas - mesma quantidade que o torpedo
            const bubbleCount = 10;

            for (let i = 0; i < bubbleCount; i++) {
                const bubbleX = this.x + offset.x + Phaser.Math.Between(-2, 2);
                const bubbleY = this.y + offset.y + Phaser.Math.Between(-2, 2);

                // Calcular o ângulo oposto ao movimento do submarino (para trás)
                // Adicionamos Math.PI (180 graus) ao ângulo do submarino para inverter a direção
                const bubbleAngle = this.rotation + Math.PI + 3000;

                this.particleManager.createBubble(
                    bubbleX,
                    bubbleY,
                    bubbleAngle, // Ângulo ajustado para as bolhas irem para trás
                    30, // Velocidade padrão
                    1, // Tamanho menor - igual ao torpedo
                    0xa0d2ff // Azul claro igual ao do torpedo
                );
            }
        }
        this.particleManager.update(delta);
    }

    updateRudder(turning) {
        if (this.rudder) {
            if (turning > 0) {
                this.rudder.setRotation(0.1);
            } else if (turning < 0) {
                this.rudder.setRotation(-0.1);
            } else {
                this.rudder.setRotation(0);
            }
        }
    }

    setDiveMode(isDiving) {
        // Se estiver mudando para modo dive e a bateria estiver esgotada, não permitir
        if (isDiving && this.isBatteryDepleted && this.batteryLevel <= 0) {
            return false; // Indicar que a mudança não foi permitida
        }

        // Se o modo não está mudando, não fazer nada
        if (this.isDiving === isDiving) {
            return true;
        }

        // Se estiver mudando de superfície para DIVE
        if (!this.isDiving && isDiving) {
            // Reduzir a velocidade atual para 40% do valor atual (transição suave)
            this.targetSpeed = this.currentSpeed * 0.4;
            // Iniciar a transição
            this.isTransitioning = true;
            this.transitionStartTime = this.scene.time.now;
            this.transitionDuration = 1000; // 1 segundo para a transição
            this.transitionStartSpeed = this.currentSpeed;
            this.transitionEndSpeed = this.targetSpeed;
        }
        // Se estiver mudando de DIVE para superfície
        else if (this.isDiving && !isDiving) {
            // Aumentar a velocidade atual para 150% do valor atual (transição suave)
            this.targetSpeed = Math.min(this.currentSpeed * 1.5, 60); // Limitar à velocidade máxima
            // Iniciar a transição
            this.isTransitioning = true;
            this.transitionStartTime = this.scene.time.now;
            this.transitionDuration = 1500; // 1.5 segundos para a transição (um pouco mais lento)
            this.transitionStartSpeed = this.currentSpeed;
            this.transitionEndSpeed = this.targetSpeed;
        }

        this.isDiving = isDiving;
        const diveColor = 0x0000ff;
        if (isDiving) {
            this.hull.setFillStyle(diveColor);
            this.deck.setFillStyle(diveColor);
            this.conningTower.setFillStyle(diveColor);
            this.hatch.setFillStyle(diveColor);
            this.deckLine1.setFillStyle(diveColor);
            this.deckLine2.setFillStyle(diveColor);
            this.rudder.setFillStyle(0x000033);
            this.cannon.setFillStyle(diveColor);
            this.cannonBase.setFillStyle(diveColor);
            this.periscope.setVisible(false);
        } else {
            // Restaurar cores originais
            this.hull.setFillStyle(this.originalColors.hull);
            this.deck.setFillStyle(this.originalColors.deck);
            this.conningTower.setFillStyle(this.originalColors.conningTower);
            this.hatch.setFillStyle(this.originalColors.hatch);
            this.deckLine1.setFillStyle(this.originalColors.deckLine1);
            this.deckLine2.setFillStyle(this.originalColors.deckLine2);
            this.rudder.setFillStyle(this.originalColors.rudder);
            this.cannon.setFillStyle(this.originalColors.cannon);
            this.cannonBase.setFillStyle(this.originalColors.cannonBase);
            this.periscope.setVisible(true);
        }

        return true; // Indicar que a mudança foi bem-sucedida
    }

    // Método para definir o medidor de bateria
    setBatteryMeter(batteryMeter) {
        this.batteryMeter = batteryMeter;
        // Inicializar o medidor com o nível atual da bateria
        if (this.batteryMeter) {
            this.batteryMeter.updateBatteryLevel(this.batteryLevel);
        }
    }

    // Sobrescrever métodos de movimento para verificar a bateria
    accelerate(value) {
        // Se estiver em modo dive e a bateria estiver esgotada, não acelerar
        if (this.isDiving && this.isBatteryDepleted) {
            return;
        }

        // Caso contrário, acelerar normalmente
        super.accelerate(value);
    }

    turn(value) {
        // Se estiver em modo dive e a bateria estiver esgotada, não virar
        if (this.isDiving && this.isBatteryDepleted) {
            return;
        }

        // Caso contrário, virar normalmente
        super.turn(value);
    }
}

