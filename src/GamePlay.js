var cant_diamantes = 30; //cantidad de diamantes en la pantalla
GamePlayManager = {
    init: function() {
        //instruccion para que la pantalla tome las dimensiones actuales
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;

        //variable que controla el movimiento y el inicio
        this.flagFirstMouseDown = false;
    },
    preload: function() {
        game.load.image('background', 'assets/images/background.png'); //se carga una imagen
        //('id','ruta',largo,ancho,#imagenes)
        game.load.spritesheet('horse', 'assets/images/horse.png', 84, 156, 2);
        game.load.spritesheet('diamonds', 'assets/images/diamonds.png', 81, 84, 4);
    },
    create: function() {
        game.add.sprite(0, 0, 'background'); // se añade la imagen
        this.horse = game.add.sprite(0, 0, 'horse'); //añade caballo
        this.horse.frame = 1; //se utiiza el segundo caballo

        //se coloca en el medio
        this.horse.x = game.width / 2;
        this.horse.y = game.height / 2;

        //se define el punto de apoyo en el centro de la imagen (x,y)
        this.horse.anchor.setTo(0.5);

        //alpha -> opacidad (x>0, x<1)

        game.input.onDown.add(this.onTap, this); //se llama la funcion y se asigna al objeto GamePlay con el this

        this.diamonds = []; //array de diamantes

        for (var i = 0; i < cant_diamantes; i++) {
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

    },
    //funcion que se llama al primer click
    onTap: function() {

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

        if (this.flagFirstMouseDown == true) {
            //se reciben las coordenadas del mouse
            var pointerX = game.input.x;
            var pointerY = game.input.y;

            var distX = pointerX - this.horse.x; //se resta la coordenada en x con la del caballo en x
            var distY = pointerY - this.horse.y;

            //se valida de qué lado estpa el mouse para voltear el caballo
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

            for (var i = 0; i < cant_diamantes; i++) {
                var rectHorse = this.getBoundsHorse();
                var rectDiamond = this.getBounds(this.diamonds[i]);

                if (this.isRectangleOverlapping(rectHorse, rectDiamond)) {
                    console.log('colision');
                }

            }
        }
    }
};

var game = new Phaser.Game(1136, 640, Phaser.CANVAS);

game.state.add("gameplay", GamePlayManager);
game.state.start("gameplay");