import './style.css'

const canvas = document.getElementById('canvas')

const { width, height } = document.body.getBoundingClientRect();

canvas.width = width
canvas.height = height

/**
  * @type {CanvasRenderingContext2D}
  */
const ctx = canvas.getContext('2d')

/**
  * @type {'playing' | 'paused' | 'init'}
  */
let gameState = 'init'
let frame;

const margin = 48;
const gap = 24
const colCount = 8
const rowCount = 5;
const brickHeight = (height - margin * 2 - gap * rowCount - 1) / rowCount / 2;
const brickWidth = (width - margin * 2 - gap * colCount - 1) / colCount;
const paddleWidth = 128;
const paddleHeight = 12;
let paddlePos = (width - paddleWidth) / 2
let ballX = paddlePos + paddleWidth / 2
let ballY = height - margin - paddleHeight - 50

let velX = 5
let velY = 5

/**
  * @typedef {{ col: Number, row: Number, hit: Boolean }} Brick
  */
/**
  * @type {Array<Brick>} 
  */
let bricks = []

let keys = {};

class Brick {
    constructor(col, row, height, width, gap, margin) {
        this.col = col
        this.row = row
        this.height = height
        this.width = width
        this.gap = gap
        this.margin = margin
        this.hit = false

    }

    getRect() {
        return {
            x: this.margin + (this.col - 1) * this.width + (this.col - 1) * this.gap,
            y: this.margin + (this.row - 1) * this.height + (this.row - 1) * this.gap,
            width: this.width,
            height: this.height
        }
    }
}

function initBricks() {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 4; j++) {
            const brick = new Brick(i + 1, j + 1, brickHeight, brickWidth, gap, margin)
            bricks.push(brick)
        }
    }
}

function drawBricks() {
    ctx.fillStyle = 'orange'
    bricks.filter(b => !b.hit).forEach(brick => {
        const { x, y, width, height } = brick.getRect()
        ctx.fillRect(x, y, width, height)
    })
}

function drawPaddle() {
    ctx.fillStyle = 'green';
    let y = height - margin;
    ctx.fillRect(paddlePos, y, paddleWidth, paddleHeight)
}

function movePaddle() {
    if (keys['left']) {
        paddlePos -= 15
    }
    if (keys['right']) {
        paddlePos += 15
    }
    if (paddlePos < 0) {
        paddlePos = 0
    }
    if (paddlePos > width - paddleWidth) {
        paddlePos = width - paddleWidth
    }
}

function drawBall() {
    ctx.fillStyle = 'black'
    ctx.beginPath()
    ctx.arc(ballX, ballY, 10, 0, Math.PI * 2)
    ctx.fill()
}

function moveBall() {
    ballX += velX
    ballY += velY
    // detect collisions with walls
    if (ballY - 10 <= 0 || ballY + 10 >= height) {
        velY *= -1
        console.log('game over')
    }
    if (ballX - 10 < 0 || ballX + 10 > width) {
        velX *= -1
    }
    // detect collisions with paddle
    const paddleRight = paddlePos + paddleWidth;
    const paddleLeft = paddlePos
    if ((ballX - 10) >= (paddleLeft) && (ballX + 10) <= (paddleRight)) {
        if (ballY + 10 >= height - margin - paddleHeight) {
            // sometimes if the ball barely collides with paddle, it will bounce along the perimeter of the paddle
            // lets just force an upward velocity after colliding
            //velY *= -1
            velY = Math.abs(velY) * -1
        }

    }
    // detect collision with bricks
    bricks.filter(b => !b.hit).forEach(brick => {
        const { x, y, width, height } = brick.getRect();
        if (ballY - 10 < y + height && ballY + 10 > y) {
            if (ballX - 10 < x + width && ballX + 10 > x) {
                velY *= -1
                brick.hit = true
            }
        }
    })
}

function pause() {
    gameState = 'paused'
}

function start() {
    gameState = 'playing'
    loop()
}

function loop() {
    if (gameState === 'init') {
        initBricks();
    }
    if (gameState === 'playing') {
        ctx.clearRect(0, 0, width, height)
        // game loop
        drawBricks()
        movePaddle()
        drawPaddle()
        moveBall()
        drawBall()
        frame = window.requestAnimationFrame(loop)
    } else if (gameState === 'paused') {
        // cleanup
        window.cancelAnimationFrame(frame)
    }
}

loop()

window.addEventListener('keyup', (e) => {
    if (e.key === 'p') {
        pause();
    } else if (e.key === ' ' && gameState !== 'playing') {
        start();
    }

    if (e.key === 'ArrowLeft') {
        keys['left'] = false;
    }
    if (e.key === 'ArrowRight') {
        keys['right'] = false
    }
})

window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        keys['left'] = true;
    }
    if (e.key === 'ArrowRight') {
        keys['right'] = true
    }
})

