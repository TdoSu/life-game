const readline = require('readline')
const ansiEscapes = require('ansi-escapes')
const log = console.log.bind(console)

const { cells1 } = require('./cells1.js')

const range = (start, end, step = 1) => {
    if (start > end) {
        return []
    } else {
        return [start]
            .concat(range(start + step, end, step))
    }
}

const draw = (str, hide=true, clear=true) => {
    const esc = ansiEscapes
    if (clear) {  
        log(esc.clearTerminal)
    }
    log(str)
    log(hide ? esc.cursorHide : esc.cursorShow)
}  

const generateRandomCellsLine = (n, p = 0.1) =>
    range(1, n).map(
        _ => Math.random() < p ? 1 : 0
    )

const generateCells = (n, p) =>
    range(1, n).map(_ => generateRandomCellsLine(n, p))

const currentIsLife = (cells, x, y) =>
    Boolean(cells[x] && cells[x][y])

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
        .filter(
            ([x1, y1]) => currentIsLife(cells, x1, y1)
        )
        .length
}

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

const main = () => {
    let cells = generateCells(30, 0.1)
    cells = cells1
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
}

main()

