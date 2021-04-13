import * as readline from 'readline'
import ansiEscapes from 'ansi-escapes'
import { cells1 } from './cells1'

type Status = 0 | 1

type Cell = Status[]

type Cells = Cell[]

type CellOperator = (...cells: Cells[]) => Cells

const log = console.log.bind(console)

const copy = (o: any): any => JSON.parse(JSON.stringify(o))

const beside: CellOperator = (cells1, cells2) => {
    cells1 = copy(cells1)
    cells2 = copy(cells2)
    return cells1.map(
        (line, index) => line.concat(cells2[index])
    )
}

const below: CellOperator = (cells1, cells2) => {
    cells1 = copy(cells1)
    cells2 = copy(cells2)
    return cells1.concat(cells2)
}

const rotate: CellOperator = (cells) => {
    cells = copy(cells)
    if (cells.length === 0) {
        return []
    } else if (cells.length === 1) {
        return cells[0].map(e => [e])
    } else {
        return beside(
            rotate(cells.slice(1)),
            rotate([cells[0]])
        )
    }
}

const mirrorV: CellOperator = (cells) => {
    cells = copy(cells)
    return cells.map(line => line.reverse())
}

const mirrorP: CellOperator = (cells) => {
    cells = copy(cells)
    return cells.reverse()
}

const cells4: CellOperator = (cells) => {
    cells = copy(cells)
    const upper = beside(mirrorV(cells), cells)
    const lower = mirrorP(upper)
    return below(upper, lower)
}

const range = (start: number, end:number, step = 1): number[] =>
    start > end ? [] : [start].concat(range(start + step, end, step))

// 在命令行绘制字符串, hide 隐藏光标, clear 清屏
const draw = (str: string, hide = true, clear = true): void => {
    const esc = ansiEscapes
    if (clear) {  
        log(esc.clearTerminal)
    }
    log(str)
    log(hide ? esc.cursorHide : esc.cursorShow)
}  

// 生成 n 个元素的数组, 元素是 0 或 1, 1的概率是 p
const generateRandomCellsLine = (n: number, p = 0.1): Status[] =>
    range(1, n).map(
        _ => Math.random() < p ? 1 : 0
    )

// 生成 n*n 的数组, 元素是 0 或 1, 1 的概率是 p
const generateCells = (n: number, p: number): Cells =>
    range(1, n).map(_ => generateRandomCellsLine(n, p))

// 判断 x y 位置的生命当前是否活着
const currentIsLife = (cells: Cells, x: number, y: number): boolean =>
    Boolean(cells[x] && cells[x][y])

// 计算周围活着的邻居数量
const countOfLiveNeighbours = (cells: Cells, x: number, y: number): number => {
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
const nextIsLife = (cells: Cells, x: number, y: number): Status => {
    const count = countOfLiveNeighbours(cells, x, y)
    if (count === 3) {
        return 1
    } else if (count === 2) {
        return currentIsLife(cells, x, y) ? 1 : 0
    } else {
        return 0
    }
}

class Game {
    private cells: Cells = [[]]
    private speed = 10
    private symbol = 'o'
    constructor () {
        readline.emitKeypressEvents(process.stdin)
        process.stdin.setRawMode(true)
        process.stdin.on('keypress', (key) => {
            if (key === 'q') {
                log(ansiEscapes.cursorShow)
                process.exit()
            } else if (key === 's') {
                this.cells = cells4(cells1 as Cells)
            } else if (key === 'r') {
                this.cells = generateCells(60, 0.1)
            }
        })
    }
    private update () {
        const cells = this.cells
        const old = copy(cells)
        for (let x = 0; x < cells.length; x++) {
            const line = cells[x]
            for (let y = 0; y < line.length; y++) {
                cells[x][y] = nextIsLife(old, x, y)
            }
        }
    }
    private draw () {
        const cells = this.cells
        const symbol = this.symbol
        const showCells = (cells: Cells) => cells
            .map(line => {
                return line
                    .map(c => c ? symbol : ' ')
                    .join('')
            })
            .join('\n')
        draw(showCells(cells))
    }
    run () {
        const speed = this.speed
        setInterval(() => {
            this.draw()
            this.update()
        }, 1000 / speed)
    }
}

const main = () => {
    const g = new Game()
    g.run()
}

main()

