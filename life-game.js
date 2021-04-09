const readline = require('readline')
const ansiEscapes = require('ansi-escapes')
const log = console.log.bind(console)

const { cells1 } = require('./cells1.js')

const copy = o => JSON.parse(JSON.stringify(o))

const beside = (cells1, cells2) => {
    cells1 = copy(cells1)
    cells2 = copy(cells2)
    return cells1.map((line, index) => line.concat(cells2[index]))
}

const below = (cells1, cells2) => {
    cells1 = copy(cells1)
    cells2 = copy(cells2)
    return cells1.concat(cells2)
}

const rotate = (cells) => {
    cells = copy(cells)
    if (cells.length === 0) {
        return []
    } else if (cells.length === 1) {
        return cells[0].map(e => [e])
    } else {
        return beside(rotate(cells.slice(1)), rotate([cells[0]]))
    }
}

const mirrorV = (cells) => {
    cells = copy(cells)
    return cells.map(line => line.reverse())
}

const mirrorP = (cells) => {
    cells = copy(cells)
    return cells.reverse()
}

const cells4 = (cells) => {
    cells = copy(cells)
    const upper = beside(mirrorV(cells), cells)
    const lower = mirrorP(upper)
    return below(upper, lower)
}

const range = (start, end, step = 1) => {
    if (start > end) {
        return []
    } else {
        return [start]
            .concat(range(start + step, end, step))
    }
}

// 在命令行绘制字符串, hide 隐藏光标, clear 清屏
const draw = (str, hide=true, clear=true) => {
    const esc = ansiEscapes
    if (clear) {  
        log(esc.clearTerminal)
    }
    log(str)
    log(hide ? esc.cursorHide : esc.cursorShow)
}  

// 生成 n 个元素的数组, 元素是 0 或 1, 1的概率是 p
const generateRandomCellsLine = (n, p = 0.1) =>
    range(1, n).map(
        _ => Math.random() < p ? 1 : 0
    )

// 生成 n*n 的数组, 元素是 0 或 1, 1 的概率是 p
const generateCells = (n, p) =>
    range(1, n)
        .map(_ => generateRandomCellsLine(n, p))

// 判断 x y 位置的生命当前是否活着
const currentIsLife = (cells, x, y) =>
    Boolean(cells[x] && cells[x][y])

// 计算周围活着的邻居数量
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
            ([x1, y1]) =>
                currentIsLife(cells, x1, y1)
        )
        .length
}

// 根据规则判断下一个时刻当前生命的状态
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
    const speed = 10
    const symbol = 'o '
    // const cells = generateCells(30, 0.1)
    const cells = cells4(cells1)

    readline.emitKeypressEvents(process.stdin)
    process.stdin.setRawMode(true)
    process.stdin.on('keypress', (key) => {
        if (key === 'q') {
            log(ansiEscapes.cursorShow)
            process.exit()
        }
    })

    const update = () => {
        const old = JSON.parse(JSON.stringify(cells))
        for (let x = 0; x < cells.length; x++) {
            const line = cells[x]
            for (let y = 0; y < line.length; y++) {
                cells[x][y] = nextIsLife(old, x, y)
            }
        }
    }
    const showCells = cells => cells
        .map(line => {
            return line
                .map(c => c ? symbol : ' ')
                .join('')
        })
        .join('\n')
    setInterval(() => {
        draw(showCells(cells))
        update()
    }, 1000 / speed)
}

main()

