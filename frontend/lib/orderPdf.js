/**
 * Generates and downloads a PDF receipt for a given order.
 *
 * @param {object} order - The order object (compatible with track-order and cart-success shapes).
 * @param {function} t - The translation function from useLanguage().
 * @param {function} translateProductName - Product-name translator from useLanguage().
 */
export async function downloadOrderPdf(order, t, translateProductName) {
  // Dynamic import keeps jsPDF out of the SSR bundle.
  const { jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  // ── Load Unicode font (Roboto) for Romanian diacritics ──────────────────
  async function loadFontAsBase64(url) {
    const res = await fetch(url)
    const buf = await res.arrayBuffer()
    const bytes = new Uint8Array(buf)
    let bin = ''
    for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i])
    return btoa(bin)
  }
  const [robotoRegularB64, robotoBoldB64] = await Promise.all([
    loadFontAsBase64('/fonts/Roboto-Regular.ttf'),
    loadFontAsBase64('/fonts/Roboto-Bold.ttf'),
  ])
  doc.addFileToVFS('Roboto-Regular.ttf', robotoRegularB64)
  doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal')
  doc.addFileToVFS('Roboto-Bold.ttf', robotoBoldB64)
  doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold')
  const FONT = 'Roboto'

  const PAGE_W = doc.internal.pageSize.getWidth()
  const PAGE_H = doc.internal.pageSize.getHeight()
  const MARGIN = 18
  const CONTENT_W = PAGE_W - MARGIN * 2
  const BLUE = [37, 99, 235]
  const DARK = [17, 24, 39]
  const GRAY = [107, 114, 128]
  const LIGHT_BG = [249, 250, 251]
  const BORDER = [229, 231, 235]

  // ── Helpers ──────────────────────────────────────────────────────────────
  function fillRect(x, rectY, w, h, color) {
    doc.setFillColor(...color)
    doc.rect(x, rectY, w, h, 'F')
  }

  function strokeRect(x, rectY, w, h, color) {
    doc.setDrawColor(...color)
    doc.rect(x, rectY, w, h, 'S')
  }

  function text(str, x, textY, opts = {}) {
    doc.text(Array.isArray(str) ? str : String(str), x, textY, opts)
  }

  function formatDate(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })
  }

  // ── Header bar ───────────────────────────────────────────────────────────
  fillRect(0, 0, PAGE_W, 28, BLUE)

  doc.setFont(FONT, 'bold')
  doc.setFontSize(18)
  doc.setTextColor(255, 255, 255)
  text('ZIDEX', MARGIN, 12)

  doc.setFont(FONT, 'normal')
  doc.setFontSize(9)
  doc.setTextColor(191, 219, 254)
  text(t('pdfStoreName') || 'Magazin de Construcții', MARGIN, 18)
  text('zidex.md', MARGIN, 23)

  doc.setFont(FONT, 'bold')
  doc.setFontSize(11)
  doc.setTextColor(255, 255, 255)
  const receiptTitle = `${t('pdfOrderReceipt') || 'Bon de comandă'}  #${order.id}`
  text(receiptTitle, PAGE_W - MARGIN, 15, { align: 'right' })

  let y = 38

  // ── Status pill ──────────────────────────────────────────────────────────
  const statusKey = (order.status ?? '').trim().toUpperCase()
  const statusLabels = {
    NOU: t('trackOrderStatusNew'),
    PREPARING: t('trackOrderStatusPreparing'),
    DELIVERED: t('trackOrderStatusDelivered'),
  }
  const pillBgMap = {
    NOU: [219, 234, 254],
    PREPARING: [254, 243, 199],
    DELIVERED: [220, 252, 231],
  }
  const pillTextMap = {
    NOU: [29, 78, 216],
    PREPARING: [180, 83, 9],
    DELIVERED: [21, 128, 61],
  }
  const statusLabel = statusLabels[statusKey] ?? (order.status ?? '')
  const pillBg = pillBgMap[statusKey] ?? [243, 244, 246]
  const pillText = pillTextMap[statusKey] ?? GRAY

  doc.setFontSize(9)
  doc.setFont(FONT, 'bold')
  const pillW = doc.getTextWidth(statusLabel) + 12
  fillRect(MARGIN, y - 5.5, pillW, 9, pillBg)
  doc.setTextColor(...pillText)
  text(statusLabel, MARGIN + 6, y + 0.2)
  y += 10

  // ── Order summary grid (3 cells) ─────────────────────────────────────────
  const CELL_H = 18
  const COL_W = CONTENT_W / 3
  const gridCells = [
    [t('trackOrderIdField') || 'Order ID', `#${order.id}`, MARGIN],
    [t('trackOrderDateField') || 'Date', formatDate(order.orderDate), MARGIN + COL_W],
    [t('trackOrderTotalField') || 'Total', `${Number(order.totalPrice).toFixed(2)} MDL`, MARGIN + COL_W * 2],
  ]
  gridCells.forEach(([label, value, x]) => {
    fillRect(x, y, COL_W - 3, CELL_H, LIGHT_BG)
    strokeRect(x, y, COL_W - 3, CELL_H, BORDER)
    doc.setFont(FONT, 'bold')
    doc.setFontSize(7)
    doc.setTextColor(...GRAY)
    text(label.toUpperCase(), x + 4, y + 5)
    doc.setFont(FONT, 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...DARK)
    text(value, x + 4, y + 13)
  })
  y += CELL_H + 8

  // ── Customer info ────────────────────────────────────────────────────────
  doc.setFont(FONT, 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...BLUE)
  text((t('pdfCustomerInfo') || 'Informații client').toUpperCase(), MARGIN, y)
  doc.setDrawColor(...BLUE)
  doc.line(MARGIN, y + 1.5, MARGIN + CONTENT_W, y + 1.5)
  y += 7

  const INFO_LABEL_X = MARGIN
  const INFO_VALUE_X = MARGIN + 52
  const INFO_MAX_W = CONTENT_W - 52
  const INFO_ROW_GAP = 8

  const customerFields = [
    [t('fullName') || 'Nume complet', order.customerFullName],
    [t('phone') || 'Telefon', order.phone],
    [t('trackOrderAddressField') || 'Adresă', order.address],
  ]
  if (order.email) customerFields.push([t('emailLabel') || 'Email', order.email])
  if (order.notes) customerFields.push([t('trackOrderNotesField') || 'Note', order.notes])

  customerFields.forEach(([label, value]) => {
    if (y > 265) { doc.addPage(); y = MARGIN }
    doc.setFont(FONT, 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...GRAY)
    text(`${label}:`, INFO_LABEL_X, y)
    doc.setFont(FONT, 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...DARK)
    const lines = doc.splitTextToSize(String(value || '—'), INFO_MAX_W)
    text(lines, INFO_VALUE_X, y)
    y += INFO_ROW_GAP * (lines.length > 1 ? lines.length : 1)
  })

  y += 6

  // ── Items table ───────────────────────────────────────────────────────────
  if (order.items && order.items.length > 0) {
    if (y > 240) { doc.addPage(); y = MARGIN }

    doc.setFont(FONT, 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...BLUE)
    text((t('trackOrderItemsTitle') || 'Produse comandate').toUpperCase(), MARGIN, y)
    doc.setDrawColor(...BLUE)
    doc.line(MARGIN, y + 1.5, MARGIN + CONTENT_W, y + 1.5)
    y += 5

    autoTable(doc, {
      startY: y,
      head: [[
        t('trackOrderItemProduct') || 'Produs',
        t('trackOrderItemQty') || 'Cant.',
        t('trackOrderItemPrice') || 'Preț/buc',
        t('trackOrderItemTotal') || 'Total',
      ]],
      body: order.items.map(item => [
        item.productName ? translateProductName(item.productName) : `#${item.productId}`,
        item.quantity,
        `${Number(item.price).toFixed(2)} MDL`,
        `${Number(item.lineTotal).toFixed(2)} MDL`,
      ]),
      margin: { left: MARGIN, right: MARGIN },
      styles: {
        font: FONT,
        fontSize: 9,
        cellPadding: 4,
        textColor: DARK,
        lineColor: BORDER,
        lineWidth: 0.3,
      },
      headStyles: {
        font: FONT,
        fillColor: BLUE,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      alternateRowStyles: { fillColor: LIGHT_BG },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { halign: 'right', cellWidth: 20 },
        2: { halign: 'right', cellWidth: 36 },
        3: { halign: 'right', cellWidth: 36, fontStyle: 'bold' },
      },
    })

    y = (doc.lastAutoTable?.finalY ?? y) + 4

    // Grand total row
    const TOTAL_ROW_H = 11
    if (y + TOTAL_ROW_H > PAGE_H - 16) { doc.addPage(); y = MARGIN }
    fillRect(MARGIN, y, CONTENT_W, TOTAL_ROW_H, [239, 246, 255])
    strokeRect(MARGIN, y, CONTENT_W, TOTAL_ROW_H, [191, 219, 254])

    const totalLabelStr = `${t('trackOrderTotalField') || 'Total'}:`
    const totalValueStr = `${Number(order.totalPrice).toFixed(2)} MDL`

    // Right-align the value, place label to the left with a clear gap
    const rightEdge = PAGE_W - MARGIN - 4

    doc.setFont(FONT, 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...BLUE)
    text(totalValueStr, rightEdge, y + 7.5, { align: 'right' })
    const totalValueWidth = doc.getTextWidth(totalValueStr)

    doc.setFont(FONT, 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...GRAY)
    const labelX = rightEdge - totalValueWidth - 4
    text(totalLabelStr, labelX, y + 7.5, { align: 'right' })

    y += TOTAL_ROW_H + 8
  }

  // ── Footer ───────────────────────────────────────────────────────────────
  fillRect(0, PAGE_H - 14, PAGE_W, 14, [243, 244, 246])
  doc.setFont(FONT, 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...GRAY)
  text(t('pdfFooterThanks') || 'Vă mulțumim pentru comandă!', PAGE_W / 2, PAGE_H - 7, { align: 'center' })
  text(
    `zidex.md  ·  ${t('pdfFooterGenerated') || 'Generat'} ${new Date().toLocaleDateString()}`,
    PAGE_W / 2, PAGE_H - 3, { align: 'center' }
  )

  // ── Save ─────────────────────────────────────────────────────────────────
  doc.save(`order-${order.id}.pdf`)
}
