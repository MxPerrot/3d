const WIDTH = 800
const HEIGHT = 800
const BACKGROUND = "black"
const FOREGROUND = "red"
const FPS = 30

canvas.width = WIDTH
canvas.height = HEIGHT

const ctx = canvas.getContext("2d")


class Vertex {
    constructor({x,y,z}) {
        this.x = x
        this.y = y
        this.z = z
    }

    translate(dx=0,dy=0,dz=0) {
        // Keep compatibility with calls like translate(dz)
        if (arguments.length === 1) { dz = dx; dx = 0 }
        return new Vertex({
            x: this.x + dx,
            y: this.y + dy,
            z: this.z + dz,
        })
    }

    rotate_yz(angle) {
        const c = Math.cos(angle)
        const s = Math.sin(angle)
        return new Vertex({
            x: this.x,
            y: this.y*c - this.z*s,
            z: this.y*s + this.z*c,
        })
    }


    rotate_xz(angle) {
        const c = Math.cos(angle)
        const s = Math.sin(angle)
        return new Vertex({
            x: this.x*c - this.z*s,
            y: this.y,
            z: this.x*s + this.z*c,
        })
    }


    rotate_xy(angle) {
        const c = Math.cos(angle)
        const s = Math.sin(angle)
        return new Vertex({
            x: this.x*c - this.y*s,
            y: this.x*s + this.y*c,
            z: this.z,
        })
    }

    rotate(ax = 0, ay = 0, az = 0) {
        const cx = Math.cos(ax), sx = Math.sin(ax);
        const cy = Math.cos(ay), sy = Math.sin(ay);
        const cz = Math.cos(az), sz = Math.sin(az);


        let x = this.x, y = this.y, z = this.z;

        {
            const y1 = y * cx - z * sx;
            const z1 = y * sx + z * cx;
            y = y1; z = z1;
        }

        {
            const x1 = x * cy - z * sy;
            const z1 = x * sy + z * cy;
            x = x1; z = z1;
        }

        {
            const x1 = x * cz - y * sz;
            const y1 = x * sz + y * cz;
            x = x1; y = y1;
        }

        return new Vertex({ x, y, z });
    }



    // Mutable/in-place variants: mutate this and return this (zero allocations)
    translateSelf(dx=0,dy=0,dz=0) {
        if (arguments.length === 1) { dz = dx; dx = 0 }
        this.x += dx
        this.y += dy
        this.z += dz
        return this
    }

    rotate_yzSelf(angle) {
        const c = Math.cos(angle)
        const s = Math.sin(angle)
        const y = this.y*c - this.z*s
        const z = this.y*s + this.z*c
        this.y = y
        this.z = z
        return this
    }

    rotate_xzSelf(angle) {
        const c = Math.cos(angle)
        const s = Math.sin(angle)
        const x = this.x*c - this.z*s
        const z = this.x*s + this.z*c
        this.x = x
        this.z = z
        return this
    }

    rotate_xySelf(angle) {
        const c = Math.cos(angle)
        const s = Math.sin(angle)
        const x = this.x*c - this.y*s
        const y = this.x*s + this.y*c
        this.x = x
        this.y = y
        return this
    }

    project() {
        return {
            x: this.x/this.z,
            y: this.y/this.z,
        }
    }

    clone() { return new Vertex({x: this.x, y: this.y, z: this.z}) }
}

class Object {
    constructor(vertices, faces) {
        this.vertices = vertices
        this.faces = faces
    }
    render(dz, angle) {
        const verts = this.vertices

        for (const face of this.faces) {
            for (let i = 0; i < face.length; i++) {
                const a = verts[face[i]]
                const b = verts[face[(i + 1) % face.length]]
                const pa = screenify(a.translate(0,0,dz).project())
                const pb = screenify(b.translate(0,0,dz).project())
                line(pa, pb)
            }
        }
    }
}

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

function line(p1, p2) {
    ctx.lineWidth = 3
    ctx.strokeStyle = FOREGROUND
    ctx.beginPath()
    ctx.moveTo(p1.x, p1.y)
    ctx.lineTo(p2.x, p2.y)
    ctx.stroke()
}


function screenify({x, y}) {
    return {
        //  -1..1  =>  0..2  =>  0..1  =>  0..w
        x: (x + 1)/ 2 * WIDTH,
        y: (y + 1)/ 2 * HEIGHT,
    }
}

let cube = new Object(
    vertices={
        "v0":new Vertex({x: 0.25,    y: 0.25,     z: 0.25}),
        "v1":new Vertex({x: 0.25,    y: -0.25,    z: 0.25}),
        "v2":new Vertex({x: -0.25,   y: -0.25,    z: 0.25}),
        "v3":new Vertex({x: -0.25,   y: 0.25,     z: 0.25}),
        "v4":new Vertex({x: 0.25,    y: 0.25,     z: -0.25}),
        "v5":new Vertex({x: 0.25,    y: -0.25,    z: -0.25}),
        "v6":new Vertex({x: -0.25,   y: -0.25,    z: -0.25}),
        "v7":new Vertex({x: -0.25,   y: 0.25,     z: -0.25}),
    },
    faces=[
        ["v0", "v1", "v2", "v3"],
        ["v4", "v5", "v6", "v7"],
        ["v0", "v4"],
        ["v1", "v5"],
        ["v2", "v6"],
        ["v3", "v7"],
    ]
)

let dz = 1
let angle = 0

function frame() {
    const dt = 1/FPS
    // dz += 1*dt
    angle += Math.PI*dt;
    clear()
    cube.render(dz, angle)
    setTimeout(frame, 1000/FPS) 
}

setTimeout(frame, 1000/FPS)