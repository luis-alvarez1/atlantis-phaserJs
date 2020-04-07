var cant_diamantes = 30; //cantidad de diamantes en la pantalla
var cant_boobles = 30;
GamePlayManager = {
    init: function() {

        //instruccion para que la pantalla tome las dimensiones actuales
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;

        //variable que controla el movimiento y el inicio
        this.flagFirstMouseDown = false;
        this.endGame = false;
        this.amountDiamondsCaught = 0;
        this.closeEye = -1;
    },
    preload: function() {
        game.load.image('background', 'assets/images/background.png'); //se carga una imagen
        game.load.image('explosion', 'assets/images/explosion.png');

        //('id','ruta',largo,ancho,#imagenes)
        game.load.spritesheet('horse', 'assets/images/horse.png', 84, 156, 2);
        game.load.spritesheet('diamonds', 'assets/images/diamonds.png', 81, 84, 4);
        game.load.image('shark', 'assets/images/shark.png');
        game.load.image('fishes', 'assets/images/fishes.png');
        game.load.image('mollusk', 'assets/images/mollusk.png');

        game.load.image('booble1', 'assets/images/booble1.png');
        game.load.image('booble2', 'assets/images/booble2.png');

    },
    create: function() {
        game.add.sprite(0, 0, 'background'); // se añade la imagen

        this.boobleArray = [];

        for (var i = 0; i < cant_boobles; i++) {
            var xBooble = game.rnd.integerInRange(1, 1140);
            var yBooble = game.rnd.integerInRange(600, 950);

            //burbuja atual
            var booble = game.add.sprite(xBooble, yBooble, 'booble' + game.rnd.integerInRange(1, 2));

            booble.vel = 0.2 + game.rnd.frac() * 2;
            booble.alpha = 0.9;
            booble.scale.setTo(0.2 + game.rnd.frac());

            this.boobleArray[i] = booble;
        }

        this.mollusk = game.add.sprite(500, 150, 'mollusk');
        this.shark = game.add.sprite(500, 20, 'shark');
        this.fishes = game.add.sprite(100, 550, 'fishes');
        this.horse = game.add.sprite(0, 0, 'horse'); //añade caballo
        this.horse.frame = 0; //se utiiza el segundo caballo

        //se coloca en el medio
        this.horse.x = game.width / 2;
        this.horse.y = game.height / 2;

        //se define el punto de apoyo en el centro de la imagen (x,y)
        this.horse.anchor.setTo(0.5);

        //alpha -> opacidad (x>0, x<1)

        game.input.onDown.add(this.onTap, this); //se llama la funcion y se asigna al objeto GamePlay con el this

        this.diamonds = []; //array de diamantes

        for (let i = 0; i < cant_diamantes; i++) {
            //(x,y,'id')
            var diamond = game.add.sprite(100, 100, 'diamonds'); // se agregan a la pantalla

            diamond.frame = game.rnd.integerInRange(0, 3); //se le da una img al azar entre 0 y 4
            //frac devuelve un numero entre 0 y 1
            diamond.scale.setTo(0.3 + game.rnd.frac()); // se randomiza la escala
            diamond.anchor.setTo(0.5); //se desplaza el punto de apoyo de la imagen

            diamond.x = game.rnd.integerInRange(50, 1050);
            diamond.y = game.rnd.integerInRange(50, 600);

            this.diamonds[i] = diamond;

            var rectCurrentDiamond = this.getBounds(diamond); // rectangulo del diamante actual
            var rectHorse = this.getBounds(this.horse);

            // mientras el rectangulo se sobreponga sobre algun otro elemento de la pantalla
            while (this.isOverlapingOtherDiamond(i, rectCurrentDiamond) ||
                this.isRectangleOverlapping(rectHorse, rectCurrentDiamond)) {

                //se vuelve a cambiar de pos el diamante
                diamond.x = game.rnd.integerInRange(50, 1050);
                diamond.y = game.rnd.integerInRange(50, 600);

                // se calcula el rectangulo del diamante actual
                rectCurrentDiamond = this.getBounds(diamond);
            }
        }

        // se agrega un grupo

        // var ex1 = this.explosionGroup.create(200, 200, 'explosion');
        // var ex2 = this.explosionGroup.create(400, 200, 'explosion');
        // this.explosionGroup.scale.setTo(0.5);
        // los grupos contienen sprites y estos pueden ser pedidos y cuando son usados
        // se vuelven a dejar como disponibles

        //se liberan los sprites
        // ex1.kill();

        // var newExplosion = this.explosionGroup.getFirstDead();
        // console.log(newExplosion);

        // se añaden 10 elementos al grupo

        this.explosionGroup = game.add.group();
        for (let i = 0; i < 10; i++) {
            this.explosion = this.explosionGroup.create(100, 100, 'explosion'); //se agrega la imagen de explosion (grupo)
            this.explosion.tweenScale = game.add.tween(this.explosion.scale).to({
                x: [0.4, 0.8, 0.4],
                y: [0.4, 0.8, 0.4]

            }, 600, Phaser.Easing.Exponential.Out, false, 0, 0, false);

            this.explosion.tweenAlpha = game.add.tween(this.explosion).to({
                alpha: [1, 0.6, 0]
            }, 600, Phaser.Easing.Exponential.Out, false, 0, 0, false);

            this.explosion.anchor.setTo(0.5);
            this.explosion.kill();

        }

        this.currentScore = 0;
        var style = {
            font: 'bold 30pt Arial',
            fill: '#FFFFFF',
            align: 'center'
        };

        this.scoreText = game.add.text(game.width / 2, 40, '0', style);

        this.scoreText.anchor.setTo(0.5);

        this.totaltime = 20;
        this.timerText = game.add.text(1000, 40, this.totaltime + '', style);
        this.timerText.anchor.setTo(0.5);

        this.timerGmerOver = game.time.events.loop(Phaser.Timer.SECOND, () => {
            if (this.flagFirstMouseDown) {
                this.totaltime--;
                this.timerText.text = this.totaltime + '';
                if (this.totaltime <= 0) {
                    game.time.events.remove(this.timerGmerOver);
                    this.endGame = true;
                    this.showFinalMessage('GAME OVER');
                }

            }
        }, this);


        this.explosion.tweenScale = game.add.tween(this.explosion.scale).to({
            x: [0.4, 0.8, 0.4],
            y: [0.4, 0.8, 0.4]

        }, 600, Phaser.Easing.Exponential.Out, false, 0, 0, false);

        this.explosion.tweenAlpha = game.add.tween(this.explosion).to({
            alpha: [1, 0.6, 0]
        }, 600, Phaser.Easing.Exponential.Out, false, 0, 0, false);

        this.explosion.anchor.setTo(0.5);
        this.explosion.visible = false;

        // var tween = game.add.tween(this.explosion); // se genera un tween de la explosion
        //se mueve el tween hacia la posicion expecificada
        //(pos{x,y}, time, Easing)
        // tween.to({ x: 500, y: 100 }, 1500, Phaser.Easing.Exponential.Out);
        // tween.start(); //se inicia el tween

    },

    increaseScore: function() {
        this.closeEye = 0;
        this.horse.frame = 1;

        this.currentScore += 100;
        this.scoreText.text = this.currentScore;
        this.amountDiamondsCaught++;
        if (this.amountDiamondsCaught >= cant_diamantes) {
            game.time.events.remove(this.timerGmerOver);
            this.endGame = true;
            this.showFinalMessage('CONGRATULATIONS');
        }

    },
    showFinalMessage: function(msg) {
        this.tweenMollusk.stop();
        var bgAlpha = game.add.bitmapData(game.width, game.height);
        bgAlpha.ctx.fillStyle = '#000000';
        bgAlpha.ctx.fillRect(0, 0, game.width, game.height);

        var bg = game.add.sprite(0, 0, bgAlpha);
        bg.alpha = 0.5;

        var style = {
            font: 'bold 60pt Arial',
            fill: '#FFFFFF',
            align: 'center'
        };

        this.textFieldFinalMsg = game.add.text(game.width / 2, game.height / 2, msg, style);
        this.textFieldFinalMsg.anchor.setTo(0.5);
    },
    //funcion que se llama al primer click
    onTap: function() {
        if (!this.flagFirstMouseDown) {

            this.tweenMollusk = game.add.tween(this.mollusk.position).to({ y: -0.001 },
                5800, Phaser.Easing.Cubic.InOut, true, 0, 1000, true).loop(true);

        }

        this.flagFirstMouseDown = true; //se cambia el valor del flag para ejecutar el juego
    },
    //funcion que devuelve las dimensiones del diamante
    getBounds: function(diamante_actual) {
        return new Phaser.Rectangle(diamante_actual.left, diamante_actual.top,
            diamante_actual.width, diamante_actual.height); // se devuelve un rectangulo con las dimensiones del diamante
    },
    //valida que el rectangulo no se sobre ponga con ningun sprite en la pantalla
    isRectangleOverlapping: function(rect1, rect2) {

        //se valida si los recangulos se tocan o se sobreponen y devuelve false si no es así
        if (rect1.x > (rect2.x + rect2.width) || rect2.x > (rect1.x + rect1.width)) {
            return false;
        }
        if (rect1.y > (rect2.y + rect2.height) || rect2.y > (rect1.y + rect1.height)) {
            return false;
        }
        return true; // devuelve true si se tocan

    },
    isOverlapingOtherDiamond: function(index, rect2) {
        for (var i = 0; i < index; i++) {
            var rect1 = this.getBounds(this.diamonds[i]);
            if (this.isRectangleOverlapping(rect1, rect2)) {
                return true;
            }
        }
        return false;
    },
    getBoundsHorse: function() {
        var x0 = this.horse.x - (Math.abs(this.horse.width) / 2);
        var y0 = this.horse.y - (this.horse.height / 2);
        var width = Math.abs(this.horse.width);
        var height = this.horse.height;

        return new Phaser.Rectangle(x0, y0, width, height);
    },
    render: function() {
        // game.debug.spriteBounds(this.horse);

        // for (let i = 0; i < cant_diamantes; i++) {
        //     game.debug.spriteBounds(this.diamonds[i]);

        // }
    },
    update: function() {

        //SOLO SE EJECUTA EL CODIGO SI SE PRESIONÓ EL PRIMER CLICK

        if (this.flagFirstMouseDown == true && !this.endGame) {

            //animacion de burbujas
            for (var i = 0; i < cant_boobles; i++) {
                var booble = this.boobleArray[i];

                booble.y -= booble.vel;

                //si la burbuja se sale de la pantalla
                if (booble.y < -50) {
                    booble.y = 700;
                    booble.x = game.rnd.integerInRange(1, 1140); // se mete en otro lugar
                }
            }

            if (this.closeEye >= 0) {
                this.closeEye++;

                if (this.closeEye > 20) {
                    this.closeEye = -1;
                    this.horse.frame = 0;
                }
            }
            //movimiento del tiburon
            this.shark.x--;
            if (this.shark.x < -300) {
                this.shark.x = 1300;
            }

            //movimiento de los peces
            this.fishes.x += 0.3;
            if (this.fishes.x > 1300) {
                this.fishes.x = -300;
            }
            //se reciben las coordenadas del mouse
            var pointerX = game.input.x;
            var pointerY = game.input.y;

            var distX = pointerX - this.horse.x; //se resta la coordenada en x con la del caballo en x
            var distY = pointerY - this.horse.y;

            //se valida de qué lado está el mouse para voltear el caballo
            if (distX > 0) {
                this.horse.scale.setTo(1, 1);
            } else {
                this.horse.scale.setTo(-1, 1);
            }

            // MOVIMIENTO DEL CABALLO
            // se suma la distancia del mouse y se asigna a la del caballo para movero
            // se porcentualiza para que no sea un movimiento brusco
            this.horse.x += distX * 0.02;
            this.horse.y += distY * 0.02;

            for (let i = 0; i < cant_diamantes; i++) {
                var rectHorse = this.getBoundsHorse();
                var rectDiamond = this.getBounds(this.diamonds[i]);

                if (this.diamonds[i].visible && this.isRectangleOverlapping(rectHorse, rectDiamond)) {
                    this.diamonds[i].visible = false;

                    this.increaseScore();
                    var explosion = this.explosionGroup.getFirstDead();

                    if (explosion != null) {

                        explosion.reset(this.diamonds[i].x, this.diamonds[i].y);
                        explosion.tweenScale.start();
                        explosion.tweenAlpha.start();

                        // se llama esta funcion de phaser para que los tweens siempre
                        // esten disponibles al completar la animacion.
                        // OJO: solo es necesario hacerlo con un tween
                        explosion.tweenAlpha.onComplete.add(function(currentTarget, currentTween) {
                            currentTarget.kill();
                        }, this);
                    }
                }

            }
        }
    }
};

var game = new Phaser.Game(1136, 640, Phaser.CANVAS);

game.state.add("gameplay", GamePlayManager);
game.state.start("gameplay");