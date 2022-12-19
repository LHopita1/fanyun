class Frame {
    constructor(config) {
        this.element = config.element;
        this.canvas = this.element.querySelector(".game-frame");
        this.ctx = this.canvas.getContext("2d");

        this.Hp_bar = this.element.querySelector(".Boss-Health-point-Bar");
        this.Hp_bar_ctx = this.element.querySelector(".Outfit").getContext("2d");
        
        this.canvas_width = this.canvas.width;
        this.canvas_height = this.canvas.height;
        this.Game_grid = utils.unit(1);
        this.GameOver = false;

        this.deltaTime = 0;
        this.block = [utils.unit(-1), this.canvas_width];

        this.game_item = null;
        this.KeyInputData = null;

        if (config.diff.innerHTML == "easy") {
            this.Boss_Hp_max = 100;
        }else if (config.diff.innerHTML == "normal") {
            this.Boss_Hp_max = 500;
        }else if (config.diff.innerHTML == "hard") {
            this.Boss_Hp_max = 1000;
        }
        this.Boss_Hp = this.Boss_Hp_max;
        this.Boss_damage = 0;
    }

    init() {
        this.KeyInputData = new KeyInput();
        this.KeyInputData.init();

        this.game_item = new GameWorld(this);
        this.boss_bar = new Boss_Bar(this);

        this.go_loop();
    }

    go_loop() {
        let lastTime = Date.now(), timeStamp;

        const animate = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            //compute the window reflash ==
            timeStamp = Date.now()
            this.deltaTime = timeStamp - lastTime;
            lastTime = timeStamp;
            //=============================

            // loop-command ===============
            this.game_item.updata(this.deltaTime);
            this.game_item.draw(this.ctx);
            this.Hp_bar.innerHTML = this.Boss_Hp.toString();
            this.boss_bar.draw({
                ctx: this.Hp_bar_ctx,
                value: this.Boss_Hp
            });
            //=============================
            if(!this.GameOver) {
                requestAnimationFrame(() => {animate();});
            }else {
                this.GameOver_function();
            }
        };
        animate();
    }

    GameOver_function() {
        document.querySelector(".ReStart-frame").style.display = "block";

        if(this.Boss_Hp > 0) {
            document.querySelector(".End_text").innerHTML = "我們懷念你";
            document.querySelector(".End_text").style.color = "red";
        }else {
            document.querySelector(".End_text").innerHTML = "平安度過<br>&nbsp5月35日";
            document.querySelector(".End_text").style.color = "yellow";
        }
    }
}

class GameWorld {
    constructor(config) {
        this.element = config;
        this.BG_img = new Image();
        this.BG_img.src = "img/road.png";

        this.objcet = [];
        this.partical= [];
        this.#addPlayer();

        this.summonInterval = 1300;
        this.tank_summonTime = 1000;
        this.summonColumn = [0, 1, 2, 3, 4, 5, 6]
        this.range =  0.25; //0.25~0.8

        this.palyer_in_column = undefined;
    }
    updata(deltaTime) {
        //set image front or behide
        this.objcet.sort((a,b) => {
            return a.y - b.y;
        })

        for(var i = 0; i < this.objcet.length; i++) {
            
            if(this.objcet[i].Palyer_in_column != undefined) {
                this.palyer_in_column = utils.unit(this.objcet[i].Palyer_in_column);
            }

            if(this.element.Boss_Hp <= 0) {
                this.element.GameOver = true;
            }
            if(this.objcet[i].barrier) {
                if(!this.objcet[i].touchable) {
                    if(this.objcet[i].DeletItem) {
                        this.element.Boss_Hp --;
                        this.setBarrier(this.objcet[i].x, false)
                    }else {
                        this.setBarrier(this.objcet[i].x, true)
                    }
                }

                if(this.palyer_in_column == this.objcet[i].x) {
                    if(this.objcet[i].touchable) {
                        this.element.Boss_Hp -= Math.ceil(this.element.Boss_Hp_max/20);
                        this.objcet[i].DeletItem = true;
                    }else {
                        this.element.GameOver = true;
                    }
                }
                
            }
        }
        this.element.Boss_damage = this.element.Boss_Hp_max - this.element.Boss_Hp;
        if(this.element.Boss_damage >= 700) {
            this.range = 0.8;
        }else if(this.element.Boss_damage >= 500) {
            this.range = 0.50;
        }else if(this.element.Boss_damage >= 250) {
            this.range = 0.35;
        }
        //tank walk out of frame => delet tank
        this.objcet = this.objcet.filter(test => !test.DeletItem);
        this.partical = this.partical.filter(test => !test.DeletItem);

        //generate a random array with [0, 1, 2, 3, 4, 5, 6]
        for (let i = 0; i < this.summonColumn.length; i++) {
            let index_number = this.summonColumn[i];
            let random_data = Math.floor(Math.random()*7)

            this.summonColumn[i] = this.summonColumn[random_data];
            this.summonColumn[random_data] = index_number; 
        }

        //summon tank
        if(this.tank_summonTime > this.summonInterval) {
            let n = 1;
            for (let i = 0; i < 3; i++) {
                if(Math.random() < this.range) {
                    n++;
                }else{
                    break;
                }
            }
            this.#addTank(n);
            
            this.tank_summonTime = 0;
        }else {
            this.tank_summonTime += deltaTime;
        }

        this.objcet.forEach(obj => obj.updata({
            partical: this.partical,
            deltaTime: deltaTime,
            KeyData: this.element.KeyInputData.keyInput_data,
            Barrier: this.element.block,
            damage: this.element.Boss_damage
        }));
        this.partical.forEach(obj => obj.updata());
    }
    draw(ctx) {
        ctx.drawImage(this.BG_img, -15, 50, 400, 250);
        this.partical.forEach(obj => obj.draw(ctx));
        this.objcet.forEach(obj => obj.draw(ctx));
    }
    setBarrier(column, state) {
        if(state) {
            if(this.element.block.every(e => e!=column)) {
                this.element.block.push(column);
            }
        }else {
            this.element.block = this.element.block.filter(e => e != column);
        }
    }
    #addTank(n) {
        for(let i = 0; i < n; i++) {
            this.objcet.push(new Tank({
                element: this.element,
                summonColumn: this.summonColumn,
                Column: i
            }));
        }
        if(Math.random() < 0.2) {
            this.objcet.push(new BUN({
                element: this.element,
                summonColumn: this.summonColumn
            }));
        }
    }
    #addPlayer() {
        this.objcet.push(new Player(this.element));
        this.objcet.push(new Boss(this.element));
    }
}
class Boss_Bar {
    constructor(config) {
        this.Max = config.Boss_Hp_max;
    }
    draw(data) {
        data.ctx.clearRect(0, 0, 300, 150)
        data.ctx.fillStyle = "rgba(80, 80, 80)"
        data.ctx.fillRect(0, 0, 300, 70)

        data.ctx.fillStyle = "rgba(250, 0, 0)"
        data.ctx.fillRect(0, 0, data.value*(300/this.Max), 150)
        data.ctx.fillStyle = "rgba(180, 0, 0)"
        data.ctx.fillRect(0, 0, data.value*(300/this.Max), 70)
    }
}


class Item {
    constructor(config) {
        this.canvas_width = config.element.canvas_width;
        this.canvas_height = config.element.canvas_height;
        this.img_width = this.img_height = utils.unit(1);
    }
    updata() {
    }
    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y, this.img_width, this.img_height);
    }
}
class Tank extends Item {
    constructor(config) {
        super(config);
        this.img = new Image();
        this.img.src = "img/tank.png";
        
        this.x = utils.unit(config.summonColumn[config.Column]);
        this.y = utils.unit(1.25);

        this.speed = Math.random()*0.04 + 0.06;
        this.go_attack = 0;
        this.DeletItem = false;
        this.barrier = false;
        this.touchable = false;
    }
    updata(data) {
        if(this.go_attack > 10*data.deltaTime) {
            this.y += this.speed*data.deltaTime;
        }else {
            this.go_attack += data.deltaTime ;
        }
        if(this.y + 0.3*this.img_height> this.canvas_height) {
            this.DeletItem = true;
        }

        if(this.y + 1.3*this.img_height > this.canvas_height) {
            this.barrier = true;
        }

        data.partical.push(new Partical(this.x, this.y))
    }
}
class Player extends Item {
    constructor(config) {
        super(config);
        this.img = new Image();
        this.img.src = "img/player.png";

        this.x = utils.unit(Math.floor(Math.random()* (utils.divisor(config.canvas_width))));
        this.y = config.canvas_height - this.img_height; 

        this.moving_to_next_point = 0;
        this.move_speed = 5;
        this.dir_updata = {
            "Left": -1,
            "Right": 1
        };
        this.dir = 0;
    }
    updata(data) {
        const change = this.dir_updata[data.KeyData];
        if(this.moving_to_next_point === 0 && change) {
            this.dir = change;
            if (!data.Barrier.some(e => e === this.x + this.dir*utils.unit(1))) {
                this.moving_to_next_point = utils.unit(1);
            }
        }else if (this.moving_to_next_point > 0){
                this.x += this.dir*this.move_speed;
                this.moving_to_next_point -= this.move_speed;
        }
    }

    get Palyer_in_column() {
        return Math.floor(utils.divisor(this.x));
    }
}
class BUN extends Item {
    constructor(config) {
        super(config);
        this.img = new Image();
        this.img.src = "img/attack.png";
        
        this.x = utils.unit(config.summonColumn[6]);
        this.y = utils.unit(1.25);

        this.speed = Math.random()*0.04 + 0.08;
        this.go_attack = 0;
        this.DeletItem = false;
        this.barrier = false;
        this.touchable = true;
    }
    updata(data) {
        if(this.go_attack > 10*data.deltaTime) {
            this.y += this.speed*data.deltaTime;
        }else {
            this.go_attack += data.deltaTime ;
        }
        if(this.y + 0.3*this.img_height> this.canvas_height) {
            this.DeletItem = true;
        }

        if(this.y + 1.3*this.img_height > this.canvas_height) {
            this.barrier = true;
        }
    }
}
class Boss extends Item {
    constructor(config) {
        super(config);
        this.img = new Image();
        this.img.src = "img/Boss.png";

        this.img_height = 100;
        this.img_width = 100;
        this.x = (config.canvas_width-this.img_width)/2;
        this.y = 5;
    }
    updata(data) {
        let damage = data.damage;
        if (damage > 700) {
            this.img.src = "img/Boss_3.png"
        }else if (damage > 500) {
            this.img.src = "img/Boss_2.png"
        }else if (damage > 200) {
            this.img.src = "img/Boss_1.png"
        }
    }
}

class Partical {
    constructor(x, y) {
        this.x = x + utils.unit(0.5);
        this.y = y + utils.unit(8/10);
        this.size = Math.random() *5 + 5;
        this.color = "rgba(50, 50, 50, 0.3)";
        this.radius = Math.random() * this.size/10;
        this.radius_max = Math.random()* 23;
        
        this.speed = Math.random();
        
        this.DeletItem = false;
    }
    updata() {
        this.y -= this.speed;
        if(Math.random() < 0.5) {
            this.x += Math.random()*2;
        }else {
            this.x -= Math.random()*2;
        }
        this.radius += 0.8;
        if (this.radius > this.radius_max) {
            this.DeletItem = true
        }
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.fill();
    }
}

class KeyInput {
    constructor() {
        this.heldKey_Button = [];
        this.data = {
            "KeyA": "Left",
            "KeyD": "Right",
            "ArrowLeft": "Left",
            "ArrowRight": "Right",
        };
    }
    get keyInput_data() {
        return this.heldKey_Button[0];
    }

    init() {
        document.addEventListener("keydown", e => {
            const key = this.data[e.code];
            if(key && this.heldKey_Button.indexOf(key) === -1) {
                this.heldKey_Button.unshift(key);
            }
        });
        document.addEventListener("keyup", e => {
            const key = this.data[e.code];
            const index = this.heldKey_Button.indexOf(key);
            if(index > -1) {
                this.heldKey_Button.splice(index, 1);
            }
        });
    }
}

const utils = {
    unit(n) {
        return n*50;
    },
    divisor(n) {
        return n/50;
    }
};