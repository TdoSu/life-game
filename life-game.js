const readline = require('readline')
const ansiEscapes = require('ansi-escapes')
const log = console.log.bind(console)

const { cells1 } = require('./cells1.js')

const draw = (str, hide=true, clear=true) => {
    const esc = ansiEscapes
    if (clear) {  
        log(esc.clearTerminal)
    }
    log(str)
    log(hide ? esc.cursorHide : esc.cursorShow)
}  

const generateRandomCellsLine =
    (countOfCellsInLine, probabilityForLive = 0.1) => {
    return new Array(countOfCellsInLine).fill(0)
        .map(_ => Math.random() < probabilityForLive ? 1 : 0)
}

const generateCells = (countOfCellsInLine, probabilityForLive) => {
    return new Array(countOfCellsInLine).fill(0)
        .map(_ => generateRandomCellsLine(countOfCellsInLine, probabilityForLive))
}

const currentIsLife = (cells, x, y) => {
    return Boolean(cells[x] && cells[x][y])
}

const countOfLiveNeighbours = (cells, x, y) => {
    const neighbours = [
        [ x - 1, y - 1 ],
        [ x - 1, y ],
        [ x - 1, y + 1 ],
        [ x, y - 1 ],
        [ x, y + 1 ],
        [ x + 1, y - 1 ],
        [ x + 1, y ],
        [ x + 1, y + 1 ],
    ]
    return neighbours
        .filter(([x1, y1]) => currentIsLife(cells, x1, y1))
        .length
}

// const cs = generateCells(10, 0.2)
// console.log(
//     countOfLiveNeighbours(
//         cs,
//         2,
//         4,
//     )
// )
// console.log(cs)

/** 根据当前细胞 x y 判断下一个状态它是否还活着 */
const nextIsLife = (cells, x, y) => {
    const count = countOfLiveNeighbours(cells, x, y)
    if (count === 3) {
        return 1
    } else if (count === 2) {
        return currentIsLife(cells, x, y) ? 1 : 0
    } else {
        return 0
    }
}

const cells2 = [    [0, 0, 1, 0, 0, 0, 0, 0, 0, 0],    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0],    [0, 1, 1, 0, 0, 0, 0, 0, 0, 0],    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],]


let cells = generateCells(30, 0.1)
cells = cells1
// cells = cells2

const update = () => {
    const old = JSON.parse(JSON.stringify(cells))
    for (let x = 0; x < cells.length; x++) {
        const line = cells[x]
        for (let y = 0; y < line.length; y++) {
            cells[x][y] = nextIsLife(old, x, y)
        }
    }
}

let symbol = 'o '
symbol = '🌕 '

const showCells = cells => cells
    .map(line => {
        return line.map(c => c ? symbol : ' ').join('')
    })
    .join('\n')

setInterval(() => {
    draw(showCells(cells))
    update()
}, 1000/20)
