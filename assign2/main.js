window.onload = function () {
    var socket = io.connect("http://24.16.255.56:8888");
  
    socket.on("load", function (data) {
        console.log(data);
        loadAll(data.data, gameE);
    });
  
    var text = document.getElementById("text");
    var saveButton = document.getElementById("save");
    var loadButton = document.getElementById("load");
  
    saveButton.onclick = function () {
      console.log("save");
      text.innerHTML = "Saved."
      socket.emit("save", { studentname: "Sean Smith", statename: "simulationState", data: saveAll(gameE.entities) });
    };
  
    loadButton.onclick = function () {
      console.log("load");
      text.innerHTML = "Loaded."
      socket.emit("load", { studentname: "Sean Smith", statename: "simulationState" });
    };
  
  };
  
var gameE = new GameEngine();

function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function Background(game) {
    Entity.call(this, game, 0, 400);
    this.radius = 200;
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
}

Background.prototype.draw = function (ctx) {
    ctx.fillStyle = "SaddleBrown";
    ctx.fillRect(0,500,800,300);
    Entity.prototype.draw.call(this);
}

function Unicorn(game) {
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/RobotUnicorn.png"), 0, 0, 206, 110, 0.02, 30, true, true);
    this.jumpAnimation = new Animation(ASSET_MANAGER.getAsset("./img/RobotUnicorn.png"), 618, 334, 174, 138, 0.02, 40, false, true);
    this.jumping = false;
    this.radius = 100;
    this.ground = 400;
    Entity.call(this, game, 0, 400);
}

Unicorn.prototype = new Entity();
Unicorn.prototype.constructor = Unicorn;

Unicorn.prototype.update = function () {
    if (this.game.space) this.jumping = true;
    if (this.jumping) {
        if (this.jumpAnimation.isDone()) {
            this.jumpAnimation.elapsedTime = 0;
            this.jumping = false;
        }
        var jumpDistance = this.jumpAnimation.elapsedTime / this.jumpAnimation.totalTime;
        var totalHeight = 200;

        if (jumpDistance > 0.5)
            jumpDistance = 1 - jumpDistance;

        //var height = jumpDistance * 2 * totalHeight;
        var height = totalHeight*(-4 * (jumpDistance * jumpDistance - jumpDistance));
        this.y = this.ground - height;
    }
    Entity.prototype.update.call(this);
}

Unicorn.prototype.draw = function (ctx) {
    if (this.jumping) {
        this.jumpAnimation.drawFrame(this.game.clockTick, ctx, this.x + 17, this.y - 34);
    }
    else {
        this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    Entity.prototype.draw.call(this);
}

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/RobotUnicorn.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = gameE;
    var bg = new Background(gameEngine);
    var unicorn = new Unicorn(gameEngine);
    var plant = new Plant(gameEngine, 100, 100, .1, 0);

	for(let i = 0; i < 150; i++) {
        let x = Math.floor(Math.random() * 80) * 10;
        let y = Math.floor(Math.random() * 80) * 10;
        let r = Math.random() * .05 + .05;
        gameEngine.addEntity(new Plant(gameEngine, x, y, r, 0));
    }

    for(let z = 0; z < 11; z++) {
        let a = Math.floor(Math.random() * 80) * 10;
        let b = Math.floor(Math.random() * 80) * 10;
        gameEngine.addEntity(new Herbivore(gameEngine, a, b, 10, 10, 10, 2, 2));
    }

    for(let v = 0; v < 4; v++) {
        let c = Math.floor(Math.random() * 80) * 10;
        let d = Math.floor(Math.random() * 80) * 10;
        gameEngine.addEntity(new Carnivore(gameEngine, c, d, 10, 10, 10, 3, 2));
    }


    // gameEngine.addEntity(new Plant(gameEngine, 500, 500, .1, 0));
    // gameEngine.addEntity(new Plant(gameEngine, 300, 300, .1, 0));
    // gameEngine.addEntity(new Plant(gameEngine, 200, 400, .1, 0));
    // gameEngine.addEntity(new Plant(gameEngine, 300, 300, .1, 0));
    // gameEngine.addEntity(new Plant(gameEngine, 300, 500, .1, 0));
    // // gameEngine.addEntity(new Plant(gameEngine, 300, 300, .1, 0));
    // gameEngine.addEntity(new Herbivore(gameEngine, 200, 200, 2));
    // gameEngine.addEntity(new Herbivore(gameEngine, 310, 310, 2));
    // gameEngine.addEntity(plant);

    gameEngine.init(ctx);
    gameEngine.start();
});

function Carnivore(game, myX, myY, lastmove, lasteat, lastspawn, food, foodrate) {
    this.type = 3;
    this.requiredFood = foodrate;
    this.timeSinceLastMove = lastmove;
    this.timeSinceLastEaten = lasteat;
    this.timeSinceSpawn = lastspawn;
    this.food = food;
    this.json = saveAll(game.entities);
    Entity.call(this, game, myX, myY);
    this.game.map[this.x / 10][this.y / 10] = this;
}

Carnivore.prototype = new Entity();
Carnivore.prototype.constructor = Carnivore;

Carnivore.prototype.update = function () {
    this.timeSinceLastMove += this.game.clockTick;
    this.timeSinceSpawn += this.game.clockTick;
    this.timeSinceLastEaten += this.game.clockTick;
    if(this.timeSinceLastMove > .03) {
        if(this.food < 3) {
            var herbivore = this.game.findT(this.x / 10, this.y / 10, 2);
            if(herbivore != null) {
                var direction = this.game.shouldMove({x: this.x / 10, y:this.y / 10}, herbivore);
                var entity = this.game.getDirection(this.x / 10, this.y / 10, direction.first);
                if(entity && entity.type == 2) {
                    this.food++;
                    entity.removeFromWorld = true;
                    this.game.moveDirection(this.x / 10, this.y / 10, direction.first, this);
                }
                else if(entity == 0) {
                    this.game.moveDirection(this.x / 10, this.y / 10, direction.first, this);
                }
            }
            else {
                var go = Math.floor(Math.random() * 4) + 1
                if(this.game.canMoveDirection(this.x / 10, this.y / 10, go)) {
                    this.game.moveDirection(this.x / 10, this.y/ 10, go, this);
                }
            }
        }
        else {
               var go = Math.floor(Math.random() * 4) + 1
               if(this.game.canMoveDirection(this.x / 10, this.y / 10, go)) {
                   this.game.moveDirection(this.x / 10, this.y/ 10, go, this);
               }
        }
        this.timeSinceLastMove = 0;
    }
    if(this.food > 2 && this.timeSinceSpawn > 8 * this.requiredFood) {
        this.spawn();
        this.timeSinceSpawn = 0;
    }
    if(this.timeSinceLastEaten > 4 * this.requiredFood) {
        this.food = this.food - 1;
        this.timeSinceLastEaten = 0;
        if(this.food < 1) {
            this.removeFromWorld = true;
            this.game.map[this.x / 10][this.y / 10] = 0;
        }
    }
}

Carnivore.prototype.spawn = function() {
    var eatRate = this.requiredFood + Math.random() * .11 - .05;
    while(eatRate <= 0 && eatRate > 5) {
        eatRate = this.requiredFood + Math.random() * .11 - .05;
    }

    if(this.game.canMoveDirection(this.x / 10, this.y / 10, 1)) {
        this.game.addEntity(new Carnivore(this.game, this.x + 10, this.y, 10, 10, 10, 3, eatRate));
    }
    else if(this.game.canMoveDirection(this.x / 10, this.y / 10, 2)) {
        this.game.addEntity(new Carnivore(this.game, this.x, this.y + 10, 10, 10, 10, 3, eatRate));
    }
    else if(this.game.canMoveDirection(this.x / 10, this.y / 10, 3)) {
        this.game.addEntity(new Carnivore(this.game, this.x - 10, this.y, 10, 10, 10, 3, eatRate));
    }
    else if(this.game.canMoveDirection(this.x / 10, this.y / 10, 4)){
        this.game.addEntity(new Carnivore(this.game, this.x, this.y - 10, 10, 10, 10, 3, eatRate));
    }
}

Carnivore.prototype.draw = function (ctx) {
    ctx.fillStyle = "Chocolate";
    ctx.fillRect(this.x, this.y, 10, 10);
    Entity.prototype.draw.call(this);
}

Carnivore.prototype.objectify = function () {
    return {type: this.type, x: this.x, y:this.y, move:this.timeSinceLastMove, eat:this.timeSinceLastEaten, spawn:this.timeSinceSpawn, food:this.food, reqf:this.requiredFood};
}




function Herbivore(game, myX, myY, lastmove, lasteat, lastspawn, food, foodrate) {
    this.type = 2;
    this.requiredFood = foodrate;
    this.timeSinceLastMove = lastmove;
    this.timeSinceLastEaten = lasteat;
    this.timeSinceSpawn = lastspawn;
    this.food = food;
    Entity.call(this, game, myX, myY);
    this.game.map[this.x / 10][this.y / 10] = this;
}

Herbivore.prototype = new Entity();
Herbivore.prototype.constructor = Herbivore;

Herbivore.prototype.update = function () {
    this.timeSinceLastMove += this.game.clockTick;
    this.timeSinceSpawn += this.game.clockTick;
    this.timeSinceLastEaten += this.game.clockTick;
    if(this.timeSinceLastMove > .1) {
        if(this.food < 7) {
            var plant = this.game.findT(this.x / 10, this.y / 10, 1);
            if(plant != null) {
                var direction = this.game.shouldMove({x: this.x / 10, y:this.y / 10}, plant);
                var entity = this.game.getDirection(this.x / 10, this.y / 10, direction.first);
                if(entity && entity.type == 1) {
                    this.food++;
                    entity.removeFromWorld = true;
                    this.game.moveDirection(this.x / 10, this.y / 10, direction.first, this);
                }
                else if(entity == 0) {
                    this.game.moveDirection(this.x / 10, this.y / 10, direction.first, this);
                }
            }
            else {
                var go = Math.floor(Math.random() * 4) + 1
                if(this.game.canMoveDirection(this.x / 10, this.y / 10, go)) {
                    this.game.moveDirection(this.x / 10, this.y/ 10, go, this);
                }
            }
        }
        else {
               var go = Math.floor(Math.random() * 4) + 1
               if(this.game.canMoveDirection(this.x / 10, this.y / 10, go)) {
                   this.game.moveDirection(this.x / 10, this.y/ 10, go, this);
               }
        }
        this.timeSinceLastMove = 0;
    }
    if(this.food > 4 && this.timeSinceSpawn > 6 * this.requiredFood) {
        this.spawn();
        this.timeSinceSpawn = 0;
    }
    if(this.timeSinceLastEaten > 3 * this.requiredFood) {
        this.food = this.food - 1;
        this.timeSinceLastEaten = 0;
        if(this.food < 1) {
            this.removeFromWorld = true;
            this.game.map[this.x / 10][this.y / 10] = 0;
        }
    }
}

Herbivore.prototype.spawn = function() {
    var eatRate = this.requiredFood + Math.random() * .10 - .05;
    while(eatRate <= 0 && eatRate > 5) {
        eatRate = this.requiredFood + Math.random() * .10 - .05;
    }

    if(this.game.canMoveDirection(this.x / 10, this.y / 10, 1)) {
        this.game.addEntity(new Herbivore(this.game, this.x + 10, this.y, 0, 0, 0, 5, eatRate));
    }
    else if(this.game.canMoveDirection(this.x / 10, this.y / 10, 2)) {
        this.game.addEntity(new Herbivore(this.game, this.x, this.y + 10, 0, 0, 0, 5, eatRate));
    }
    else if(this.game.canMoveDirection(this.x / 10, this.y / 10, 3)) {
        this.game.addEntity(new Herbivore(this.game, this.x - 10, this.y, 0, 0, 0, 5, eatRate));
    }
    else if(this.game.canMoveDirection(this.x / 10, this.y / 10, 4)){
        this.game.addEntity(new Herbivore(this.game, this.x, this.y - 10, 0, 0, 0, 5, eatRate));
    }
}

Herbivore.prototype.draw = function (ctx) {
    ctx.fillStyle = "BlueViolet";
    ctx.fillRect(this.x, this.y, 10, 10);
    Entity.prototype.draw.call(this);
}

Herbivore.prototype.objectify = function () {
    return {type: this.type, x: this.x, y:this.y, move:this.timeSinceLastMove, eat:this.timeSinceLastEaten, spawn:this.timeSinceSpawn, food:this.food, reqf:this.requiredFood};
}

function Plant(game, myX, myY, growSpeed, timeSinceLastGrow) {
    this.type = 1;
    this.growSpeed = growSpeed;
    this.timeSinceLastGrow = timeSinceLastGrow;
    Entity.call(this, game, myX, myY);
    this.game.map[this.x / 10][this.y / 10] = this;
}

Plant.prototype = new Entity();
Plant.prototype.constructor = Plant;

Plant.prototype.update = function () {
    this.game.map[this.x / 10][this.y / 10] = this;
    this.timeSinceLastGrow += this.game.clockTick;
    if(this.timeSinceLastGrow * this.growSpeed > .4) {
        this.timeSinceLastGrow = 0;
        let attemptDirection = Math.floor(Math.random() * 4) + 1;
        if(this.game.canMoveDirection(this.x / 10, this.y / 10, attemptDirection)) {
            this.spawn(attemptDirection);
        } 
        
    }
    Entity.prototype.update.call(this);
}

Plant.prototype.spawn = function(direction) {
    var newGrow = this.growSpeed + Math.random() * .103 - .05;
    while(newGrow <= 0) {
        newGrow = this.growSpeed + Math.random() * .103 - .05;
    }
    
    if(direction == 1) {
        this.game.addEntity(new Plant(this.game, this.x + 10, this.y, newGrow, 0));
    }
    else if(direction == 3) {
        this.game.addEntity(new Plant(this.game, this.x - 10, this.y, newGrow, 0));
    }
    else if(direction == 2) {
        this.game.addEntity(new Plant(this.game, this.x, this.y + 10, newGrow, 0));
    } 
    else if(direction == 4) {
        this.game.addEntity(new Plant(this.game, this.x, this.y - 10, newGrow, 0));
    }
}

Plant.prototype.draw = function (ctx) {
    ctx.fillStyle = "Green";
    ctx.fillRect(this.x, this.y, 10, 10);
    Entity.prototype.draw.call(this);
}

Plant.prototype.objectify = function (ctx) {
    return {type: this.type, x: this.x, y:this.y, growspeed:this.growSpeed, lastgrow:this.timeSinceLastGrow};
}

function saveAll(entityList) {
    var arr = [];
    for(var x = 0; x < entityList.length; x++) {
        arr.push(entityList[x].objectify());
    }
    return JSON.stringify(arr);

}

function loadAll(jsonString, gameEngine) {
    var json = JSON.parse(jsonString);
    for(var y = 0; y < gameEngine.entities.length; y++) {
        var entity = gameEngine.entities[y];
        entity.removeFromWorld = true;
    }
    gameEngine.resetMap();
    for(var z = 0; z < json.length; z++) {
        var ent = json[z];
        if(ent.type == 1) {
            gameEngine.addEntity(new Plant(gameEngine, ent.x, ent.y, ent.growspeed, ent.lastgrow));
        }
        else if(ent.type == 2) {
            gameEngine.addEntity(new Herbivore(gameEngine, ent.x, ent.y, ent.move, ent.eat, ent.spawn, ent.food, ent.reqf))
        }
        else if(ent.type == 3) {
            gameEngine.addEntity(new Carnivore(gameEngine, ent.x, ent.y, ent.move, ent.eat, ent.spawn, ent.food, ent.reqf))
        }
        else {
        }
    }
}