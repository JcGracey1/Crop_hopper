class endScene extends Phaser.Scene {
    constructor() {
        super({ key: 'gameOverScene' });
    }

    preload(){
        this.load.setPath("./assets/");
        this.load.image("gameoverBG", "farm_background.png");
    }

    create() {
        let bg = this.add.image(0, 0, 'gameoverBG').setOrigin(0, 0);
        bg.displayWidth = this.sys.game.config.width;
        bg.displayHeight = this.sys.game.config.height;

        this.add.text(500, 300, 'GAME OVER', { fontSize: '48px', fill: '#000000' })
            .setOrigin(0.5);

        this.add.text(500, 500, 'Youve completed the level! More to come, but for now, gg.', { fontSize: '28px', fill: '#000000' })
            .setOrigin(0.5);

        let playAgain = this.add.text(500, 400, 'Play Again', { fontSize: '32px', fill: '#000000' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        playAgain.on('pointerdown', () => {
            this.scene.stop();
            this.scene.get("platformerScene").resetGame();
        });

        
        this.tweens.add({
            targets: [playAgain],
            scaleX: 1.2,
            scaleY: 1.2,
            ease: 'Sine.easeInOut', // Specifies a smooth sinusoidal easing
            duration: 1000, // Duration of one way scaling
            yoyo: true, // Apply the tween back to the original state
            repeat: -1 // Repeat infinitely
        });
    }
}
