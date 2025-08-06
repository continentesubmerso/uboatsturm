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

        
        this.batteryLevel = 100; 
        this.batteryDrainRate = 100 / 30; 
        this.batteryChargeRate = 100 / 180; 
        this.isBatteryDepleted = false;

        
        this.isTransitioning = false;
        this.transitionStartTime = 0;
        this.transitionDuration = 0;
        this.transitionStartSpeed = 0;
        this.transitionEndSpeed = 0;
        this.targetSpeed = 0;

        if (!this.sprite) return;

        
        const hullColor = 0x4a4a4a;
        const deckColor = 0x3a3a3a;
        const towerColor = 0x2a2a2a;

        
        
        const hull = scene.add.ellipse(0, 0, 60, 12, hullColor);
        hull.setStrokeStyle(1, 0x1a1a1a);

        
        const conningTower = scene.add.ellipse(0, 0, 16, 8, towerColor);
        conningTower.setStrokeStyle(1, 0x0a0a0a);

        
        const cannon = scene.add.rectangle(0, 0, 20, 2, 0x444444);
        cannon.setOrigin(0, 0.5);

        
        const cannonBase = scene.add.circle(0, 0, 2.5, 0x444444);

        
        const periscope = scene.add.rectangle(-5, -6, 1, 4, 0x666666);

        
        const deck = scene.add.rectangle(0, 0, 50, 3, deckColor);

        
        const rudder = scene.add.rectangle(-25, 0, 10, 2, 0x222222);
        rudder.setOrigin(1.5, 0.5); 

        
        const hatch = scene.add.circle(-5, -2, 2, 0x1a1a1a);

        
        const deckLine1 = scene.add.rectangle(0, -1, 45, 0.5, 0x5a5a5a);
        const deckLine2 = scene.add.rectangle(0, 1, 45, 0.5, 0x5a5a5a);

        
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

        
        scene.physics.add.existing(submarineContainer);
        submarineContainer.body
            .setCircle(15) 
            .setOffset(16, -6)
            .setDamping(true)
            .setDrag(0.98)
            .setAngularDrag(100)
            .setVelocity(0, 0);

        
        this.currentSpeed = 0;
        this.currentAngularVelocity = 0;
        this.maxAngularVelocity = 60;
        this.angularAcceleration = 120;
        this.hydrodynamicsFactor = 0.3;
        this.angularDeceleration = 180;

        
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

        
        this.isDiving = false;
    }

    update(time, delta) {
        const deltaSeconds = delta / 1000;

        
        if (this.isDiving) {
            
            if (!this.isBatteryDepleted || this.batteryLevel > 0) {
                this.batteryLevel -= this.batteryDrainRate * deltaSeconds;

                
                if (this.batteryLevel <= 0) {
                    this.batteryLevel = 0;
                    this.isBatteryDepleted = true;
                    
                    this.stopSubmarine();
                }
            }
        } else {
            
            if (this.batteryLevel < 100) {
                this.batteryLevel += this.batteryChargeRate * deltaSeconds;

                
                if (this.batteryLevel >= 100) {
                    this.batteryLevel = 100;
                }

                
                if (this.batteryLevel > 5 && this.isBatteryDepleted) {
                    this.isBatteryDepleted = false;
                }
            }
        }

        
        if (this.batteryMeter) {
            this.batteryMeter.updateBatteryLevel(this.batteryLevel);
        }

        
        if (this.isTransitioning) {
            const elapsed = time - this.transitionStartTime;
            const progress = Math.min(elapsed / this.transitionDuration, 1);

            
            const easedProgress = this.easeInOutQuad(progress);

            
            this.currentSpeed = Phaser.Math.Linear(
                this.transitionStartSpeed,
                this.transitionEndSpeed,
                easedProgress
            );

            
            if (progress >= 1) {
                this.isTransitioning = false;
                this.currentSpeed = this.transitionEndSpeed;
            }
        }

        
        if (this.isDiving) {
            this.updateBubbles(delta);
        } else {
            this.updateSmoke(delta);
        }

        
        if (this.isDiving && this.isBatteryDepleted) {
            this.stopSubmarine();
        }
    }

    
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    
    stopSubmarine() {
        if (this.sprite && this.sprite.body) {
            this.sprite.body.setVelocity(0, 0);
            this.sprite.body.setAngularVelocity(0);
        }
        this.currentSpeed = 0;
        this.currentAngularVelocity = 0;
    }

    
    updateSpeed(delta) {
        
        if (this.isDiving && this.isBatteryDepleted) {
            return;
        }

        
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

            
            const offset = new Phaser.Math.Vector2(-25, 0).rotate(
                this.rotation
            );

            
            const bubbleCount = 10;

            for (let i = 0; i < bubbleCount; i++) {
                const bubbleX = this.x + offset.x + Phaser.Math.Between(-2, 2);
                const bubbleY = this.y + offset.y + Phaser.Math.Between(-2, 2);

                
                
                const bubbleAngle = this.rotation + Math.PI + 3000;

                this.particleManager.createBubble(
                    bubbleX,
                    bubbleY,
                    bubbleAngle, 
                    30, 
                    1, 
                    0xa0d2ff 
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
        
        if (isDiving && this.isBatteryDepleted && this.batteryLevel <= 0) {
            return false; 
        }

        
        if (this.isDiving === isDiving) {
            return true;
        }

        
        if (!this.isDiving && isDiving) {
            
            this.targetSpeed = this.currentSpeed * 0.4;
            
            this.isTransitioning = true;
            this.transitionStartTime = this.scene.time.now;
            this.transitionDuration = 1000; 
            this.transitionStartSpeed = this.currentSpeed;
            this.transitionEndSpeed = this.targetSpeed;
        }
        
        else if (this.isDiving && !isDiving) {
            
            this.targetSpeed = Math.min(this.currentSpeed * 1.5, 60); 
            
            this.isTransitioning = true;
            this.transitionStartTime = this.scene.time.now;
            this.transitionDuration = 1500; 
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

        return true; 
    }

    
    setBatteryMeter(batteryMeter) {
        this.batteryMeter = batteryMeter;
        
        if (this.batteryMeter) {
            this.batteryMeter.updateBatteryLevel(this.batteryLevel);
        }
    }

    
    accelerate(value) {
        
        if (this.isDiving && this.isBatteryDepleted) {
            return;
        }

        
        super.accelerate(value);
    }

    turn(value) {
        
        if (this.isDiving && this.isBatteryDepleted) {
            return;
        }

        
        super.turn(value);
    }
}