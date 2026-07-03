// Rule-based AI decision logic for Digital Eye Strain
// Follows the clinical decision table provided by the user.

export function assessEyeStrain(data) {
  const symptoms = new Set(data.symptoms || [])
  const usage = Number(data.screenTime || 0)
  const has = (s) => symptoms.has(s)

  // Refractive error flags
  const hasMyopia = has('Short Sightedness')
  const hasHyper = has('Long Sightedness')
  const hasRefractive = hasMyopia || hasHyper

  // Eye Health Score (0-100, higher = healthier)
  const symptomPenalty = symptoms.size * 5
  const usagePenalty = Math.min(usage * 4, 45)
  const historyPenalty = (data.medicalHistory?.length || 0) * 2
  const ocularPenalty = (data.ocularHistory?.length || 0) * 3
  const baseScore = 100 - symptomPenalty - usagePenalty - historyPenalty - ocularPenalty
  const score = Math.max(15, Math.min(98, baseScore))

  // Symptom groups per your decision table
  const level4Symptoms = ['Redness', 'Burning', 'Blurred Vision', 'Stress',
    'Sleeplessness', 'Headache', 'Itching', 'Sensitivity to Light']
  const level3Symptoms = ['Redness', 'Burning', 'Blurred Vision', 'Stress',
    'Sleeplessness', 'Headache', 'Itching']

  const hasAllLevel4 = level4Symptoms.every((s) => has(s)) && hasRefractive
  const hasAllLevel3 = level3Symptoms.every((s) => has(s)) && hasRefractive
  const hasLevel2 = has('Redness') && has('Burning') && has('Blurred Vision')
  const hasLevel1 = has('Redness')

  let level = 1
  let severity = 'Mild Eye Strain'
  let color = 'green'
  let diagnosis = []
  let recommendations = []

  // Helper to add refractive error diagnosis
  const addRefractiveDx = () => {
    if (hasMyopia) diagnosis.push('Myopia (Short Sightedness)')
    if (hasHyper) diagnosis.push('Hypermetropia (Long Sightedness)')
    diagnosis.push('Refractive Error — Corrective glasses + DESP indicated')
  }

  // =========== LEVEL 4 — SEVERE ===========
  if (hasAllLevel4 && usage > 8) {
    level = 4
    severity = 'Severe Eye Strain'
    color = 'red'
    diagnosis = ['Severe Eye Strain', 'Dry Eyes', 'Refractive Error']
    addRefractiveDx()
    recommendations = [
      'Level 4 Eye Relaxation Exercises',
      'Artificial Tears (Tear Drops)',
      'Meditation',
      'DESP Glasses (Compulsory)',
      'Nutritional Supplements',
    ]
  }
  // =========== LEVEL 3 — HIGH ===========
  else if (hasAllLevel3 && usage <= 8) {
    level = 3
    severity = 'High Eye Strain'
    color = 'orange'
    diagnosis = ['High Eye Strain', 'Dry Eyes', 'Refractive Error']
    addRefractiveDx()
    recommendations = [
      'Level 3 Eye Relaxation Exercises',
      'Artificial Tears (Tear Drops)',
      'DESP Glasses (Compulsory)',
      'Refractive Error Correction',
      'Meditation',
      'Nutritional Supplements (Optional)',
    ]
  }
  // =========== LEVEL 2 — MODERATE ===========
  else if (hasLevel2 && usage <= 6) {
    level = 2
    severity = 'Moderate Eye Strain'
    color = 'yellow'
    diagnosis = ['Moderate Eye Strain', 'Dry Eyes', 'DESP Glasses Usage — Compulsory']
    if (hasRefractive) diagnosis.push('Refractive Error present')
    recommendations = [
      'Level 2 Eye Relaxation Exercises',
      'Artificial Tears (Tear Drops)',
      'DESP Glasses (Compulsory)',
    ]
    if (hasRefractive) recommendations.push('Refractive Error Correction')
  }
  // =========== LEVEL 1 — MILD ===========
  else if (hasLevel1 && usage <= 4) {
    level = 1
    severity = 'Mild Eye Strain'
    color = 'green'
    diagnosis = ['Mild Eye Strain', 'Dry Eyes']
    recommendations = [
      'Level 1 Eye Relaxation Exercises',
      'Artificial Tears (Tear Drops)',
      'DESP Glasses (Optional)',
    ]
  }
  // =========== FALLBACK — general estimation ===========
  else {
    if (usage > 8) {
      level = 3
      severity = 'High Eye Strain (Digital Fatigue)'
      color = 'orange'
      diagnosis = ['Digital Fatigue', 'Prolonged Screen Exposure']
      if (hasRefractive) addRefractiveDx()
      recommendations = [
        'Level 3 Eye Relaxation Exercises',
        'Artificial Tears (Tear Drops)',
        'DESP Glasses (Compulsory)',
        'Meditation',
        'Take frequent screen breaks',
      ]
    } else if (usage > 6 || symptoms.size >= 4) {
      level = 2
      severity = 'Moderate Eye Strain'
      color = 'yellow'
      diagnosis = ['Moderate Digital Eye Strain']
      if (hasRefractive) diagnosis.push('Refractive Error present')
      recommendations = [
        'Level 2 Eye Relaxation Exercises',
        'Artificial Tears (Tear Drops)',
        'DESP Glasses (Compulsory)',
      ]
      if (hasRefractive) recommendations.push('Refractive Error Correction')
    } else {
      level = 1
      severity = 'Mild Eye Strain'
      color = 'green'
      diagnosis = ['Mild Digital Eye Strain', 'Dry Eyes']
      recommendations = [
        'Level 1 Eye Relaxation Exercises',
        'Artificial Tears (Tear Drops)',
        'DESP Glasses (Optional)',
      ]
    }
  }

  return { score, level, severity, color, diagnosis, recommendations }
}
