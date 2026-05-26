function getThemeColors() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
  return {
    grid:  isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)',
    text:  isDark ? '#555350' : '#A8998E',
  }
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {string[]} labels
 * @param {{ color: string, data: number[] }[]} datasets
 * @param {{ yMax?: number }} options
 */
export function drawLineChart(canvas, labels, datasets, options = {}) {
  if (!canvas) return
  const { yMax = 10 } = options
  const dpr = window.devicePixelRatio || 1
  const W   = canvas.offsetWidth || 400
  const H   = canvas.height      || 100
  canvas.width  = W * dpr
  canvas.height = H * dpr
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)

  const pad = { t: 10, r: 10, b: 24, l: 32 }
  const cw  = W - pad.l - pad.r
  const ch  = H - pad.t - pad.b
  const { grid, text: textCol } = getThemeColors()

  ctx.strokeStyle = grid
  ctx.lineWidth = 0.5
  for (let i = 0; i <= 4; i++) {
    const y = pad.t + ch * (1 - i / 4)
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + cw, y); ctx.stroke()
  }

  ctx.fillStyle = textCol
  ctx.font = '10px Geist,sans-serif'
  ctx.textAlign = 'right'
  for (let i = 0; i <= 4; i++) {
    const y = pad.t + ch * (1 - i / 4)
    ctx.fillText(Math.round(yMax * i / 4), pad.l - 4, y + 3)
  }

  ctx.textAlign = 'center'
  labels.forEach((l, i) => {
    const x = pad.l + cw * (i / (labels.length - 1))
    ctx.fillText(l, x, H - 6)
  })

  datasets.forEach(ds => {
    ctx.strokeStyle = ds.color
    ctx.lineWidth = 2
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.beginPath()
    ds.data.forEach((v, i) => {
      const x = pad.l + cw * (i / (labels.length - 1))
      const y = pad.t + ch * (1 - v / yMax)
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.stroke()
    ds.data.forEach((v, i) => {
      const x = pad.l + cw * (i / (labels.length - 1))
      const y = pad.t + ch * (1 - v / yMax)
      ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2)
      ctx.fillStyle = ds.color; ctx.fill()
    })
  })
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {string[]} labels
 * @param {{ color: string, data: number[] }[]} datasets
 * @param {{ yMax?: number, stacked?: boolean }} options
 */
export function drawBarChart(canvas, labels, datasets, options = {}) {
  if (!canvas) return
  const { yMax = 100, stacked = false } = options
  const dpr = window.devicePixelRatio || 1
  const W   = canvas.offsetWidth || 400
  const H   = canvas.height      || 100
  canvas.width  = W * dpr
  canvas.height = H * dpr
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)

  const pad = { t: 10, r: 10, b: 24, l: 32 }
  const cw  = W - pad.l - pad.r
  const ch  = H - pad.t - pad.b
  const { grid, text: textCol } = getThemeColors()

  ctx.strokeStyle = grid
  ctx.lineWidth = 0.5
  for (let i = 0; i <= 4; i++) {
    const y = pad.t + ch * (1 - i / 4)
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + cw, y); ctx.stroke()
  }

  ctx.fillStyle = textCol
  ctx.font = '10px Geist,sans-serif'
  ctx.textAlign = 'right'
  for (let i = 0; i <= 4; i++) {
    const y = pad.t + ch * (1 - i / 4)
    ctx.fillText(Math.round(yMax * i / 4), pad.l - 4, y + 3)
  }

  ctx.textAlign = 'center'
  const n = labels.length
  const barW = stacked ? (cw / n * 0.5) : (cw / n * 0.5 / datasets.length)
  const totalW = stacked ? barW : barW * datasets.length

  labels.forEach((l, i) => {
    const cx = pad.l + cw * (i / (n - 1))
    ctx.fillStyle = textCol
    ctx.fillText(l, cx, H - 6)

    if (stacked) {
      let base = 0
      datasets.forEach(ds => {
        const h = ch * ds.data[i] / yMax
        const x = cx - barW / 2
        const y = pad.t + ch - base - h
        ctx.fillStyle = ds.color
        ctx.beginPath(); ctx.roundRect(x, y, barW, h, 3); ctx.fill()
        base += h
      })
    } else {
      datasets.forEach((ds, di) => {
        const h = ch * ds.data[i] / yMax
        const x = cx - totalW / 2 + di * barW
        const y = pad.t + ch - h
        ctx.fillStyle = ds.color
        ctx.beginPath(); ctx.roundRect(x, y, barW - 2, h, 3); ctx.fill()
      })
    }
  })
}
