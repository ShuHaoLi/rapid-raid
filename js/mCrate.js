var crates;
var placedCrates;
var remainingCrates = [];
var aplacedCrates = [];
var selectedCrate;
var walls;
var timer;
var turnsLeft;


BasicGame.mCrate = function (game) {

};

BasicGame.mCrate.prototype = {

    create: function () {
        // add background image
        this.add.sprite(0,0,'background3');
        this.initTurrets();
        this.initCrates();
        this.initTimer();
        this.initMap();
        this.initBoudaries();
    },

    // initializes the background, buttons and pause panel
    initMap: function() {
        // add buttons
        var buttonWidth = 60;
        var buttonHeight = 20;
        var ypos = scorebarHeight + gameHeight
        var xpos = gameWidth - buttonWidth;

        // add pause button
        this.pauseButton = this.add.button(xpos, ypos, 'smallButton', this.pauseGame, this);
        this.pauseButtonText = this.add.text(xpos + buttonWidth/3, ypos + buttonHeight/2, "Pause", styleSmall);
        this.pauseButtonText.anchor.setTo(0, 0.35);

        // add resume button and set to invisible
        this.playButton = this.add.button(xpos, ypos, 'smallButton', this.pauseGame, this);
        this.playButtonText = this.add.text(xpos + buttonWidth/3, ypos + buttonHeight/2, "Play", styleSmall);
        this.playButtonText.anchor.setTo(0, 0.35);
        this.playButton.visible = false;
        this.playButtonText.visible = false;
        this.paused = false;

        // moves left text
        turnsLeft = 8;
        this.movesText = this.add.text(buttonWidth/8, ypos + buttonHeight/2, ((turnsLeft % 2) == 0) ? "Player 1" : "Player 2" , styleSmall);
        this.movesText.anchor.setTo(0, 0.35);


        var medButtonWidth = 60;
        var medButtonHeight = 40;

        // add edit button
        this.editButton = this.add.button(gameWidth - medButtonWidth, 0, 'medButton', this.doneCrates, this);
        this.editButtonText = this.add.text(gameWidth - medButtonWidth, medButtonHeight/2, 'Done', styleMed);        
        this.editButtonText.anchor.setTo(0, 0.35);

        // add add button
        this.addButton = this.add.button(gameWidth - medButtonWidth*2, 0, 'medButton', this.addCrate, this);
        this.addButtonText = this.add.text(gameWidth - medButtonWidth*2, medButtonHeight/2, 'Add', styleMed);
        this.addButtonText.anchor.setTo(-0.5, 0.35);

        // add timer text
        this.timerText = this.add.text(gameWidth/2 - medButtonWidth/8, (gameHeight + scorebarHeight + menubarHeight) - medButtonHeight/2, timer.duration.toFixed(0)/1000, styleMed);

        // add pause panel
        this.pausePanel = new PausePanel(this.game);
        this.add.existing(this.pausePanel);
    },

    // initializes turrets
    initTurrets: function() {
        // add turrets with appropriate placement
        var numTurrets = 16;
        var tbspacing = 15;
        var btwspacing = 14;
        var turretSize = 32;


        for (var i = 0; i < numTurrets; i++) {
            if (i < numTurrets/2) {
                this.add.sprite(0,scorebarHeight + i*(turretSize + btwspacing) + tbspacing, 'turretL');
            }
            else {
                this.turret = this.add.sprite(gameWidth - 28, scorebarHeight + (i - numTurrets/2)*(turretSize + btwspacing) + tbspacing, 'turretR');
            }
        }
    },

    // initializes crates/crate placement bar
    initCrates: function() {        
        this.physics.startSystem(Phaser.Physics.ARCADE);

        //Crate Implementation 
        placedCrates = this.add.group();
        crates = this.add.group();

        var numCrates = 8;
        var currentCrate;
        var xposCrateInit = 20;
        var yposCrateInit = 20;
        var xSpacing = 40;

        for (i = 0; i < numCrates; i++) {
            var randSelection = Math.floor((Math.random() * 3));
            var crateImage;
            switch(randSelection){
                case 0:
                    crateImage = "darkcrate-32";
                    break;
                case 1:
                    crateImage = "medcrate-24";
                    break;
                case 2:
                    crateImage = "lightcrate-16";
                    break;
                default:
                    crateImage = "darkcrate-32";
                    break;
            }

            currentCrate = crates.create(xposCrateInit + i*xSpacing, yposCrateInit, crateImage);
            currentCrate.anchor.setTo(0.5, 0.5);


            remainingCrates.push(currentCrate);
            crates.add(currentCrate);
        }

        this.physics.arcade.enable(crates);
        crates.enableBody = true;
    },

    initTimer: function() {
        var turnResetTimer = 15000; // 15 seconds
        timer = this.time.create(false);
        timer.loop(turnResetTimer, this.changeTurn, this);
        timer.start();
    },

    placeCrate: function(pointer) {
        if (selectedCrate != null && !this.physics.arcade.overlap(selectedCrate, placedCrates) &&
            !this.physics.arcade.overlap(selectedCrate, walls)) {
            selectedCrate.body.velocity = 0;
            placedCrates.add(selectedCrate);
            var crateInfo = {x: selectedCrate.x, y: selectedCrate.y, key: selectedCrate.key}
            aplacedCrates.push(crateInfo);
            selectedCrate = null;
            timer.destroy();
            this.initTimer();
            this.changeTurn();
        }
    },

    changeTurn: function() {
        if (--turnsLeft == 0) {
            timer.destroy();
            this.doneCrates();
        }
        this.movesText.text = ((turnsLeft % 2) == 0) ? "Player 1" : "Player 2";
    },

    update: function () {
        if (selectedCrate != null) {
            // 60 is default speed, 50 is 50 ms time requirement
            this.physics.arcade.moveToPointer(selectedCrate, 60, this.input.activePointer, 50);
        }
        this.timerText.text = Math.floor((timer.duration.toFixed(0)/100))/10;
    },

    restartGame: function() {
        this.resetInfo();
        this.state.start('MCrate');
    },

    // consider adding callback for resuming/pausing game in order to sync animation with actual pausing/resuming
    pauseGame: function () {
        if (!this.paused) {
            this.paused = true;
            // show pause panel
            this.pausePanel.show();
            // replace pause button with resume button
            this.pauseButton.visible = false;
            this.pauseButtonText.visible = false;
            this.playButton.visible = true;
            this.playButtonText.visible = true;
            timer.pause();
        }
        else {
            this.paused = false;
            // hide pause panel
            this.pausePanel.hide();
            // replace resume butotn with pause button
            this.playButton.visible = false;
            this.playButtonText.visible = false;
            this.pauseButton.visible = true;
            this.pauseButtonText.visible = true;
            timer.resume();
        }
    },

    quitGame: function (pointer) {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        this.state.start('MainMenu');
    },

    addCrate: function() {
        if (selectedCrate == null) {
            selectedCrate = remainingCrates.pop();
            this.input.onDown.add(this.placeCrate, this);
        }
    },

    initBoudaries: function() {
        walls = this.add.group();

        leftWall = this.add.sprite(0, scorebarHeight);
        this.physics.arcade.enable(leftWall);
        leftWall.enableBody = true;
        leftWall.body.setSize(28, gameHeight, 0, 0);
        walls.add(leftWall);

        rightWall = this.add.sprite(gameWidth - 28, scorebarHeight);
        this.physics.arcade.enable(rightWall);
        rightWall.enableBody = true;
        rightWall.body.setSize(28, gameHeight, 0, 0);
        walls.add(rightWall);

        topWall = this.add.sprite(0, 0);
        this.physics.arcade.enable(topWall);
        topWall.enableBody = true;
        topWall.body.setSize(gameWidth, scorebarHeight + 5, 0, 0);
        walls.add(topWall);

        bottomWall = this.add.sprite(0, scorebarHeight + gameHeight - 5);
        this.physics.arcade.enable(bottomWall);
        bottomWall.enableBody = true;
        bottomWall.body.setSize(gameWidth, menubarHeight + 5, 0, 0);
        walls.add(bottomWall);
    },

    doneCrates: function() {
        if (selectedCrate == null) {
           this.state.start('MplayerGame');
       }
    },

    resetInfo: function() {
        remainingCrates = [];
        selectedCrate = null;
        aplacedCrates = [];
    }
};
