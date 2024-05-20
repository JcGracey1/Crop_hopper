class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    // preload(){
    //     this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
    // }

    init() {
            // Toolkit values
        const scaleFactor = 10; // Adjust as needed based on your game's resolution

        // Translate toolkit values to Phaser
        this.ACCELERATION = 50 * scaleFactor; // Toolkit Acceleration
        this.DRAG = 1500;         // Toolkit Deceleration
        this.MAX_VELOCITY = 450;  // Toolkit Max Speed
        this.physics.world.gravity.y = 1.8 * scaleFactor * 100; // Toolkit Down Gravity (adjusting scale for better feel)

        // Calculate jump velocity based on jump height and gravity
        const jumpHeight = 1000 * scaleFactor;  // Toolkit Jump Height
        const gravity = this.physics.world.gravity.y - 500;
        this.JUMP_VELOCITY = -Math.sqrt(2 * gravity * jumpHeight); // Negative because jump is upward

        this.PARTICLE_VELOCITY = 35;
        this.SCALE = 2.0;
        this.score = 0;
    }


    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("crop-hop-map", 18, 18, 45, 25);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("tilemap_packed", "tilemap_tiles");

        // Create a layer
        this.groundLayer = this.map.createLayer("Base", this.tileset, 0, 0);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        // DONE: Add createFromObjects here
        // Find coins in the "Objects" layer in Phaser
        // Look for them by finding objects with the name "coin"
        // Assign the coin texture from the tilemap_sheet sprite sheet
        // Phaser docs:
        // https://newdocs.phaser.io/docs/3.80.0/focus/Phaser.Tilemaps.Tilemap-createFromObjects

        // this.coins = this.map.createFromObjects("Objects", {
        //     name: "coin",
        //     key: "tilemap_sheet",
        //     frame: 151
        // });

        // DONE: Add turn into Arcade Physics here
        // Since createFromObjects returns an array of regular Sprites, we need to convert 
        // them into Arcade Physics sprites (STATIC_BODY, so they don't move) 
        //this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array this.coins
        // This will be used for collision detection below.
        //this.coinGroup = this.add.group(this.coins);

        // set up player avatar
        my.sprite.player = this.physics.add.sprite(30, 200, "platformer_characters", "tile_0007.png");
        my.sprite.player.setCollideWorldBounds(true);

        my.sprite.player.body.setMaxVelocity(this.MAX_VELOCITY, this.MAX_VELOCITY);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);
        

        my.vfx.coinCollected = this.add.particles(0, 0, "kenny-particles", {
            frame: ['magic_04.png', 'magic_05.png'],
            //random: true,
            scale: {start: 0.03, end: 0.1},
            //maxAliveParticles: 8,
            lifespan: 200,
            //gravityY: -400,
            alpha: { start: 1, end: 0.1 },
            //angle: { start: 0, end: 360 }, // Add rotation
            //rotate: { start: 0, end: 360 }, // Add rotation
        });

        // CODE FOR MOVEABLE OBJECT:
        // Create the object to be pushed
        this.pushableObject = this.physics.add.sprite(415, 200, 'hayBarrel');
        this.pushableObject.setCollideWorldBounds(true);

        // Enable collision with the ground layer
        this.physics.add.collider(this.pushableObject, this.groundLayer);

        // Enable collision with the player
        this.physics.add.collider(my.sprite.player, this.pushableObject);

        // Configure the object physics properties
        this.pushableObject.setImmovable(false); // Allow it to be pushed
        this.pushableObject.body.setMass(10); // Set mass for realistic pushing behavior
        this.pushableObject.body.setSize(18, 14);
        this.pushableObject.body.setOffset(0, 4);


        this.scoreText = this.add.text(16, 16, "Score: " + this.score, { fontSize: '16px' });
        // DONE: Add coin collision handler
        // Handle collision detection with coins
        // this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
        //     my.vfx.coinCollected.emitParticleAt(obj2.x, obj2.y, 10);
        //     this.score += 10;
        //     this.scoreText.setText('Score: ' + this.score);
        //     obj2.destroy(); // remove coin on overlap
        // });
    
        //console.log(this.score);

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        // DONE: Add movement vfx here
        // movement vfx

        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['dirt_01.png', 'dirt_02.png'],
            //random: true,
            scale: {start: 0.01, end: 0.04},
            //maxAliveParticles: 8,
            lifespan: 350,
            //gravityY: -400,
            alpha: {start: 1, end: 0}, 
            speedX: { min: -5, max: 5 }, // Adjust speedX to control horizontal drift
            speedY: { min: -5, max: 5 },
        });

        //this.animatedTiles.init(this.map);

        my.vfx.walking.stop()
        my.vfx.coinCollected.stop()
        

        // DONE: add camera code here
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);

        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        
    }

    update() {
        if(cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            // DONE: add particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-1, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }

        } else if(cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            // TODO: add particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-15, my.sprite.player.displayHeight/2-1, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, -1);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }

        } else {
            // Set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            // DONE: have the vfx stop playing
            my.vfx.walking.stop();
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
        }

        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }
    }
}