const FPS = 60;
const FPS_INTERVAL = FPS / 1000;
const PIXEL_PER_GRAM = 3;
const NORMAL_PIXEL_PER_SECOND = 1;

var canvas = document.getElementById("canv");
var canv = canvas.getContext("2d");

var impulse_item = document.getElementById("impulse");

const BORDERS = true;

if(BORDERS) {
    const X_MIN = 0;
    const X_MAX = canvas.width;
    const Y_MIN = 0;
    const Y_MAX = canvas.height;
} else {
    const X_MIN = -Math.INFINITY;
    const Y_MIN = -Math.INFINITY;
    const X_MAX = Math.INFINITY;
    const Y_MAX = Math.INFINITY;
}
var animationActive = true;

var start = 0;
var now = Date.now();
var then = now - FPS_INTERVAL - 1;
var delta = 0;

var objectPool = [];

objectPool.push(new object(100, 200, 50, 100));
//objectPool.push(new object(0, 100, 290, 100));
objectPool.push(new object(0, 200, 250, 100));

function drawCircle(x, y, radius) {
    canv.beginPath();
    canv.arc(x, y, radius, 0, 2 * Math.PI, false);
    canv.fillStyle = 'white';
    canv.fill();
    canv.stroke();
}

function clearCanvas() {
    canv.fillStyle = "black";
    canv.fillRect(0,0,500,250);
}       

function object(velocityX, mass, x, y) {
    this.velocityX = velocityX;
    this.mass = mass;
    this.x = x;
    this.y = y;
    this.radius = PIXEL_PER_GRAM*Math.sqrt(mass/Math.PI);
    this.draw = function() {
        drawCircle(this.x, this.y, this.radius);
    }
    this.update = function(delta) {
        if(this.nextX()+this.radius >= X_MAX || this.nextX()-this.radius <= X_MIN) {
            this.velocityX = -this.velocityX;
        }
        objectPool.forEach(obj => {
            if(this.colliding(obj)) {
                this.collide(obj);
            }
        });
        this.x = this.nextX();
    }
    this.nextX = function() {
        return this.x + this.velocityX * NORMAL_PIXEL_PER_SECOND * (delta / 1000);
    }
    this.colliding = function(obj) {
        //var distance = Math.sqrt(Math.abs(this.x - obj.x) ** 2 + Math.abs(this.y - obj.y) ** 2)
        distance = Math.abs(this.nextX() - obj.nextX());
        colliding = distance <= this.radius + obj.radius && distance != 0;
        return(colliding);
    } 
    this.collide = function(obj) {
        v = this.velocityX;
        this.velocityX = (2 * obj.mass * obj.velocityX + (this.mass - obj.mass) * this.velocityX) / (this.mass + obj.mass);
        obj.velocityX = (2 * this.mass * v + (obj.mass - this.mass) * v) / (this.mass + obj.mass);
        //console.log("collision at t = " + (start - now))
    }
}

var impulse_sum = 0;

function animation() {
    now = Date.now();
    delta = now-then;

    impulse_sum = 0

    if(delta > FPS_INTERVAL) {
        clearCanvas();
        objectPool.forEach(obj => {
            obj.update(delta);
            obj.draw();
            impulse_sum += obj.mass * Math.abs(obj.velocityX)
        });
        then = now; 
    }

    impulse_item.innerText = impulse_sum;

    if (animationActive) {
        requestAnimationFrame(animation);
    }
}

start = Date.now()

animation();