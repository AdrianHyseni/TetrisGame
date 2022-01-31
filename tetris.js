const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(20, 20);

const  arenaSweep = ()=>{
    let rowCount = 1;
    outer: for (let y = arena.length -1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        user.score += rowCount * 10;
        rowCount *= 2;
    }
}


const  collide = (arena, user)=> {
    const m = user.matrix;
    const o = user.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

const createMatrix = (w, h) => {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}


const choosePiece =(type)=>
{
    if (type === 'I') {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === 'L') {
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
    } else if (type === 'J') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if (type === 'O') {
        return [
            [4, 4],
            [4, 4],
        ];
    } else if (type === 'Z') {
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'T') {
        return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    }
}


const drawBlock = (matrix, offset) => {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x,
                                 y + offset.y,
                                 1, 1);
            }
        });
    });
}


const draw = ()=> {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawBlock(arena, {x: 0, y: 0});
    drawBlock(user.matrix, user.pos);
}


function merge(arena, user) {
    user.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + user.pos.y][x + user.pos.x] = value;
            }
        });
    });
}

const rotate = (matrix, dir)=> {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

const userDrop = ()=> {
    user.pos.y++;
    if (collide(arena, user)) {
        user.pos.y--;
        merge(arena, user);
        userReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

const userMove = (offset)=> {
    user.pos.x += offset;
    if (collide(arena, user)) {
        user.pos.x -= offset;
    }
}

const userReset = ()=> {
    const pieces = 'TJLOSZI';
    user.matrix = choosePiece(pieces[pieces.length * Math.random() | 0]);
    user.pos.y = 0;
    user.pos.x = (arena[0].length / 2 | 0) -
                   (user.matrix[0].length / 2 | 0);
    if (collide(arena, user)) {
        arena.forEach(row => row.fill(0));
        user.score = 0;
        updateScore();
    }
}

const userRotate = (dir)=> {
    const pos = user.pos.x;
    let offset = 1;
    rotate(user.matrix, dir);
    while (collide(arena, user)) {
        user.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > user.matrix[0].length) {
            rotate(user.matrix, -dir);
            user.pos.x = pos;
            return;
        }
    }
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        userDrop();
    }

    lastTime = time;

    draw();
    requestAnimationFrame(update);
}

function updateScore() {
    document.getElementById('score').innerText = user.score;
}

document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        userMove(-1);
    } else if (event.keyCode === 39) {
        userMove(1);
    } else if (event.keyCode === 40) {
        userDrop();
    } else if (event.keyCode === 81) {
        userRotate(-1);
    } else if (event.keyCode === 87) {
        userRotate(1);
    }
});

const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

const arena = createMatrix(12, 20);

const user = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
};

userReset();
updateScore();
update();