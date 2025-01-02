import './style.css'

const $button = document.querySelector('button')

$button.addEventListener('click', () => {
  console.log($button)
  update()

  $button.remove()
  const audio = new window.Audio('./Tetris.mp3')
  audio.volume = 0.5
  audio.play()
  document.querySelector('#app').classList.remove('hidden')
})

const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')
const $score = document.querySelector('span')

const BLOCK_SIZE = 20 // tamaño en pixeles de los bloques
const BOARD_WIDTH = 14 // cantidad de bloques a lo ancho
const BOARD_HEIGHT = 30 // cantidad de bloques a lo alto

let score = 0

canvas.width = BLOCK_SIZE * BOARD_WIDTH
canvas.height = BLOCK_SIZE * BOARD_HEIGHT

context.scale(BLOCK_SIZE, BLOCK_SIZE)

// board

const board = []

for (let i = 0; i < BOARD_HEIGHT; i++) {
  board[i] = []
  for (let j = 0; j < BOARD_WIDTH; j++) {
    board[i].push(0)
  }
}
// board[29] = [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1]

const piece = {
  position: { x: 6, y: 6 },
  shape: [
    [1, 1],
    [1, 1]
  ]
}

const PIECES = [
  [
    [1, 1],
    [1, 1]
  ],
  [
    [1, 1, 1, 1]
  ],
  [
    [0, 1, 0],
    [1, 1, 1]
  ],
  [
    [1, 1, 0],
    [0, 1, 1]
  ],
  [
    [1, 0],
    [1, 0],
    [1, 1]
  ],
  [
    [0, 1, 1],
    [1, 1, 0]
  ]
]

// game loop
let dropCounter = 0
let lastTime = 0
function update (time = 0) {
  const deltaTime = time - lastTime
  lastTime = time

  dropCounter += deltaTime

  if (dropCounter > 1000) {
    piece.position.y++
    dropCounter = 0

    if (checkCollision()) {
      piece.position.y--
      solidifyPiece()
      removeRows()
    }
  }

  draw()
  window.requestAnimationFrame(update)
}

function draw () {
  context.fillStyle = '#000'
  context.fillRect(0, 0, canvas.width, canvas.height)

  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        context.fillStyle = 'yellow'
        context.fillRect(x, y, 1, 1)
      }
    })
  })

  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        context.fillStyle = 'red'
        context.fillRect(x + piece.position.x, y + piece.position.y, 1, 1)
      }
    })
  })
}

function checkCollision () {
  return piece.shape.find((row, y) => {
    return row.find((cel, x) => {
      return (
        cel !== 0 &&
        board[y + piece.position.y]?.[x + piece.position.x] !== 0
      )
    })
  })
}

function solidifyPiece () {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        board[y + piece.position.y][x + piece.position.x] = 1
      }
    })
  })

  // get randow shape
  piece.shape = PIECES[Math.floor(Math.random() * PIECES.length)]
  // reset position
  piece.position.x = 5
  piece.position.y = 0
  // game over
  if (checkCollision()) {
    window.alert('Game over!! Sorry!')
    board.forEach((row) => row.fill(0))
  }
}

function removeRows () {
  const rowsToRemove = []

  board.forEach((row, y) => {
    if (row.every(value => value === 1)) {
      rowsToRemove.push(y)
    }
  })

  rowsToRemove.forEach(y => {
    board.splice(y, 1)
    const newRow = Array(BOARD_WIDTH).fill(0)
    board.unshift(newRow)
    score += 10
  })

  $score.innerText = score.toString()
}
// event

document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') {
    piece.position.x--
    if (checkCollision()) {
      piece.position.x++
    }
  }
  if (event.key === 'ArrowRight') {
    piece.position.x++
    if (checkCollision()) {
      piece.position.x--
    }
  }

  if (event.key === 'ArrowDown') {
    piece.position.y++
    if (checkCollision()) {
      piece.position.y--
      solidifyPiece()
      removeRows()
    }
  }

  if (event.key === 'ArrowUp') {
    const rotated = []

    for (let i = 0; i < piece.shape[0].length; i++) {
      const row = []

      for (let j = piece.shape.length - 1; j >= 0; j--) {
        row.push(piece.shape[j][i])
      }
      rotated.push(row)
    }

    const previousShape = piece.shape
    piece.shape = rotated
    if (checkCollision()) {
      piece.shape = previousShape
    }
  }
})
