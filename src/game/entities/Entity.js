export class Entity {
    constructor(scene, x, y, sprite) {
        this.scene = scene;
        this.sprite = sprite;
        if (!this.sprite) {
            return null;
        }
        scene.physics.add.existing(this.sprite);
        if (this.sprite.body) {
            this.sprite.setActive(true).setVisible(true);
            this.sprite.body.enable = true;
            this.sprite.body.setSize(
                this.sprite.width || 10,
                this.sprite.height || 10
            );
            this.sprite.body.setOffset(
                -(this.sprite.width || 10) / 2,
                -(this.sprite.height || 10) / 2
            );
        } else {
            this.sprite.destroy();
            return null;
        }
    }

    destroy() {
        if (this.sprite) {
            this.sprite.body.enable = false;
            this.sprite.destroy();
            this.sprite = null;
        }
    }

    get x() {
        return this.sprite ? this.sprite.x : 0;
    }
    set x(value) {
        if (this.sprite) this.sprite.x = value;
    }
    get y() {
        return this.sprite ? this.sprite.y : 0;
    }
    set y(value) {
        if (this.sprite) this.sprite.y = value;
    }
    get rotation() {
        return this.sprite ? this.sprite.rotation : 0;
    }
    set rotation(value) {
        if (this.sprite) this.sprite.rotation = value;
    }
    get active() {
        return this.sprite ? this.sprite.active : false;
    }
}
