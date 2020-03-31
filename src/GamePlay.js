var cant_diamnates = 30; //cantidad de diamantes en la pantalla
GamePlayManager = {
    init: function() {
        //instruccion para que la pantalla tome las domensiones actuales
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

        //se define el centro en el centro de la imagen (x,y)
        this.horse.anchor.setTo(0.5);

        //alpha -> opacidad (x>0, x<1)

        game.input.onDown.add(this.onTap, this); //se llama la funcion y se asigna al objeto GamePlay con el this

        this.diamonds = []; //array de diamantes

        for (var i = 0; i < cant_diamates; i++) {
            //(x,y,'id')
            var diamond = game.add.sprite(100, 100, 'diamonts'); // se agregan a la pantalla

            diamond.frame = game.rnd.integerInRange(0, 3); //se le da una img al azar entre 0 y 4
            //frac devuelve un numero entre 0 y 1
            diamond.scale.setTo(0.3 + game.rnd.frac()); // se randomiza la escala
            diamond.anchor.setTo(0.5); //se desplaza el punto de apoyo de la imagen

            diamond.x = game.rnd.integerInRange(50, 1050);
            diamond.y = game.rnd.integerInRange(50, 600);
        }

    },
    //funcion que se llama al primer click
    onTap: function() {

        this.flagFirstMouseDown = true; //se cambia el valor del flag para ejecutar el juego
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
        }
    }
};

var game = new Phaser.Game(1136, 640, Phaser.CANVAS);

game.state.add("gameplay", GamePlayManager);
game.state.start("gameplay");