// This game shell was happily copied from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();


function Timer() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function () {
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;

    var gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    return gameDelta;
}

function GameEngine() {
    this.entities = [];
    this.showOutlines = false;
    this.map = [];
    for(var i = 0; i < 80; i++) {
        this.map[i] = [];
    }
    for(var x = 0; x < 80; x++) {
        for(var z = 0; z < 80; z++) {
            this.map[x][z] = 0;
        }
    }
    this.ctx = null;
    this.click = null;
    this.mouse = null;
    this.wheel = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
}

GameEngine.prototype.resetMap = function() {
    for(var i = 0; i < 80; i++) {
        this.map[i] = [];
    }
    for(var x = 0; x < 80; x++) {
        for(var z = 0; z < 80; z++) {
            this.map[x][z] = 0;
        }
    }
}

GameEngine.prototype.init = function (ctx) {
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.startInput();
    this.timer = new Timer();
    console.log('game initialized');
}

GameEngine.prototype.start = function () {
    console.log("starting game");
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
}

GameEngine.prototype.startInput = function () {
    console.log('Starting input');
    var that = this;

    this.ctx.canvas.addEventListener("keydown", function (e) {
        if (String.fromCharCode(e.which) === ' ') that.space = true;
//        console.log(e);
        e.preventDefault();
    }, false);

    console.log('Input started');
}

GameEngine.prototype.addEntity = function (entity) {
    this.entities.push(entity);
}

GameEngine.prototype.draw = function () {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.save();
    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].draw(this.ctx);
    }
    this.ctx.restore();
}

GameEngine.prototype.update = function () {
    var entitiesCount = this.entities.length;

    for (var i = 0; i < entitiesCount; i++) {
        var entity = this.entities[i];

        if (!entity.removeFromWorld) {
            entity.update();
        }
    }

    for (var i = this.entities.length - 1; i >= 0; --i) {
        if (this.entities[i].removeFromWorld) {
            this.entities.splice(i, 1);
        }
    }
}

GameEngine.prototype.loop = function () {
    this.clockTick = this.timer.tick();
    this.update();
    this.draw();
    this.space = null;
}
GameEngine.prototype.findT = function(currentX, currentY, type) {
    var distance = 10000;
    var action = null;
    for(var x = currentX - 9; x <= currentX + 9; x++) {
        for(var y = currentY - 9; y <= currentY + 9; y++) {
            if(x > -1 && x < 80 && y > -1 && y < 80 && this.map[x][y] != null && this.map[x][y].type == type) {
                if(currentX == x && currentY == y) {

                }
                else {
                    dis = Math.abs(currentX - x) + Math.abs(currentY - y);
                    if(dis < distance) {
                        action = {x: x, y: y};
                        distance = dis;
                    }
                }
            }
        }
    }
    return action;
}
GameEngine.prototype.shouldMove = function(entity, desiredEntity) {
    if(entity.x > desiredEntity.x && entity.y > desiredEntity.y) {
        return {first:3, second:4};
    }
    else if(entity.x > desiredEntity.x && entity.y < desiredEntity.y) {
        return {first:3, second:2};
    }
    else if(desiredEntity.x > entity.x && entity.y > desiredEntity.y) {
        return {first:1, second:4};
    }
    else if(desiredEntity.x > entity.x && desiredEntity.y > entity.y) {
        return {first:1, second:2};
    }
    else if(entity.x > desiredEntity.x) {
        return {first:3, second:3};
    }
    else if(desiredEntity.x > entity.x) {
        return {first:1, second:1};
    }
    else if(entity.y > desiredEntity.y) {
        return {first:4, second:4};
    }
    else if(desiredEntity.y > entity.y) {
        return {first:2, second:2};
    }
}

GameEngine.prototype.getDirection  = function (currentX, currentY, direction) {
    if(direction == 1) {
        if(currentX + 1 < 80) {
            return this.map[currentX + 1][currentY];
        }
    }
    else if(direction == 3) {
        if(currentX - 1 > -1 && this.map[currentX - 1][currentY] != null) {
            return this.map[currentX - 1][currentY];
        }
    }
    else if(direction == 2) {
        if(currentY + 1 < 80 && this.map[currentX][currentY + 1] != null) {
            return this.map[currentX][currentY + 1];
        }
    } 
    else if(direction == 4) {
        if(currentY - 1 > -1 && this.map[currentX][currentY - 1] != null) {
            return this.map[currentX][currentY - 1];
        } 
    }
    return null;
}

GameEngine.prototype.canMoveDirection = function (currentX, currentY, direction) {

    if(direction == 1) {
        if(currentX + 1 <80 && this.map[currentX + 1][currentY] == 0) {
            return true
        }
    }
    else if(direction == 3) {
        if(currentX - 1 > -1 && this.map[currentX - 1][currentY] == 0) {
            return true
        }
    }
    else if(direction == 2) {
        if(currentY + 1 <80 && this.map[currentX][currentY + 1] == 0) {
            return true
        }
    } 
    else if(direction == 4) {
        if(currentY - 1 > -1 && this.map[currentX][currentY - 1] == 0) {
            return true
        }  
    }

    return false;
}

GameEngine.prototype.moveDirection = function (currentX, currentY, direction, obj) {
    if(direction == 1) {
        if(this.map[currentX + 1][currentY] != null) {
            obj.x += 10;
            this.map[currentX][currentY] = 0;
            this.map[currentX + 1][currentY] = obj;
        }
    }
    else if(direction == 3) {
        if(this.map[currentX - 1][currentY] != null) {
            obj.x -= 10;
            this.map[currentX][currentY] = 0;
            this.map[currentX - 1][currentY] = obj;
        }
    }
    else if(direction == 2) {
        if(this.map[currentX][currentY + 1] != null) {
            obj.y += 10;
            this.map[currentX][currentY] = 0;
            this.map[currentX][currentY + 1] = obj;
        }
    } 
    else if(direction == 4) {
        if(this.map[currentX][currentY - 1] != null) {
            obj.y -= 10;
            this.map[currentX][currentY] = 0;
            this.map[currentX][currentY - 1] = obj;
        }  
    }
    return false;
}

function Entity(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.removeFromWorld = false;
}

Entity.prototype.update = function () { 
}

Entity.prototype.draw = function (ctx) {
    if (this.game.showOutlines && this.radius) {
        this.game.ctx.beginPath();
        this.game.ctx.strokeStyle = "green";
        this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.game.ctx.stroke();
        this.game.ctx.closePath();
    }
}

Entity.prototype.rotateAndCache = function (image, angle) {
    var offscreenCanvas = document.createElement('canvas');
    var size = Math.max(image.width, image.height);
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;
    var offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.save();
    offscreenCtx.translate(size / 2, size / 2);
    offscreenCtx.rotate(angle);
    offscreenCtx.translate(0, 0);
    offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
    offscreenCtx.restore();
    //offscreenCtx.strokeStyle = "red";
    //offscreenCtx.strokeRect(0,0,size,size);
    return offscreenCanvas;
}

