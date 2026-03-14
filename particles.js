const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const SPACING = 8
const COLS = Math.floor(window.innerWidth / SPACING)
const ROWS = Math.floor(window.innerHeight / SPACING)

const THICKNESS = 5000
const DRAG = 0.95
const EASE = 0.15

let particles = []

let mouse = {x:0,y:0}

for(let i=0;i<ROWS*COLS;i++){

let x = (i % COLS) * SPACING
let y = Math.floor(i/COLS) * SPACING

particles.push({
x:x,
y:y,
ox:x,
oy:y,
vx:0,
vy:0,
alpha:0
})

}

window.addEventListener("mousemove",(e)=>{

mouse.x = e.clientX
mouse.y = e.clientY

})

function animate(){

ctx.clearRect(0,0,canvas.width,canvas.height)

particles.forEach(p=>{

let dx = mouse.x - p.x
let dy = mouse.y - p.y

let dist = dx*dx + dy*dy

if(dist < THICKNESS){

let angle = Math.atan2(dy,dx)

p.vx += -Math.cos(angle)
p.vy += -Math.sin(angle)

p.alpha = 1

}

p.x += (p.vx *= DRAG) + (p.ox - p.x) * EASE
p.y += (p.vy *= DRAG) + (p.oy - p.y) * EASE

p.alpha *= 0.96

ctx.fillStyle = "rgba(56,189,248,"+(p.alpha+0.2)+")"
ctx.fillRect(p.x,p.y,2,2)

})

requestAnimationFrame(animate)

}

animate()

window.addEventListener("resize",()=>{

canvas.width = window.innerWidth
canvas.height = window.innerHeight

})