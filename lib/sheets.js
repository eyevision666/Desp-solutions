import { google } from 'googleapis'

const SHEET_ID = process.env.GOOGLE_SPREADSHEET_ID || '1BUxcy4ZNN0_GRAqiV032OdKvaZ-I5gKu4d8C06klQqc'
const HEADER = [
  'Timestamp', 'Report ID', 'Full Name', 'Date of Birth', 'Age', 'Gender', 'Occupation',
  'Phone', 'Email',
  'Medical History', 'Symptoms', 'Ocular History',
  'Total Screen Time (h)', 'Mobile (h)', 'Computer (h)', 'Laptop (h)', 'Tablet (h)', 'Television (h)',
  'Usage Types',
  'AI Score (%)', 'Severity', 'Level', 'Diagnosis', 'Recommendations',
  'Left Eye Captured', 'Right Eye Captured',
]

let cachedSheets = null
let cachedSheetName = null
let cachedSheetId = null
let ensuredHeader = false

async function getClient() {
  if (cachedSheets) return cachedSheets
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  const client = await auth.getClient()
  cachedSheets = google.sheets({ version: 'v4', auth: client })
  return cachedSheets
}

// Detect the first (default) sheet tab so data is visible immediately
async function getTargetSheet(sheets) {
  if (cachedSheetName) return { name: cachedSheetName, sheetId: cachedSheetId }
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID })
  const first = meta.data.sheets?.[0]?.properties
  cachedSheetName = first?.title || 'Sheet1'
  cachedSheetId = first?.sheetId
  return { name: cachedSheetName, sheetId: cachedSheetId }
}

async function ensureSheetHeader(sheets, sheetName) {
  if (ensuredHeader) return
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A1:Z1`,
  })
  const hasHeader = res.data.values && res.data.values.length > 0 && res.data.values[0].length > 0
  if (!hasHeader) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${sheetName}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [HEADER] },
    })
  }
  ensuredHeader = true
}

// Find the next writable row (1-indexed) — scan column A for the last non-empty cell
async function getNextRow(sheets, sheetName) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A1:A`,
  })
  const values = res.data.values || []
  return values.length + 1
}

export async function syncAssessments(docs, baseUrl) {
  try {
    const sheets = await getClient()
    const { name: sheetName, sheetId } = await getTargetSheet(sheets)
    await ensureSheetHeader(sheets, sheetName)

    // Get already-present Report IDs (column B, starting row 2)
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${sheetName}!B2:B`,
    })
    const existingIds = new Set((existing.data.values || []).map((r) => r[0]))

    const toAdd = docs.filter((d) => !existingIds.has(d.id))
    if (toAdd.length === 0) return { success: true, added: 0, skipped: docs.length }

    const rows = toAdd.map((doc) => buildRow(doc, baseUrl))
    const startRow = await getNextRow(sheets, sheetName)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${sheetName}!A${startRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: rows },
    })

    return { success: true, added: rows.length, skipped: docs.length - rows.length }
  } catch (err) {
    console.error('Google Sheets sync error:', err.message)
    return { success: false, error: err.message }
  }
}

function buildRow(doc, baseUrl) {
  const p = doc.patient || {}
  const dh = doc.deviceHours || {}
  const r = doc.result || {}
  return [
    new Date(doc.createdAt).toLocaleString('en-GB'),
    doc.id, p.fullName || '', p.dob || '', p.age || '', p.gender || '', p.occupation || '',
    p.phone || '', p.email || '',
    (doc.medicalHistory || []).join(', '),
    (doc.symptoms || []).join(', '),
    (doc.ocularHistory || []).join(', '),
    doc.screenTime || 0,
    Number(dh.Mobile || 0), Number(dh.Computer || 0), Number(dh.Laptop || 0), Number(dh.Tablet || 0), Number(dh.Television || 0),
    (doc.usageTypes || []).join(', '),
    r.score || '', r.severity || '', r.level || '',
    (r.diagnosis || []).join(', '),
    (r.recommendations || []).join(' | '),
    doc.eyeImages?.left ? 'Yes' : 'No',
    doc.eyeImages?.right ? 'Yes' : 'No',
  ]
}

export async function appendAssessment(doc, baseUrl) {
  try {
    const sheets = await getClient()
    const { name: sheetName, sheetId } = await getTargetSheet(sheets)
    await ensureSheetHeader(sheets, sheetName)

    const row = buildRow(doc, baseUrl)
    const startRow = await getNextRow(sheets, sheetName)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${sheetName}!A${startRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    })

    // Set row height for image visibility (best-effort)
    try {
      if (sheetId !== undefined) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SHEET_ID,
          requestBody: {
            requests: [{
              updateDimensionProperties: {
                range: { sheetId, dimension: 'ROWS', startIndex: startRow - 1, endIndex: startRow },
                properties: { pixelSize: 120 },
                fields: 'pixelSize',
              },
            }],
          },
        })
      }
    } catch (e) { /* row-height styling best-effort */ }

    return { success: true, row: startRow }
  } catch (err) {
    console.error('Google Sheets append error:', err.message)
    return { success: false, error: err.message }
  }
}
