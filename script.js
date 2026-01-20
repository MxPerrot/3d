const WIDTH = 800
const HEIGHT = 800
const BACKGROUND = "black"
const FOREGROUND = "red"
const FPS = 60

canvas.width = WIDTH
canvas.height = HEIGHT

const ctx = canvas.getContext("2d")


function clear() {
    ctx.fillStyle = BACKGROUND
    ctx.fillRect(0,0,WIDTH,HEIGHT)
}

function point({x,y}) {
    const s = 30
    ctx.fillStyle = FOREGROUND
    ctx.fillRect(
        x-s/2,
        y-s/2,
        s,
        s,
    )
}

function screenify_coords({x, y}) {
    return {
        //  -1..1  =>  0..2  =>  0..1  =>  0..w
        x: (x + 1)/ 2 * WIDTH,
        y: (y + 1)/ 2 * HEIGHT,
    }
}

function project({x,y,z}) {
    return {
        x: x/z,
        y: y/z,
    }
}


function translate_z({x, y, z}, dz) {
    return {
        x,
        y,
        z: z + dz,
    }
}

function rotate_xz({x,y,z},angle) {
    const c = Math.cos(angle)
    const s = Math.sin(angle)
    return {
        x: x*c-z*s,
        y:y,
        z: x*s+z*c,
    }

}

const vs = [
    {x: 0.25,    y: 0.25,     z: 0.25},
    {x: -0.25,   y: 0.25,     z: 0.25},
    {x: 0.25,    y: -0.25,    z: 0.25},
    {x: -0.25,   y: -0.25,    z: 0.25},
    {x: 0.25,    y: 0.25,     z: -0.25},
    {x: -0.25,   y: 0.25,     z: -0.25},
    {x: 0.25,    y: -0.25,    z: -0.25},
    {x: -0.25,   y: -0.25,    z: -0.25},
]

let dz = 1
let angle = 0
function frame() {
    const dt = 1/FPS
    // dz += 1*dt
    angle += Math.PI*dt;
    clear()
    for (const v of vs) {
        point(screenify_coords(project(translate_z(rotate_xz(v, angle), dz)))) 
        // console.log(v, dz)
    }
    setTimeout(frame, 1000/FPS) 
}

setTimeout(frame, 1000/FPS)