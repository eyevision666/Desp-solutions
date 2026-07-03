'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Eye, Brain, FileText, Sparkles, ArrowRight, ArrowLeft, Camera, Check,
  Activity, Monitor, ShieldCheck, Zap, ClipboardList, Sun, Moon, Download, Printer,
  Users, TrendingUp, AlertCircle, LayoutDashboard, ArrowUpRight, HeartPulse
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, PolarAngleAxis
} from 'recharts'
import { getRecommendationInfo } from '@/lib/recommendations'

const HERO_IMG = 'https://images.unsplash.com/photo-1727434032792-c7ef921ae086?w=900&q=80'
const HERO_IMG_2 = 'https://plus.unsplash.com/premium_photo-1663013256145-e4b58bb427f0?w=600&q=80'
const HERO_IMG_3 = 'https://plus.unsplash.com/premium_photo-1664908347841-662c854f3273?w=600&q=80'

const MEDICAL_HISTORY = ['Diabetes','Hypertension','Cholesterol','Thyroid Disease','Neurological Disease','Allergy','Nill','Other']
const SYMPTOMS = ['Eye Redness','Eye Irritation','Burning','Dry Eyes','Blurred Vision','Headache','Sleeplessness','Sensitivity to Light','Stress','Itching','Short Sightedness','Long Sightedness','Other']
const OCULAR_HISTORY = ['Uses Spectacles','Uses Contact Lens','Previous Cataract Surgery','LASIK Surgery','Eye Trauma','Squint','Eye Infection','Other']
const DEVICES = ['Mobile','Computer','Laptop','Tablet','Television']

const formatOtherEntries = (items, customText) => items.map((item) => {
  if (item !== 'Other') return item
  return customText?.trim() ? `Other: ${customText.trim()}` : 'Other'
})

const normalizeMedicalHistory = (values) => {
  if (values.includes('Nill')) return ['Nill']
  return values.filter((item) => item !== 'Nill')
}

const USAGE_TYPES = ['Work / Office', 'Study / Learning', 'Entertainment (Movies/Series)', 'Gaming', 'Social Media', 'Reading / News', 'Video Calls / Meetings', 'Coding / Programming', 'Content Creation / Editing', 'Shopping / Browsing']

const COUNTRY_CODES = [
  { code: '+91', label: '🇮🇳 India (+91)' },
  { code: '+1',  label: '🇺🇸 USA (+1)' },
  { code: '+44', label: '🇬🇧 UK (+44)' },
  { code: '+61', label: '🇦🇺 Australia (+61)' },
  { code: '+971', label: '🇦🇪 UAE (+971)' },
  { code: '+65', label: '🇸🇬 Singapore (+65)' },
  { code: '+81', label: '🇯🇵 Japan (+81)' },
  { code: '+86', label: '🇨🇳 China (+86)' },
  { code: '+49', label: '🇩🇪 Germany (+49)' },
  { code: '+33', label: '🇫🇷 France (+33)' },
  { code: '+92', label: '🇵🇰 Pakistan (+92)' },
  { code: '+880', label: '🇧🇩 Bangladesh (+880)' },
  { code: '+94', label: '🇱🇰 Sri Lanka (+94)' },
  { code: '+977', label: '🇳🇵 Nepal (+977)' },
  { code: '+60', label: '🇲🇾 Malaysia (+60)' },
  { code: '+62', label: '🇮🇩 Indonesia (+62)' },
  { code: '+27', label: '🇿🇦 South Africa (+27)' },
  { code: '+7', label: '🇷🇺 Russia (+7)' },
]

function computeAge(dob) {
  if (!dob) return ''
  const d = new Date(dob)
  if (isNaN(d)) return ''
  const now = new Date()
  let age = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--
  return age >= 0 && age < 130 ? String(age) : ''
}

const symptomNormalize = (s) => ({
  'Eye Redness': 'Redness',
  'Eye Irritation': 'Irritation',
}[s] || s)

function Nav({ setView }) {
  const { theme, setTheme } = useTheme()
  return (
    <nav className="sticky top-0 z-40 glass border-b border-white/30 dark:border-white/10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <button onClick={() => setView('home')} className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-sky-500/30 group-hover:scale-105 transition-transform">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <div className="font-bold text-lg tracking-tight">DESP <span className="gradient-text">Solutions</span></div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground -mt-1">Digital Eye Strain Protection · AI</div>
          </div>
        </button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setView('home')} className="hidden md:inline-flex">Home</Button>
          <Button variant="ghost" size="sm" onClick={() => setView('admin')} className="hidden md:inline-flex">
            <LayoutDashboard className="w-4 h-4 mr-1" />Admin
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Button size="sm" onClick={() => setView('survey')} className="btn-primary-grad">
            Start Survey <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </nav>
  )
}

function Home({ setView }) {
  return (
    <section className="container mx-auto px-4 py-10 md:py-16">
      <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center min-h-[75vh]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Badge className="mb-5 bg-cyan-100 text-cyan-700 hover:bg-cyan-100 dark:bg-cyan-500/10 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/20 px-3 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> DESP Solutions · AI-Powered Screening
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight mb-6">
            AI Powered <span className="gradient-text">Digital Eye Strain</span> Assessment
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-xl">
            Assess your digital eye health in just a few minutes using AI-powered screening. Receive a professional clinical report you can share with your ophthalmologist.
          </p>
          <Button size="lg" onClick={() => setView('survey')} className="btn-primary-grad text-base px-10 h-14 rounded-2xl shadow-xl shadow-sky-500/30">
            Start the Survey <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Clinically inspired</div>
            <div className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-500" /> 3-minute test</div>
            <div className="flex items-center gap-1.5"><FileText className="w-4 h-4 text-sky-600" /> Instant PDF report</div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }} className="relative">
          <div className="absolute -inset-8 bg-gradient-to-tr from-sky-300/40 via-cyan-300/30 to-blue-400/40 blur-3xl rounded-full animate-pulse -z-10" />

          {/* Animated 3-image collage */}
          <div className="relative h-[440px] md:h-[520px]">
            {/* Main image */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 w-[78%] h-[85%] left-0 top-4 rounded-3xl overflow-hidden shadow-2xl shadow-sky-500/30 ring-1 ring-white/50"
            >
              <img src={HERO_IMG} alt="Digital eye AI" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-sky-900/30 via-transparent to-transparent" />
            </motion.div>

            {/* Secondary image top-right */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
              className="absolute right-0 top-0 w-[45%] h-[42%] rounded-2xl overflow-hidden shadow-xl shadow-sky-500/30 ring-2 ring-white/70 dark:ring-white/20"
            >
              <img src={HERO_IMG_2} alt="Eye examination" className="w-full h-full object-cover" />
            </motion.div>

            {/* Third image bottom-right */}
            <motion.div
              animate={{ y: [0, -8, 0], x: [0, 4, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
              className="absolute right-0 bottom-6 w-[50%] h-[40%] rounded-2xl overflow-hidden shadow-xl shadow-cyan-500/30 ring-2 ring-white/70 dark:ring-white/20"
            >
              <img src={HERO_IMG_3} alt="Digital eye strain" className="w-full h-full object-cover" />
            </motion.div>

            {/* Floating decorative badge — top-left */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
              className="absolute -left-4 top-16 glass-strong rounded-2xl px-4 py-3 flex items-center gap-2 shadow-2xl"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Score</div>
                <div className="text-sm font-bold gradient-text">98% Confidence</div>
              </div>
            </motion.div>

            {/* Floating decorative badge — bottom-left */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
              className="absolute -left-2 bottom-8 glass-strong rounded-2xl px-4 py-3 flex items-center gap-2 shadow-2xl"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Live</div>
                <div className="text-sm font-bold">Analyzing…</div>
              </div>
            </motion.div>
          </div>

          {/* Live AI Analysis card — OUTSIDE, below the image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="glass-strong rounded-2xl p-4 mt-6 flex items-center gap-3 shadow-xl border border-sky-100 dark:border-sky-500/20"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-sky-500/30">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-semibold">Live AI Analysis</div>
              <div className="text-xs text-muted-foreground">Powered by evidence-based ophthalmology rules</div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Online</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function CheckboxGrid({ options, values, onChange }) {
  const toggle = (opt) => {
    if (values.includes(opt)) onChange(values.filter((v) => v !== opt))
    else onChange([...values, opt])
  }
  return (
    <div className="grid sm:grid-cols-2 gap-2">
      {options.map((opt) => {
        const active = values.includes(opt)
        return (
          <button key={opt} type="button" onClick={() => toggle(opt)}
            className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${active
              ? 'border-sky-500 bg-sky-50 dark:bg-sky-500/10 shadow-md shadow-sky-500/10'
              : 'border-border bg-white/50 dark:bg-white/5 hover:border-sky-300'}`}>
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition ${active ? 'bg-sky-500 border-sky-500' : 'border-muted-foreground/40'}`}>
              {active && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
            </div>
            <span className="text-sm font-medium">{opt}</span>
          </button>
        )
      })}
    </div>
  )
}

function StepHeader({ step, total, title, subtitle }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
        <span className="font-semibold text-sky-600 dark:text-sky-400">Step {step} of {total}</span>
        <span>{Math.round((step / total) * 100)}% complete</span>
      </div>
      <Progress value={(step / total) * 100} className="h-2 mb-6" />
      <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
      {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
    </div>
  )
}

function EyeCapture({ label, image, setImage }) {
  const videoRef = useRef(null)
  const [streaming, setStreaming] = useState(false)

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setStreaming(true)
      }
    } catch (e) {
      toast.error('Camera permission denied. Please allow camera access.')
    }
  }

  const capture = () => {
    if (!videoRef.current) return
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0)
    setImage(canvas.toDataURL('image/jpeg', 0.6))
    const tracks = videoRef.current.srcObject?.getTracks() || []
    tracks.forEach((t) => t.stop())
    setStreaming(false)
  }

  const retake = () => { setImage(null); start() }

  return (
    <Card className="glass rounded-3xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold flex items-center gap-2">
          <Eye className="w-4 h-4 text-sky-600" /> {label}
        </div>
        {image && <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20">Captured</Badge>}
      </div>
      <div className={`relative aspect-video rounded-2xl overflow-hidden bg-black/80 mb-3 border border-white/20 ${image ? 'scan-frame' : ''}`}>
        {image ? (
          <img src={image} alt={label} className="w-full h-full object-cover" />
        ) : (
          <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
        )}
        {!streaming && !image && (
          <div className="absolute inset-0 flex items-center justify-center text-white/60 text-sm">
            Click &quot;Start Camera&quot; to begin
          </div>
        )}
      </div>
      <div className="flex gap-2">
        {!image && !streaming && (
          <Button onClick={start} className="flex-1 btn-primary-grad"><Camera className="w-4 h-4 mr-1" />Start Camera</Button>
        )}
        {streaming && !image && (
          <Button onClick={capture} className="flex-1 btn-primary-grad">Capture</Button>
        )}
        {image && (
          <Button onClick={retake} variant="outline" className="flex-1">Retake</Button>
        )}
      </div>
    </Card>
  )
}

function Survey({ setView, setResult }) {
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [data, setData] = useState({
    patient: { fullName: '', dob: '', age: '', gender: '', occupation: '', countryCode: '+91', phoneNumber: '', phone: '+91', email: '' },
    medicalHistory: [],
    customMedicalHistory: '',
    symptoms: [],
    customSymptoms: '',
    ocularHistory: [],
    customOcularHistory: '',
    deviceHours: { Mobile: 0, Computer: 0, Laptop: 0, Tablet: 0, Television: 0 },
    usageTypes: [],
    eyeImages: { left: null, right: null },
  })

  const totalScreenTime = Object.values(data.deviceHours).reduce((a, b) => a + b, 0)
  const activeDevices = Object.entries(data.deviceHours).filter(([, h]) => h > 0).map(([d]) => d)

  const updateMedicalHistory = (values) => {
    const normalized = normalizeMedicalHistory(values)
    setData((prev) => ({
      ...prev,
      medicalHistory: normalized,
      customMedicalHistory: normalized.includes('Other') ? prev.customMedicalHistory : '',
    }))
  }

  const updateSymptoms = (values) => {
    setData((prev) => ({
      ...prev,
      symptoms: values,
      customSymptoms: values.includes('Other') ? prev.customSymptoms : '',
    }))
  }

  const updateOcularHistory = (values) => {
    setData((prev) => ({
      ...prev,
      ocularHistory: values,
      customOcularHistory: values.includes('Other') ? prev.customOcularHistory : '',
    }))
  }

  const total = 6
  const next = () => setStep((s) => Math.min(total, s + 1))
  const prev = () => setStep((s) => Math.max(1, s - 1))

  const submit = async () => {
    setSubmitting(true)
    try {
      const payload = {
        patient: data.patient,
        medicalHistory: formatOtherEntries(data.medicalHistory, data.customMedicalHistory),
        symptoms: formatOtherEntries(data.symptoms, data.customSymptoms).map(symptomNormalize),
        ocularHistory: formatOtherEntries(data.ocularHistory, data.customOcularHistory),
        deviceHours: data.deviceHours,
        usageTypes: data.usageTypes,
        eyeImages: data.eyeImages,
        screenTime: totalScreenTime,
        devices: activeDevices,
      }
      const res = await fetch('/api/assessments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      })
      const responseBody = await res.json().catch(() => null)
      if (!res.ok) {
        const message = responseBody?.error || responseBody?.message || 'Failed to submit'
        throw new Error(message)
      }
      setResult(responseBody)
      // show a brief processing animation page before showing results
      setView('processing')
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('assessment:completed', { detail: { id: responseBody.id } }))
      }
      toast.success('Assessment complete!')
    } catch (e) {
      toast.error(e.message || 'Something went wrong')
      console.error('Submit failure:', e)
    } finally { setSubmitting(false) }
  }

  return (
    <div className="container mx-auto px-4 py-10 md:py-14 max-w-3xl">
      <Card className="glass-strong rounded-3xl p-6 md:p-10">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            {step === 1 && (
              <div>
                <StepHeader step={1} total={total} title="Personal Information" subtitle="Basic details for your medical record" />
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label>Full Name</Label>
                    <Input value={data.patient.fullName} onChange={(e) => setData({ ...data, patient: { ...data.patient, fullName: e.target.value } })} placeholder="John Doe" />
                  </div>
                  <div>
                    <Label>Date of Birth</Label>
                    <Input
                      type="date"
                      value={data.patient.dob}
                      max={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => {
                        const dob = e.target.value
                        setData({ ...data, patient: { ...data.patient, dob, age: computeAge(dob) } })
                      }}
                    />
                  </div>
                  <div>
                    <Label>Age <span className="text-xs text-muted-foreground font-normal">(auto)</span></Label>
                    <Input value={data.patient.age} readOnly placeholder="—" className="bg-muted/50 cursor-not-allowed" />
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <Select value={data.patient.gender} onValueChange={(v) => setData({ ...data, patient: { ...data.patient, gender: v } })}>
                      <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Occupation</Label>
                    <Input value={data.patient.occupation} onChange={(e) => setData({ ...data, patient: { ...data.patient, occupation: e.target.value } })} placeholder="Software Engineer" />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Phone Number</Label>
                    <div className="flex gap-2">
                      <Select
                        value={data.patient.countryCode}
                        onValueChange={(v) => setData({ ...data, patient: { ...data.patient, countryCode: v, phone: `${v} ${data.patient.phoneNumber}`.trim() } })}
                      >
                        <SelectTrigger className="w-[145px] shrink-0"><SelectValue /></SelectTrigger>
                        <SelectContent className="max-h-[280px]">
                          {COUNTRY_CODES.map((c) => (
                            <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="tel"
                        inputMode="numeric"
                        value={data.patient.phoneNumber}
                        onChange={(e) => {
                          const num = e.target.value.replace(/[^0-9]/g, '')
                          setData({ ...data, patient: { ...data.patient, phoneNumber: num, phone: `${data.patient.countryCode} ${num}`.trim() } })
                        }}
                        placeholder="9876543210"
                        className="flex-1"
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Default country code is +91 (India). Change from the dropdown if needed.</div>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Email (optional)</Label>
                    <Input type="email" value={data.patient.email} onChange={(e) => setData({ ...data, patient: { ...data.patient, email: e.target.value } })} placeholder="you@example.com" />
                  </div>
                </div>
              </div>
            )}
            {step === 2 && (
              <div>
                <StepHeader step={2} total={total} title="Past Medical History & Symptoms" subtitle="Select all that apply" />
                <Label className="mb-2 block font-semibold">Past Medical History</Label>
                <CheckboxGrid options={MEDICAL_HISTORY} values={data.medicalHistory} onChange={updateMedicalHistory} />
                {data.medicalHistory.includes('Other') && (
                  <div className="mt-4">
                    <Label>Specify other medical history</Label>
                    <Input
                      value={data.customMedicalHistory}
                      onChange={(e) => setData({ ...data, customMedicalHistory: e.target.value })}
                      placeholder="Type your medical history here"
                    />
                  </div>
                )}

                <Label className="mt-6 mb-2 block font-semibold">Symptoms</Label>
                <CheckboxGrid options={SYMPTOMS} values={data.symptoms} onChange={updateSymptoms} />
                {data.symptoms.includes('Other') && (
                  <div className="mt-4">
                    <Label>Specify other symptoms</Label>
                    <Input
                      value={data.customSymptoms}
                      onChange={(e) => setData({ ...data, customSymptoms: e.target.value })}
                      placeholder="Type your symptom here"
                    />
                  </div>
                )}
              </div>
            )}
            {step === 3 && (
              <div>
                <StepHeader step={3} total={total} title="Ocular History" subtitle="Your eye-related history" />
                <CheckboxGrid options={OCULAR_HISTORY} values={data.ocularHistory} onChange={updateOcularHistory} />
                {data.ocularHistory.includes('Other') && (
                  <div className="mt-4">
                    <Label>Specify other ocular history</Label>
                    <Input
                      value={data.customOcularHistory}
                      onChange={(e) => setData({ ...data, customOcularHistory: e.target.value })}
                      placeholder="Type the eye condition here"
                    />
                  </div>
                )}
              </div>
            )}
            {step === 4 && (
              <div>
                <StepHeader step={4} total={total} title="Digital Usage" subtitle="How you spend time on screens each day" />

                {/* Total display */}
                <div className="mb-5 flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg shadow-sky-500/20">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest opacity-90">Total Daily Screen Time</div>
                    <div className="text-3xl font-extrabold">{totalScreenTime}<span className="text-lg font-semibold opacity-80"> hrs / day</span></div>
                  </div>
                  <Monitor className="w-9 h-9 opacity-70" />
                </div>

                {/* Compact device sliders */}
                <Label className="mb-2 block font-semibold text-sm">Hours per Device (0–10h)</Label>
                <div className="rounded-2xl border border-border bg-white/50 dark:bg-white/5 divide-y divide-border overflow-hidden mb-6">
                  {DEVICES.map((d) => {
                    const h = data.deviceHours[d] || 0
                    const icon = { Mobile: '📱', Computer: '🖥️', Laptop: '💻', Tablet: '📲', Television: '📺' }[d]
                    return (
                      <div key={d} className="flex items-center gap-3 px-4 py-2.5 hover:bg-sky-50/40 dark:hover:bg-white/5 transition">
                        <span className="text-base w-6">{icon}</span>
                        <span className="w-24 text-sm font-medium">{d}</span>
                        <div className="flex-1 max-w-[300px]">
                          <Slider
                            value={[h]}
                            onValueChange={(v) => setData({ ...data, deviceHours: { ...data.deviceHours, [d]: v[0] } })}
                            min={0} max={10} step={1}
                          />
                        </div>
                        <span className={`text-sm font-bold tabular-nums w-10 text-right ${h > 0 ? 'text-sky-600 dark:text-sky-400' : 'text-muted-foreground'}`}>{h}h</span>
                      </div>
                    )
                  })}
                </div>

                {/* Usage Types */}
                <Label className="mb-2 block font-semibold text-sm">What do you use your screens for? <span className="text-muted-foreground font-normal">(select all)</span></Label>
                <CheckboxGrid options={USAGE_TYPES} values={data.usageTypes} onChange={(v) => setData({ ...data, usageTypes: v })} />
              </div>
            )}
            {step === 5 && (
              <div>
                <StepHeader step={5} total={total} title="Eye Capture" subtitle="Capture both eyes using your camera (optional but recommended)" />
                <div className="grid md:grid-cols-2 gap-4">
                  <EyeCapture label="Left Eye" image={data.eyeImages.left} setImage={(img) => setData({ ...data, eyeImages: { ...data.eyeImages, left: img } })} />
                  <EyeCapture label="Right Eye" image={data.eyeImages.right} setImage={(img) => setData({ ...data, eyeImages: { ...data.eyeImages, right: img } })} />
                </div>
              </div>
            )}
            {step === 6 && (
              <div>
                <StepHeader step={6} total={total} title="Review & Submit" subtitle="Confirm details and get your AI analysis" />
                <div className="space-y-3 text-sm">
                  <div className="glass rounded-2xl p-4"><b>Patient:</b> {data.patient.fullName || 'N/A'} • Age {data.patient.age || 'N/A'} • {data.patient.gender || 'N/A'}</div>
                  <div className="glass rounded-2xl p-4"><b>Symptoms ({data.symptoms.length}):</b> {formatOtherEntries(data.symptoms, data.customSymptoms).join(', ') || 'None'}</div>
                  <div className="glass rounded-2xl p-4"><b>Medical History:</b> {formatOtherEntries(data.medicalHistory, data.customMedicalHistory).join(', ') || 'None'}</div>
                  <div className="glass rounded-2xl p-4"><b>Ocular History:</b> {formatOtherEntries(data.ocularHistory, data.customOcularHistory).join(', ') || 'None'}</div>
                  <div className="glass rounded-2xl p-4"><b>Screen Time:</b> {totalScreenTime}h/day total • {activeDevices.length ? activeDevices.map((d) => d + ' (' + data.deviceHours[d] + 'h)').join(', ') : 'No devices'}</div>
                {(data.eyeImages.left || data.eyeImages.right) && (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {['left','right'].map((side) => (
                      <div key={side} className="rounded-3xl overflow-hidden border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950/30 scan-frame">
                        <div className="px-4 py-3 text-xs uppercase tracking-[0.24em] text-muted-foreground">{side === 'left' ? 'Left Eye' : 'Right Eye'}</div>
                        {data.eyeImages[side] ? (
                          <img src={data.eyeImages[side]} alt={side + ' eye'} className="w-full h-48 object-cover" />
                        ) : (
                          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">{side === 'left' ? 'Left eye not captured' : 'Right eye not captured'}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {submitting && (
                  <div className="mt-5 rounded-3xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-900 scan-frame">
                    <div className="font-semibold">Scanning captured eye images and preparing your AI analysis...</div>
                  </div>
                )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-10">
          <Button variant="outline" onClick={prev} disabled={step === 1}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          {step < total ? (
            <Button onClick={next} className="btn-primary-grad">Next <ArrowRight className="w-4 h-4 ml-1" /></Button>
          ) : (
            <Button onClick={submit} disabled={submitting} className="btn-primary-grad">
              {submitting ? 'Analyzing...' : (<span><Sparkles className="w-4 h-4 mr-1" /> Run AI Analysis</span>)}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

function ScoreRing({ score, color }) {
  const colorMap = { green: '#10b981', yellow: '#f59e0b', orange: '#f97316', red: '#ef4444' }
  const stroke = colorMap[color] || '#0ea5e9'
  const data = [{ name: 'score', value: score, fill: stroke }]
  return (
    <div className="relative w-56 h-56">
      <ResponsiveContainer>
        <RadialBarChart innerRadius="75%" outerRadius="100%" data={data} startAngle={90} endAngle={90 - (score / 100) * 360}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar dataKey="value" cornerRadius={30} background={{ fill: 'rgba(148,163,184,0.15)' }} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-5xl font-extrabold" style={{ color: stroke }}>{score}%</div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Eye Health</div>
      </div>
    </div>
  )
}

function ResultPage({ result, setView }) {
  const [generating, setGenerating] = useState(false)
  if (!result) {
    return <div className="container mx-auto p-10 text-center">No result available. <Button onClick={() => setView('home')}>Go Home</Button></div>
  }
  const r = result.result
  const colorMap = { green: '#10b981', yellow: '#f59e0b', orange: '#f97316', red: '#ef4444' }
  const sevColor = colorMap[r.color]

  const symptomPie = (result.symptoms || []).map((s) => ({ name: s, value: 1 }))
  const PIE_COLORS = ['#0ea5e9', '#06b6d4', '#22d3ee', '#0891b2', '#38bdf8', '#67e8f9', '#0284c7', '#22c55e', '#f59e0b', '#f97316', '#8b5cf6', '#ec4899']

  const deviceData = ['Mobile','Computer','Laptop','Tablet','Television'].map((d) => ({
    name: d, hours: result.deviceHours?.[d] || 0
  }))

  const generatePDF = async () => {
    setGenerating(true)
    try {
      const [{ default: jsPDF }, QRCodeLib] = await Promise.all([
        import('jspdf'),
        import('qrcode'),
      ])
      const doc = new jsPDF({ unit: 'pt', format: 'a4' })
      const W = doc.internal.pageSize.getWidth()
      const H = doc.internal.pageSize.getHeight()
      const MARGIN = 40
      let y = 0

      const P = {
        primary: [14, 116, 191],       // deep clinical blue
        primaryLight: [219, 234, 254],
        accent: [8, 145, 178],         // cyan
        ink: [15, 23, 42],
        muted: [100, 116, 139],
        line: [203, 213, 225],
        greenBg: [220, 252, 231], greenFg: [22, 101, 52],
        yellowBg: [254, 249, 195], yellowFg: [113, 63, 18],
        orangeBg: [255, 237, 213], orangeFg: [124, 45, 18],
        redBg: [254, 226, 226], redFg: [153, 27, 27],
      }
      const sevPalette = { green: [P.greenBg, P.greenFg], yellow: [P.yellowBg, P.yellowFg], orange: [P.orangeBg, P.orangeFg], red: [P.redBg, P.redFg] }

      const setColor = (fn, c) => fn(c[0], c[1], c[2])
      const line = (yy) => { setColor(doc.setDrawColor.bind(doc), P.line); doc.setLineWidth(0.5); doc.line(MARGIN, yy, W - MARGIN, yy) }
      const ensureSpace = (need) => { if (y + need > H - 60) { addFooter(); doc.addPage(); y = 40; drawHeaderMini() } }

      const drawHeaderMini = () => {
        setColor(doc.setFillColor.bind(doc), P.primary)
        doc.rect(0, 0, W, 4, 'F')
        setColor(doc.setTextColor.bind(doc), P.muted)
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8)
        doc.text('DESP Solutions · Medical Assessment Report', MARGIN, 25)
        doc.text(`Report ID: ${result.id.slice(0, 8).toUpperCase()}`, W - MARGIN, 25, { align: 'right' })
        y = 50
      }

      const addFooter = (pageNum) => {
        const yy = H - 40
        setColor(doc.setDrawColor.bind(doc), P.line); doc.setLineWidth(0.5); doc.line(MARGIN, yy, W - MARGIN, yy)
        setColor(doc.setTextColor.bind(doc), P.muted); doc.setFont('helvetica','normal'); doc.setFontSize(8)
        doc.text('DESP Solutions · AI-Powered Digital Eye Strain Screening', MARGIN, yy + 15)
        doc.text(`Page ${pageNum}`, W - MARGIN, yy + 15, { align: 'right' })
      }

      const sectionTitle = (t) => {
        ensureSpace(30)
        y += 10
        setColor(doc.setDrawColor.bind(doc), P.primary); doc.setLineWidth(3)
        doc.line(MARGIN, y, MARGIN + 18, y)
        setColor(doc.setTextColor.bind(doc), P.ink); doc.setFont('helvetica', 'bold'); doc.setFontSize(13)
        doc.text(t.toUpperCase(), MARGIN + 25, y + 4)
        y += 18
      }

      const kvRow = (label, value, col = 0, cols = 2) => {
        const colW = (W - MARGIN * 2) / cols
        const x = MARGIN + col * colW
        setColor(doc.setTextColor.bind(doc), P.muted); doc.setFont('helvetica', 'bold'); doc.setFontSize(8)
        doc.text(label.toUpperCase(), x, y)
        setColor(doc.setTextColor.bind(doc), P.ink); doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5)
        doc.text(String(value || '—'), x, y + 13)
      }

      // ===== LETTERHEAD =====
      setColor(doc.setFillColor.bind(doc), P.primary)
      doc.rect(0, 0, W, 140, 'F')
      setColor(doc.setTextColor.bind(doc), [255, 255, 255])
      doc.setFont('helvetica', 'bold'); doc.setFontSize(28)
      doc.text('DESP SOLUTIONS', W / 2, 40, { align: 'center' })
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10)
      doc.text('Professional Digital Eye Strain Screening', W / 2, 58, { align: 'center' })
      doc.setFont('helvetica', 'italic'); doc.setFontSize(9)
      doc.text('Clinical Assessment Report', W / 2, 74, { align: 'center' })
      setColor(doc.setDrawColor.bind(doc), [255, 255, 255])
      doc.setLineWidth(2)
      doc.ellipse(W / 2, 105, 28, 14, 'S')
      doc.circle(W / 2, 105, 5, 'F')
      doc.line(W / 2 - 12, 105, W / 2 + 12, 105)

      doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
      const dt = new Date(result.createdAt)
      doc.text(`Report Date: ${dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`, W - MARGIN, 40, { align: 'right' })
      doc.text(`Report Time: ${dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`, W - MARGIN, 55, { align: 'right' })
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10)
      doc.text(`ID: ${result.id.slice(0, 8).toUpperCase()}`, W - MARGIN, 72, { align: 'right' })

      y = 150

      // ===== PATIENT INFO =====
      sectionTitle('Patient Information')
      const p = result.patient || {}
      // 2-column card
      setColor(doc.setFillColor.bind(doc), P.primaryLight)
      doc.roundedRect(MARGIN, y, W - MARGIN * 2, 105, 6, 6, 'F')
      const startY = y + 18
      y = startY; kvRow('Full Name', p.fullName, 0); kvRow('Age / Gender', `${p.age || '—'} / ${p.gender || '—'}`, 1)
      y += 32; kvRow('Date of Birth', p.dob, 0); kvRow('Occupation', p.occupation, 1)
      y += 32; kvRow('Phone', p.phone, 0); kvRow('Email', p.email, 1)
      y = startY + 100

      // ===== ASSESSMENT SUMMARY =====
      sectionTitle('AI Assessment Summary')
      const [sevBg, sevFg] = sevPalette[r.color] || [P.primaryLight, P.primary]
      // score circle placeholder
      setColor(doc.setFillColor.bind(doc), sevBg)
      doc.roundedRect(MARGIN, y, W - MARGIN * 2, 100, 6, 6, 'F')
      setColor(doc.setTextColor.bind(doc), sevFg)
      doc.setFont('helvetica','bold'); doc.setFontSize(38)
      doc.text(`${r.score}%`, MARGIN + 30, y + 55)
      doc.setFontSize(9); doc.setFont('helvetica','normal')
      doc.text('EYE HEALTH SCORE', MARGIN + 30, y + 72)

      setColor(doc.setTextColor.bind(doc), P.ink)
      doc.setFont('helvetica','bold'); doc.setFontSize(14)
      doc.text(r.severity, MARGIN + 150, y + 30)
      doc.setFont('helvetica','normal'); doc.setFontSize(10)
      doc.text(`Severity Grade: Level ${r.level} of 4`, MARGIN + 150, y + 46)
      doc.setFontSize(9); setColor(doc.setTextColor.bind(doc), P.muted)
      doc.text('AI Diagnosis:', MARGIN + 150, y + 62)
      setColor(doc.setTextColor.bind(doc), P.ink); doc.setFont('helvetica','bold'); doc.setFontSize(9.5)
      const diagText = r.diagnosis.join(' · ')
      doc.text(doc.splitTextToSize(diagText, W - MARGIN - 170), MARGIN + 150, y + 76)
      y += 115

      // ===== CLINICAL HISTORY =====
      sectionTitle('Clinical History')
      const historyRows = [
        ['Past Medical History', result.medicalHistory?.join(', ') || 'None reported'],
        ['Ocular / Eye History', result.ocularHistory?.join(', ') || 'None reported'],
        ['Presenting Symptoms', result.symptoms?.join(', ') || 'None reported'],
      ]
      historyRows.forEach(([label, val]) => {
        ensureSpace(45)
        setColor(doc.setDrawColor.bind(doc), P.line); doc.setLineWidth(0.5)
        doc.line(MARGIN, y, W - MARGIN, y)
        y += 10
        setColor(doc.setTextColor.bind(doc), P.muted); doc.setFont('helvetica','bold'); doc.setFontSize(8.5)
        doc.text(label.toUpperCase(), MARGIN, y)
        setColor(doc.setTextColor.bind(doc), P.ink); doc.setFont('helvetica','normal'); doc.setFontSize(10)
        const wrapped = doc.splitTextToSize(val, W - MARGIN * 2)
        doc.text(wrapped, MARGIN, y + 14)
        y += 14 + wrapped.length * 12 + 5
      })

      // ===== DIGITAL USAGE =====
      sectionTitle('Digital Device Exposure Analysis')
      const dh = result.deviceHours || {}
      const totalHours = Object.values(dh).reduce((a, b) => a + Number(b || 0), 0)
      setColor(doc.setFillColor.bind(doc), P.primaryLight)
      doc.roundedRect(MARGIN, y, W - MARGIN * 2, 30, 4, 4, 'F')
      setColor(doc.setTextColor.bind(doc), P.primary); doc.setFont('helvetica','bold'); doc.setFontSize(11)
      doc.text(`Total Daily Screen Time: ${totalHours} hours/day`, MARGIN + 12, y + 20)
      y += 42

      // per-device rows with bars
      ;['Mobile','Computer','Laptop','Tablet','Television'].forEach((d) => {
        ensureSpace(24)
        const h = Number(dh[d] || 0)
        setColor(doc.setTextColor.bind(doc), P.ink); doc.setFont('helvetica','normal'); doc.setFontSize(10)
        doc.text(d, MARGIN, y + 10)
        // bar bg
        setColor(doc.setFillColor.bind(doc), [241, 245, 249])
        doc.roundedRect(MARGIN + 110, y + 3, 300, 10, 3, 3, 'F')
        if (h > 0) {
          setColor(doc.setFillColor.bind(doc), P.primary)
          doc.roundedRect(MARGIN + 110, y + 3, (h / 10) * 300, 10, 3, 3, 'F')
        }
        doc.setFont('helvetica','bold'); doc.setFontSize(9.5)
        doc.text(`${h} h`, MARGIN + 420, y + 11)
        y += 20
      })

      // ===== CLINICAL RECOMMENDATIONS =====
      sectionTitle('Clinical Recommendations & Treatment Plan')
      // If high severity and refractive error detected, add focused refractive check note
      if (r.level > 2 && (r.diagnosis || []).includes('Refractive Error')) {
        ensureSpace(56)
        setColor(doc.setFillColor.bind(doc), [255, 244, 229])
        doc.roundedRect(MARGIN, y, W - MARGIN * 2, 44, 6, 6, 'F')
        setColor(doc.setTextColor.bind(doc), P.ink); doc.setFont('helvetica','bold'); doc.setFontSize(11)
        doc.text('Refractive Error Alert: Urgent refraction recommended', MARGIN + 12, y + 16)
        setColor(doc.setTextColor.bind(doc), P.muted); doc.setFont('helvetica','normal'); doc.setFontSize(9)
        doc.text('This assessment suggests significant refractive error contributing to symptoms. Recommend a formal refraction and corrective lenses as appropriate.', MARGIN + 12, y + 30)
        y += 56
      }
      r.recommendations.forEach((rec, idx) => {
        const info = getRecommendationInfo(rec)
        const cardH = 60
        ensureSpace(cardH + 8)
        setColor(doc.setFillColor.bind(doc), [248, 250, 252])
        setColor(doc.setDrawColor.bind(doc), P.line); doc.setLineWidth(0.5)
        doc.roundedRect(MARGIN, y, W - MARGIN * 2, cardH, 5, 5, 'FD')
        // number badge
        setColor(doc.setFillColor.bind(doc), P.primary)
        doc.circle(MARGIN + 15, y + 18, 9, 'F')
        setColor(doc.setTextColor.bind(doc), [255,255,255]); doc.setFont('helvetica','bold'); doc.setFontSize(10)
        doc.text(String(idx + 1), MARGIN + 15, y + 21, { align: 'center' })
        // title
        setColor(doc.setTextColor.bind(doc), P.ink); doc.setFont('helvetica','bold'); doc.setFontSize(11)
        doc.text(rec, MARGIN + 32, y + 18)
        // category chip (right)
        setColor(doc.setFillColor.bind(doc), P.primaryLight)
        const catW = doc.getTextWidth(info.category) + 12
        doc.roundedRect(W - MARGIN - catW - 6, y + 10, catW, 14, 7, 7, 'F')
        setColor(doc.setTextColor.bind(doc), P.primary); doc.setFont('helvetica','bold'); doc.setFontSize(7.5)
        doc.text(info.category.toUpperCase(), W - MARGIN - catW / 2 - 6, y + 19, { align: 'center' })
        // one-line action
        setColor(doc.setTextColor.bind(doc), P.muted); doc.setFont('helvetica','normal'); doc.setFontSize(9)
        const action = doc.splitTextToSize(info.summary, W - MARGIN * 2 - 45)
        doc.text(action[0] || '', MARGIN + 32, y + 33)
        // frequency chip
        setColor(doc.setFillColor.bind(doc), [219, 234, 254])
        const freqLabel = `Frequency: ${info.frequency}`
        const fw = doc.getTextWidth(freqLabel) + 14
        doc.roundedRect(MARGIN + 32, y + 42, fw, 12, 5, 5, 'F')
        setColor(doc.setTextColor.bind(doc), P.primary); doc.setFont('helvetica','bold'); doc.setFontSize(8)
        doc.text(freqLabel, MARGIN + 39, y + 50)
        y += cardH + 6
      })

      // ===== EYE IMAGES =====
      if (result.eyeImages?.left || result.eyeImages?.right) {
        ensureSpace(180)
        sectionTitle('Ocular Photography')
        try {
          if (result.eyeImages.left) {
            doc.addImage(result.eyeImages.left, 'JPEG', MARGIN, y, 240, 135)
            setColor(doc.setTextColor.bind(doc), P.muted); doc.setFont('helvetica','bold'); doc.setFontSize(8)
            doc.text('LEFT EYE (OS)', MARGIN, y + 148)
          }
          if (result.eyeImages.right) {
            doc.addImage(result.eyeImages.right, 'JPEG', MARGIN + 270, y, 240, 135)
            setColor(doc.setTextColor.bind(doc), P.muted); doc.setFont('helvetica','bold'); doc.setFontSize(8)
            doc.text('RIGHT EYE (OD)', MARGIN + 270, y + 148)
          }
        } catch (e) {}
        y += 160
      }

      // ===== DOCTOR NOTES =====
      ensureSpace(140)
      sectionTitle('Doctor’s Notes & Consultation')
      setColor(doc.setDrawColor.bind(doc), P.line)
      for (let i = 0; i < 4; i++) { doc.line(MARGIN, y + i * 18 + 10, W - MARGIN, y + i * 18 + 10) }
      y += 80
      setColor(doc.setTextColor.bind(doc), P.muted); doc.setFont('helvetica','normal'); doc.setFontSize(8.5)
      doc.text('Attending Physician Signature: __________________________', MARGIN, y + 5)
      doc.text('Date: ______________________', W - MARGIN - 160, y + 5)
      y += 25

      // ===== QR + FOOTER FINAL PAGE =====
      ensureSpace(120)
      try {
        const qrUrl = `${window.location.origin}/?report=${result.id}`
        const qrData = await QRCodeLib.toDataURL(qrUrl, { width: 200, margin: 1, color: { dark: '#0e74bf', light: '#ffffff' } })
        doc.addImage(qrData, 'PNG', W - MARGIN - 90, y, 90, 90)
        setColor(doc.setTextColor.bind(doc), P.muted); doc.setFont('helvetica','normal'); doc.setFontSize(8)
        doc.text('Scan to verify report online', W - MARGIN - 90, y + 100)
        // disclaimer intentionally omitted per user request
      } catch (e) {}

      // finalize all pages footer and ensure PDF has exactly 3 pages
      const desiredPages = 3
      let pageCount = doc.internal.getNumberOfPages()
      if (pageCount < desiredPages) {
        for (let i = pageCount + 1; i <= desiredPages; i++) {
          doc.addPage()
        }
        pageCount = desiredPages
      }
      if (pageCount > desiredPages && typeof doc.deletePage === 'function') {
        for (let i = pageCount; i > desiredPages; i--) {
          doc.deletePage(i)
        }
        pageCount = desiredPages
      }
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        addFooter(i)
      }

      doc.save(`EyeStrain-Report-${p.fullName?.replace(/\s+/g, '_') || 'patient'}-${result.id.slice(0,8)}.pdf`)
      toast.success('Professional PDF report generated!')
    } catch (e) {
      console.error(e)
      toast.error('PDF generation failed: ' + e.message)
    } finally { setGenerating(false) }
  }

  return (
    <div className="container mx-auto px-4 py-10 md:py-14">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Refractive error alert (UI) */}
        {r.level > 2 && (r.diagnosis || []).includes('Refractive Error') && (
          <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <strong>Refractive Error Detected:</strong> This assessment suggests a significant refractive contribution. A formal refraction is recommended as part of follow-up care.
          </div>
        )}
        {r.level > 2 && (
          <div className="mb-6 rounded-3xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800 dark:border-orange-600 dark:bg-orange-950/20 dark:text-orange-200">
            <strong>Warning:</strong> Your assessment is above Level 2. This indicates a higher risk profile, and additional clinical follow-up is recommended.
            <div className="mt-2 text-sm text-orange-900 dark:text-orange-200">Remaining report details and follow-up care recommendations are included in the downloadable professional PDF.</div>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <Badge className="mb-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20">Assessment Complete</Badge>
            <h1 className="text-3xl md:text-4xl font-bold">Your Eye Health Report</h1>
            <p className="text-muted-foreground">Report ID: {result.id.slice(0, 8)} • {new Date(result.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.print()}><Printer className="w-4 h-4 mr-1" />Print</Button>
            <Button onClick={generatePDF} disabled={generating} className="btn-primary-grad">
              <Download className="w-4 h-4 mr-1" />{generating ? 'Generating...' : 'Download PDF'}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
          <Card className="glass-strong rounded-3xl p-6 flex flex-col items-center justify-center lg:col-span-1">
            <ScoreRing score={r.score} color={r.color} />
            <div className="mt-4 text-center">
              <div className="text-lg font-bold" style={{ color: sevColor }}>{r.severity}</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Level {r.level} / 4</div>
            </div>
          </Card>

          <Card className="glass-strong rounded-3xl p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4"><AlertCircle className="w-5 h-5 text-sky-600" /><h3 className="font-bold text-lg">Severity Gauge</h3></div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { level: 1, label: 'Mild', color: '#10b981' },
                { level: 2, label: 'Moderate', color: '#f59e0b' },
                { level: 3, label: 'High', color: '#f97316' },
                { level: 4, label: 'Severe', color: '#ef4444' },
              ].map((s) => (
                <div key={s.level} className={`rounded-2xl p-4 text-center transition-all ${r.level === s.level ? 'scale-105 shadow-xl' : 'opacity-40'}`}
                  style={{ backgroundColor: r.level === s.level ? s.color + '22' : 'transparent', border: `2px solid ${r.level === s.level ? s.color : 'transparent'}` }}>
                  <div className="text-3xl font-black" style={{ color: s.color }}>L{s.level}</div>
                  <div className="text-sm font-semibold">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <div className="font-semibold mb-2">Diagnosis</div>
              <div className="flex flex-wrap gap-2">
                {r.diagnosis.map((d) => (
                  <Badge key={d} className="bg-sky-100 text-sky-700 dark:bg-sky-500/20 border border-sky-200 dark:border-sky-500/30">{d}</Badge>
                ))}
              </div>
            </div>
          </Card>

          <Card className="glass-strong rounded-3xl p-6">
            <h3 className="font-bold text-lg mb-4">Symptoms Distribution</h3>
            {symptomPie.length ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={symptomPie} innerRadius={45} outerRadius={85} dataKey="value" paddingAngle={3}>
                    {symptomPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="text-sm text-muted-foreground">No symptoms reported</div>}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {symptomPie.map((s, i) => (
                <div key={s.name} className="flex items-center gap-1 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span>{s.name}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="glass-strong rounded-3xl p-6 lg:col-span-2">
            <h3 className="font-bold text-lg mb-4">Digital Device Usage (est. hours/day)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deviceData}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: 12 }} />
                <Bar dataKey="hours" radius={[8, 8, 0, 0]} fill="url(#g1)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="glass-strong rounded-3xl p-6 lg:col-span-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-cyan-600" />
              <h3 className="font-bold text-lg">Personalized Clinical Recommendations</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-5">Evidence-based interventions tailored to your assessment. Share these with your eye-care professional.</p>
            <div className="grid md:grid-cols-2 gap-4">
              {r.recommendations.map((rec, i) => {
                const info = getRecommendationInfo(rec)
                const catColor = {
                  Exercises: 'from-emerald-500 to-teal-500',
                  Medication: 'from-sky-500 to-blue-500',
                  Optical: 'from-cyan-500 to-teal-500',
                  Clinical: 'from-rose-500 to-red-500',
                  Lifestyle: 'from-violet-500 to-purple-500',
                  Ergonomics: 'from-amber-500 to-orange-500',
                  Nutrition: 'from-lime-500 to-green-500',
                  General: 'from-slate-500 to-gray-500',
                }[info.category] || 'from-sky-500 to-cyan-500'
                return (
                  <div key={i} className="p-5 rounded-2xl bg-white/70 dark:bg-white/5 border border-white/60 dark:border-white/10 shadow-sm">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${catColor} flex items-center justify-center flex-shrink-0 shadow-md`}>
                        <Check className="w-5 h-5 text-white" strokeWidth={3} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="font-bold text-sm md:text-base">{rec}</div>
                          <Badge className="bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200 text-[10px] uppercase tracking-wider">{info.category}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{info.summary}</div>
                      </div>
                    </div>
                    {info.details.length > 0 && (
                      <ul className="ml-13 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                        {info.details.map((d, j) => (
                          <li key={j} className="flex items-start gap-2">
                            <span className="text-sky-500 mt-0.5">▸</span><span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-sky-700 dark:text-sky-300">
                      <Zap className="w-3 h-3" /> {info.frequency}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {(result.eyeImages?.left || result.eyeImages?.right) && (
            <Card className="glass-strong rounded-3xl p-6 lg:col-span-3">
              <h3 className="font-bold text-lg mb-4">Captured Eye Images</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {result.eyeImages.left && (
                  <div><div className="text-sm font-semibold mb-2">Left Eye</div>
                    <img src={result.eyeImages.left} alt="left eye" className="w-full rounded-2xl border border-white/30" /></div>
                )}
                {result.eyeImages.right && (
                  <div><div className="text-sm font-semibold mb-2">Right Eye</div>
                    <img src={result.eyeImages.right} alt="right eye" className="w-full rounded-2xl border border-white/30" /></div>
                )}
              </div>
            </Card>
          )}
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" onClick={() => setView('home')}>Back to Home</Button>
        </div>
      </motion.div>
    </div>
  )
}

function Processing({ result, setView }) {
  useEffect(() => {
    const t = setTimeout(() => setView('result'), 1800)
    return () => clearTimeout(t)
  }, [setView])
  if (!result) return <div className="container mx-auto p-10 text-center">No result available.</div>
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <div className="max-w-xl mx-auto">
        <div className="mb-6">
          <div className="h-48 rounded-2xl overflow-hidden scan-frame bg-black/5 flex items-center justify-center">
            {(result.eyeImages?.left || result.eyeImages?.right) ? (
              <div className="grid grid-cols-2 gap-4 p-6">
                {result.eyeImages.left && <img src={result.eyeImages.left} className="w-full h-36 object-cover rounded-lg" />}
                {result.eyeImages.right && <img src={result.eyeImages.right} className="w-full h-36 object-cover rounded-lg" />}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No eye images to analyze</div>
            )}
          </div>
        </div>
        <h3 className="text-2xl font-bold mb-2">Analyzing captured images</h3>
        <p className="text-sm text-muted-foreground mb-6">Our AI is reviewing your images and preparing the clinical report. This usually takes a few seconds.</p>
        <div className="mx-auto w-48 h-48">
          <div className="scan-frame w-full h-full rounded-full bg-gradient-to-br from-sky-400 to-cyan-400 animate-pulse-ring" />
        </div>
      </div>
    </div>
  )
}

function Admin({ setView }) {
  const [authState, setAuthState] = useState('checking') // checking | out | in
  const [userInfo, setUserInfo] = useState(null)
  const [stats, setStats] = useState(null)
  const [list, setList] = useState([])
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [selectedDetail, setSelectedDetail] = useState(null)
  const [loginError, setLoginError] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // Check session on mount
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then((d) => {
        if (d.authenticated) { setAuthState('in'); setUserInfo(d) }
        else setAuthState('out')
      })
      .catch(() => setAuthState('out'))
  }, [])

  // Load data once authenticated
  const refreshAdminData = async () => {
    try {
      const statsRes = await fetch('/api/stats', { credentials: 'include' })
      if (statsRes.ok) setStats(await statsRes.json())
    } catch (e) {
      console.error('Failed to refresh stats', e)
    }
    try {
      const listRes = await fetch('/api/assessments', { credentials: 'include' })
      if (listRes.ok) setList(await listRes.json())
    } catch (e) {
      console.error('Failed to refresh assessment list', e)
    }
  }

  useEffect(() => {
    if (authState !== 'in') return
    refreshAdminData()
  }, [authState])

  useEffect(() => {
    const handleNewAssessment = () => {
      if (authState === 'in') refreshAdminData()
    }
    window.addEventListener('assessment:completed', handleNewAssessment)
    return () => window.removeEventListener('assessment:completed', handleNewAssessment)
  }, [authState])

  useEffect(() => {
    if (!selectedId) { setSelectedDetail(null); return }
    fetch(`/api/assessments/${selectedId}`, { credentials: 'include' }).then(r => r.json()).then(setSelectedDetail).catch(() => {})
  }, [selectedId])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setUserInfo(null); setAuthState('out'); setList([]); setStats(null)
    toast.success('Signed out')
  }

  const [syncing, setSyncing] = useState(false)
  const syncSheets = async () => {
    setSyncing(true)
    try {
      const res = await fetch('/api/sync', { method: 'POST', credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Sync failed')
      if (data.success === false) throw new Error(data.error || 'Sync failed')
      const msg = data.added > 0
        ? `✅ Synced ${data.added} new row(s) to Google Sheets (${data.skipped} already there)`
        : `✔️ Google Sheets already up to date (${data.skipped} rows in sync)`
      toast.success(msg)
    } catch (e) {
      toast.error('Sync error: ' + e.message)
    } finally { setSyncing(false) }
  }

  if (authState === 'checking') {
    return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Checking session…</div>
  }

  if (authState === 'out') {
    return (
      <div className="container mx-auto px-4 py-20 max-w-md">
        <Card className="glass-strong rounded-3xl p-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-sky-500/30">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-1">Admin Portal</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">Restricted access — sign in with your admin username and password</p>
          <div className="space-y-4 mb-3">
            <div>
              <Label>Username</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button onClick={async () => {
              setLoginError('')
              try {
                const res = await fetch('/api/auth/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ username, password }),
                })
                const data = await res.json()
                if (res.ok) {
                  setUserInfo(data); setAuthState('in')
                  toast.success(`Welcome, ${data.username}`)
                } else {
                  setLoginError(data.error || 'Invalid credentials')
                  toast.error(data.error || 'Invalid credentials')
                }
              } catch (e) {
                setLoginError('Login failed. Please try again.')
              }
            }} className="w-full btn-primary-grad">Sign in</Button>
          </div>
          {loginError && (
            <div className="text-sm text-red-600 dark:text-red-400 text-center mb-3 p-2 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
              🔒 {loginError}
            </div>
          )}
          <Button variant="ghost" className="w-full mt-2" onClick={() => setView('home')}>Back to Home</Button>
        </Card>
      </div>
    )
  }

  const filtered = list.filter((a) => {
    if (dateFilter) {
      const d = new Date(a.createdAt).toISOString().slice(0, 10)
      if (d !== dateFilter) return false
    }
    if (!search) return true
    const s = search.toLowerCase()
    return a.patient?.fullName?.toLowerCase().includes(s) || a.patient?.phone?.includes(s) || a.id?.includes(s)
  })

  const todayStr = new Date().toISOString().slice(0, 10)
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  const sevData = (stats?.severity || []).map((s) => ({ name: `Level ${s._id}`, count: s.count }))
  const SEV_COLORS = ['#10b981', '#f59e0b', '#f97316', '#ef4444']

  const badgeStyle = (color) => {
    const bg = { green: '#d1fae5', yellow: '#fef3c7', orange: '#ffedd5', red: '#fee2e2' }
    const fg = { green: '#065f46', yellow: '#92400e', orange: '#9a3412', red: '#991b1b' }
    return { backgroundColor: bg[color] || '#e0f2fe', color: fg[color] || '#075985' }
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <Badge className="mb-2 bg-sky-100 text-sky-700 dark:bg-sky-500/20">Admin Dashboard</Badge>
          <h1 className="text-3xl font-bold">Clinic Overview</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {userInfo && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-sky-200 dark:border-sky-500/20">
              <div className="text-xs">
                <div className="font-semibold">{userInfo.username || 'Admin'}</div>
                <div className="text-muted-foreground">Private Dashboard</div>
              </div>
            </div>
          )}
          <Button onClick={syncSheets} disabled={syncing} className="btn-primary-grad">
            {syncing ? 'Syncing…' : (<><Sparkles className="w-4 h-4 mr-1" /> Sync to Sheets</>)}
          </Button>
          <Button variant="outline" onClick={logout}>Sign out</Button>
          <Button variant="outline" onClick={() => setView('home')}>Back</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Patients', value: stats?.total ?? '—', icon: Users, color: 'from-sky-500 to-cyan-500' },
          { label: "Today's Patients", value: stats?.todayCount ?? '—', icon: TrendingUp, color: 'from-emerald-500 to-teal-500' },
          { label: 'Avg Eye Score', value: stats?.avgScore ? `${stats.avgScore}%` : '—', icon: Activity, color: 'from-blue-500 to-indigo-500' },
          { label: 'Severe Cases', value: stats?.severity?.find(s => s._id === 4)?.count || 0, icon: AlertCircle, color: 'from-orange-500 to-red-500' },
        ].map((c) => (
          <Card key={c.label} className="glass-strong rounded-3xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center`}>
                <c.icon className="w-5 h-5 text-white" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold">{c.value}</div>
            <div className="text-sm text-muted-foreground">{c.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <Card className="glass-strong rounded-3xl p-6 lg:col-span-1">
          <h3 className="font-bold mb-4">Severity Distribution</h3>
          {sevData.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={sevData} innerRadius={50} outerRadius={90} dataKey="count">
                  {sevData.map((_, i) => <Cell key={i} fill={SEV_COLORS[i % SEV_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="text-sm text-muted-foreground">No data yet</div>}
        </Card>
        <Card className="glass-strong rounded-3xl p-6 lg:col-span-2">
          <h3 className="font-bold mb-4">Recent Assessments</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={list.slice(0, 15).reverse().map((a, i) => ({ i: i + 1, score: a.result?.score || 0 }))}>
              <XAxis dataKey="i" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="score" radius={[6, 6, 0, 0]} fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="glass-strong rounded-3xl p-6">
        <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
          <h3 className="font-bold">Patient List <span className="text-sm font-normal text-muted-foreground">({filtered.length}{dateFilter ? ` on ${dateFilter}` : ''})</span></h3>
          <Input placeholder="Search by name, phone, or ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        </div>
        <div className="flex items-center gap-2 mb-4 flex-wrap p-3 rounded-2xl bg-sky-50/50 dark:bg-white/5 border border-sky-100 dark:border-white/10">
          <div className="text-sm font-semibold text-sky-700 dark:text-sky-300 mr-1">📅 Filter by date:</div>
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-auto h-9 text-sm"
            max={todayStr}
          />
          <Button size="sm" variant={dateFilter === todayStr ? 'default' : 'outline'} onClick={() => setDateFilter(todayStr)} className={dateFilter === todayStr ? 'btn-primary-grad h-9' : 'h-9'}>Today</Button>
          <Button size="sm" variant={dateFilter === yesterdayStr ? 'default' : 'outline'} onClick={() => setDateFilter(yesterdayStr)} className={dateFilter === yesterdayStr ? 'btn-primary-grad h-9' : 'h-9'}>Yesterday</Button>
          {dateFilter && (
            <Button size="sm" variant="ghost" onClick={() => setDateFilter('')} className="h-9">Clear filter ✕</Button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground border-b">
              <tr><th className="text-left py-3">Name</th><th className="text-left">Age</th><th className="text-left">Score</th><th className="text-left">Severity</th><th className="text-left">Date</th></tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} onClick={() => setSelectedId(a.id)} className="border-b border-white/10 hover:bg-sky-50 dark:hover:bg-white/10 cursor-pointer transition">
                  <td className="py-3 font-medium">{a.patient?.fullName || 'Anonymous'}</td>
                  <td>{a.patient?.age || '-'}</td>
                  <td className="font-bold">{a.result?.score}%</td>
                  <td><Badge style={badgeStyle(a.result?.color)}>{a.result?.severity}</Badge></td>
                  <td className="text-muted-foreground">{new Date(a.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">No assessments yet. Submit a survey to see data.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Patient Detail Modal */}
      {selectedId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-auto" onClick={() => setSelectedId(null)}>
          <div className="glass-strong rounded-3xl max-w-4xl w-full my-8 p-6 md:p-8" onClick={(e) => e.stopPropagation()}>
                    {!selectedDetail ? (
                    <div className="text-center py-10">Loading patient record…</div>
                  ) : (
              <>
                <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
                  <div>
                          <Badge className="mb-2 bg-sky-100 text-sky-700 dark:bg-sky-500/20">Patient Record · {(selectedDetail?.id || '').slice(0,8).toUpperCase()}</Badge>
                    <h2 className="text-2xl font-bold">{selectedDetail.patient?.fullName || 'Anonymous'}</h2>
                    <p className="text-sm text-muted-foreground">{new Date(selectedDetail.createdAt).toLocaleString()}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedId(null)}>Close</Button>
                </div>

                {/* Patient info */}
                <Card className="glass rounded-2xl p-5 mb-4">
                  <h3 className="font-bold mb-3 text-sm uppercase tracking-wider text-sky-700 dark:text-sky-300">Personal Information</h3>
                  <div className="grid md:grid-cols-3 gap-3 text-sm">
                    {[
                      ['Full Name', selectedDetail.patient?.fullName],
                      ['Date of Birth', selectedDetail.patient?.dob],
                      ['Age', selectedDetail.patient?.age],
                      ['Gender', selectedDetail.patient?.gender],
                      ['Occupation', selectedDetail.patient?.occupation],
                      ['Phone', selectedDetail.patient?.phone],
                      ['Email', selectedDetail.patient?.email],
                    ].map(([k, v]) => (
                      <div key={k}><div className="text-xs uppercase text-muted-foreground">{k}</div><div className="font-medium">{v || '—'}</div></div>
                    ))}
                  </div>
                </Card>

                {/* History */}
                <div className="grid md:grid-cols-3 gap-3 mb-4">
                  <Card className="glass rounded-2xl p-4">
                    <h4 className="text-xs uppercase tracking-wider text-sky-700 dark:text-sky-300 font-bold mb-2">Medical History</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedDetail.medicalHistory?.length ? selectedDetail.medicalHistory.map((s) => <Badge key={s} variant="secondary">{s}</Badge>) : <span className="text-sm text-muted-foreground">None</span>}
                    </div>
                  </Card>
                  <Card className="glass rounded-2xl p-4">
                    <h4 className="text-xs uppercase tracking-wider text-sky-700 dark:text-sky-300 font-bold mb-2">Symptoms</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedDetail.symptoms?.length ? selectedDetail.symptoms.map((s) => <Badge key={s} className="bg-amber-100 text-amber-700 dark:bg-amber-500/20">{s}</Badge>) : <span className="text-sm text-muted-foreground">None</span>}
                    </div>
                  </Card>
                  <Card className="glass rounded-2xl p-4">
                    <h4 className="text-xs uppercase tracking-wider text-sky-700 dark:text-sky-300 font-bold mb-2">Ocular History</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedDetail.ocularHistory?.length ? selectedDetail.ocularHistory.map((s) => <Badge key={s} variant="secondary">{s}</Badge>) : <span className="text-sm text-muted-foreground">None</span>}
                    </div>
                  </Card>
                </div>

                {/* Digital usage */}
                <Card className="glass rounded-2xl p-5 mb-4">
                  <h4 className="text-xs uppercase tracking-wider text-sky-700 dark:text-sky-300 font-bold mb-3">Digital Device Usage · Total {selectedDetail.screenTime}h/day</h4>
                  <div className="space-y-2">
                    {['Mobile','Computer','Laptop','Tablet','Television'].map((d) => {
                      const h = selectedDetail.deviceHours?.[d] || 0
                      return (
                        <div key={d} className="flex items-center gap-3 text-sm">
                          <div className="w-24">{d}</div>
                          <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-sky-500 to-cyan-500" style={{ width: `${(h/10)*100}%` }} />
                          </div>
                          <div className="w-12 text-right font-semibold">{h}h</div>
                        </div>
                      )
                    })}
                  </div>
                </Card>

                {/* AI Result */}
                <Card className="glass rounded-2xl p-5 mb-4" style={badgeStyle(selectedDetail.result?.color)}>
                  <h4 className="text-xs uppercase tracking-wider font-bold mb-2 opacity-70">AI Assessment Result</h4>
                  <div className="flex items-center gap-6 flex-wrap">
                    <div>
                      <div className="text-4xl font-black">{selectedDetail.result?.score}%</div>
                      <div className="text-xs opacity-70">EYE HEALTH SCORE</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{selectedDetail.result?.severity}</div>
                      <div className="text-xs opacity-70">Level {selectedDetail.result?.level} / 4</div>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <div className="text-xs opacity-70 mb-1">Diagnosis</div>
                      <div className="font-semibold text-sm">{selectedDetail.result?.diagnosis?.join(' · ')}</div>
                    </div>
                  </div>
                </Card>

                {/* Recommendations */}
                <Card className="glass rounded-2xl p-5 mb-4">
                  <h4 className="text-xs uppercase tracking-wider text-sky-700 dark:text-sky-300 font-bold mb-3">AI Recommendations</h4>
                  <ol className="list-decimal list-inside space-y-1.5 text-sm">
                    {selectedDetail.result?.recommendations?.map((rec, i) => <li key={i}>{rec}</li>)}
                  </ol>
                </Card>

                {/* Eye images if present */}
                {(selectedDetail.eyeImages?.left || selectedDetail.eyeImages?.right) && (
                  <Card className="glass rounded-2xl p-5">
                    <h4 className="text-xs uppercase tracking-wider text-sky-700 dark:text-sky-300 font-bold mb-3">Ocular Photography</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {selectedDetail.eyeImages.left && <div><div className="text-xs font-semibold mb-1">Left Eye (OS)</div><img src={selectedDetail.eyeImages.left} alt="left" className="rounded-xl w-full" /></div>}
                      {selectedDetail.eyeImages.right && <div><div className="text-xs font-semibold mb-1">Right Eye (OD)</div><img src={selectedDetail.eyeImages.right} alt="right" className="rounded-xl w-full" /></div>}
                    </div>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function App() {
  const [view, setView] = useState('home')
  const [result, setResult] = useState(null)

  return (
    <div className="min-h-screen">
      <Nav setView={setView} />
      <AnimatePresence mode="wait">
        <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          {view === 'home' && <Home setView={setView} />}
          {view === 'survey' && <Survey setView={setView} setResult={setResult} />}
          {view === 'processing' && <Processing result={result} setView={setView} />}
          {view === 'result' && <ResultPage result={result} setView={setView} />}
          {view === 'admin' && <Admin setView={setView} />}
        </motion.div>
      </AnimatePresence>
      <footer className="border-t border-white/30 dark:border-white/10 py-6 mt-10 text-center text-xs text-muted-foreground">
        <div className="container mx-auto px-4">
          © DESP Solutions · AI-Powered Digital Eye Strain Screening · For educational purposes only, not a substitute for professional medical advice.
        </div>
      </footer>
    </div>
  )
}

export default App
