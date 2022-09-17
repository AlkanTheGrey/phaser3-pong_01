class Paddle extends Phaser.GameObjects.Rectangle {
  constructor(scene, x, y, width, height, color) {
    super(scene, x, y, width, height, color);
    scene.add.existing(this);
    scene.physics.world.enableBody(this, 0);

    this.__moveSpeed = 150;
    this.__deceleration = 2;
  }

  moveUp(){
    this.body.setVelocityY( -this.__moveSpeed );
    return;
  }

  moveDown(){
    this.body.setVelocityY( this.__moveSpeed );
    return;
  }

  stopMoving(){
    if( this.body.velocity.y > 0 ){
      this.body.setVelocityY( Math.floor(this.body.velocity.y) - this.__deceleration );
    }
    if( this.body.velocity.y < 0 ){
      this.body.setVelocityY( Math.floor(this.body.velocity.y) + this.__deceleration );
    }
    return;
  }
}

class Ball extends Phaser.GameObjects.Ellipse{
  constructor( scene, x, y, width, height, color ){
    super( scene, x, y, width, height, color );

    scene.add.existing( this );
    scene.physics.world.enableBody( this, 0 );

    this.body.setCollideWorldBounds( true );
    this.body.setBounce( 1.01 );

    this.__maxVelocity = 400;
    this.body.setMaxVelocity( this.__maxVelocity )
  }

  /**Launch the ball with a given velocity */
  shoot( x = 0, y = 0 ){
    this.body.setVelocity( x, y );
    return;
  }

  update(){
    console.log( "ball" );
  }
}

class MainMenu extends Phaser.Scene {
  constructor() {
    super("MainMenu");
  }

  create() {
    let canvas = {
      width: this.game.config.width,
      heignt: this.game.config.height,
    };

    // main heading text
    this.txt_mainHeading = this.add.text(
      canvas.width / 2,
      canvas.heignt / 2,
      "PONG CLONE",
      {
        fontSize: "32px",
      }
    );
    this.txt_mainHeading.setOrigin(0.5, 0.5);

    // start button background
    this.obj_startButton = this.add.rectangle(
      canvas.width / 2,
      canvas.heignt / 2 + 32,
      80,
      25,
      COLORS.orange_pantone
    )
    this.obj_startButton.setInteractive();
    this.obj_startButton.on(
      "pointerdown",
      this.startGame,
      this
    );

    // start button text
    this.txt_startButton = this.add.text(
      canvas.width / 2,
      canvas.heignt / 2 + 32,
      "Start"
    );
    this.txt_startButton.setOrigin(0.5, 0.5);
    
  }

  startGame(){
    this.scene.start( "GameScene" );
    this.scene.stop( "MainMenu" );
    return;
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create(){
    let canvas = {
      width: this.game.config.width,
      heignt: this.game.config.height,
    };

    // control keys
    let keys = "ESC,w,s,up,down".toUpperCase();
    this.input_keyboard = this.input.keyboard.addKeys( keys );

    // create paddle
    let p1 = new Paddle( this, 20,canvas.heignt / 2, 5, 64, COLORS.oxford_blue );
    p1.setName( "paddle_1" );
    let p2 = new Paddle( this, canvas.width - 20,canvas.heignt / 2, 5, 64, COLORS.oxford_blue );
    p2.setName( "paddle_2" );

    this.grp_paddles = this.physics.add.group({
      collideWorldBounds: true,
      immovable: true,
    });

    this.grp_paddles.addMultiple( [p1, p2] );
    this.obj_paddle_1 = p1;
    this.obj_paddle_2 = p2;

    // create score zone
    let zone_width = 5;
    let goal_1 = this.add.rectangle( 0, 0, zone_width, canvas.heignt, COLORS.orange_pantone ).setOrigin( 0, 0 );
    goal_1.setName( "goal_1" );
    let goal_2 = this.add.rectangle( canvas.width - zone_width, 0, 5, canvas.heignt, COLORS.orange_pantone ).setOrigin( 0, 0 );
    goal_2.setName( "goal_2" );

    this.grp_scoreZones = this.physics.add.group({
      immovable: true
    });

    this.grp_scoreZones.addMultiple( [goal_1, goal_2] );

    // create Ball
    this.obj_ball = new Ball( this, canvas.width / 2, canvas.heignt / 2, 10, 10, COLORS.oxford_blue );

    // launch ball
    this.data.set( "ballInitialVelocity", 300 )
    this.obj_ball.shoot( this.data.get("ballInitialVelocity"), 0 );

    // set collision events
    this.physics.add.collider( this.grp_paddles, this.obj_ball, this.paddleHit, undefined, this );
    this.physics.add.collider( this.grp_scoreZones, this.obj_ball, this.pointScored, undefined, this );

    // score setup
    this.__score = {
      p1: 0,
      p2: 0
    }

    this.txt_scores = {
      p1: this.add.text( canvas.width / 2 - 20, 25, this.__score.p1, { fontSize: "32px" } ).setOrigin( 1, 0.5 ),
      p2: this.add.text( canvas.width / 2 + 20, 25, this.__score.p1, { fontSize: "32px" } ).setOrigin( 0, 0.5 ),
      divider: this.add.text( canvas.width / 2 , 25, ":", { fontSize: "28px" } ).setOrigin( 0.5, 0.5 ),
    }

  }

  pointScored( ball, goal ){
    let _goal = goal.name;
    // console.log( _goal )
    // give score point
    // reset ball
    // launch ball to paddle that didnt get the point
    let fire_direction;
    this.grp_paddles.setVelocityY( 0 );
    this.grp_paddles.setY( this.game.config.height / 2 );
    ball.body.setVelocity( 0 );
    ball.setPosition(  this.game.config.width / 2, this.game.config.height / 2 );

    if( _goal == "goal_1" ){
      ball.shoot(-300, 0 );
      this.updateScore( 0, 1 );
    }
    else if( _goal == "goal_2" ){
      ball.shoot( 300, 0 );
      this.updateScore( 1, 0 );
    }

    return;
  }

  updateScore( p1 = 0, p2 = 0 ){
    this.__score.p1 += p1;
    this.txt_scores.p1.setText( this.__score.p1 );
    this.__score.p2 += p2;
    this.txt_scores.p2.setText( this.__score.p2 );

    let score_limit = 10;

    if( this.__score.p1 >= score_limit || this.__score.p2 >= score_limit ){
      this.endGame();
    }
    return;
  }

  paddleHit( ball, paddle ){
    let height_difference = Math.floor( paddle.y - ball.y );
    let shift_fatcor =  3;

    if( height_difference != 0 ){
      let ball_vY = ball.body.velocity.y;
      let added_v = height_difference * shift_fatcor;
      let ball_new_vY = ball_vY - added_v;
      ball.body.setVelocityY( ball_new_vY );
    }

    return;
  }

  movePlayer( { up = false, down = false } ){
    // if both or neither are held down, do nothing
    if( (up == false && down == false) || ( up && down ) ){
      this.obj_paddle_1.stopMoving();
      return;
    }

    if( up ){
      this.obj_paddle_1.moveUp();
    }
    else{
      this.obj_paddle_1.moveDown();
    }

  }

  endGame(){
    this.scene.start( "MainMenu" );
    this.scene.stop( "GameScene" );
    return;
  }

  update(){

    if( this.input_keyboard["ESC"].isDown ){
      this.endGame();
    }

    let motion = {
      up: false,
      down: false
    }

    if( this.input_keyboard["W"].isDown || this.input_keyboard["UP"].isDown ){
      motion.up = true;
    }

    if( this.input_keyboard["S"].isDown || this.input_keyboard["DOWN"].isDown ){
      motion.down = true;
    }

    this.movePlayer( motion );
    this.moveAI();

  }

  /**Concerned with directing the ai */
  moveAI(){

    // when paddle wont hit
    if( this.obj_paddle_2.x - this.obj_ball.x < this.game.config.width / 2 ){
      // check if paddle can hit ball
      if( 
        this.obj_ball.y > ( this.obj_paddle_2.y - this.obj_paddle_2.height / 2 ) &&
        this.obj_ball.y < ( this.obj_paddle_2.y + this.obj_paddle_2.height / 2 )
      ){
        // do nothing or try and hit ball towards side player is not on
        console.log( "paddle can hit" );
        this.obj_paddle_2.stopMoving();
      }

      else{
        console.log( "paddle won't hit" );
        if( this.obj_ball.y < this.obj_paddle_2.y ){
          this.obj_paddle_2.moveUp();
        }
        else{
          this.obj_paddle_2.moveDown();
        }
      }
    }
    else{
      this.obj_paddle_2.stopMoving();
    }
    
    return;
  }

}

const COLORS = {
  rich_black_fogra_29: 0x0d1b2a,
  oxford_blue: 0x1b263b,
  bdazzled_blue: 0x415a77,
  shadow_blue: 0x778da9,
  platinum: 0xe0e1dd,
  orange_pantone: 0xff9662,
};

const GAME_CONFIG = {
  type: Phaser.AUTO,
  width: 720,
  height: 360,

  scale: {
    mode: Phaser.Scale.ScaleModes.FIT,
    autoCenter: Phaser.Scale.Center.CENTER_BOTH,
  },

  pixelArt: false,
  backgroundColor: COLORS.shadow_blue,
  scene: [MainMenu, GameScene],

  physics: {
    default: "arcade",
  },
};

const GAME = new Phaser.Game(GAME_CONFIG);
