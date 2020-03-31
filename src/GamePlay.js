GamePlayManager = {
    init: function() {
        //instruccion para que la pantalla tome las domensiones actuales
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
    },
    preload: function() {
        game.load.image('background', 'assets/images/background.png'); //se carga una imagen
        game.load.spritesheet('horse', 'assets/images/horse.png', 84, 156, 2);
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
    },
    update: function() {
        //se reciben las coordenadas del mouse
        var pointerX = game.input.x;
        var pointerY = game.input.y;

        var distX = pointerX - this.horse.x; //se resta la coordenada en x con la del caballo en x
        var distY = pointerY - this.horse.y;

        if (distX > 0) {
            this.horse.scale.setTo(1, 1);
        } else {
            this.horse.scale.setTo(-1, 1)
        }
    }
};

var game = new Phaser.Game(1136, 640, Phaser.CANVAS);

game.state.add("gameplay", GamePlayManager);
game.state.start("gameplay");