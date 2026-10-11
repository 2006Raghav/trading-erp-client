import { ArrowLeft, LayoutDashboard } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { CSSProperties } from 'react'
import './NotFoundPage.css'

function Stars() {
  return (
    <div className="not-found-stars" aria-hidden="true">
      {Array.from({ length: 28 }, (_, index) => (
        <i key={index} style={{ '--star-index': index } as CSSProperties} />
      ))}
    </div>
  )
}

function Clouds() {
  return (
    <div className="not-found-clouds" aria-hidden="true">
      {Array.from({ length: 11 }, (_, index) => (
        <i key={index} style={{ '--cloud-index': index } as CSSProperties} />
      ))}
    </div>
  )
}

function NightIllustration() {
  return (
    <svg
      className="not-found-illustration not-found-night"
      viewBox="0 0 260 190"
      role="img"
      aria-label="A planet among stars"
    >
      <circle className="not-found-orbit" cx="130" cy="97" r="78" />
      <path className="not-found-orbit-dash" d="M48 115c35 42 126 52 169-7" />
      <circle className="not-found-planet" cx="130" cy="97" r="50" />
      <ellipse className="not-found-planet-shade" cx="151" cy="84" rx="26" ry="34" />
      <circle className="not-found-crater-large" cx="110" cy="82" r="10" />
      <circle className="not-found-crater" cx="151" cy="112" r="8" />
      <circle className="not-found-crater" cx="103" cy="119" r="5" />
      <circle className="not-found-crater" cx="145" cy="65" r="5" />
      <path
        className="not-found-sparkle"
        d="M42 51l3 8 8 3-8 3-3 8-3-8-8-3 8-3zM211 119l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"
      />
    </svg>
  )
}

function DayIllustration() {
  return (
    <svg
      className="not-found-illustration not-found-day"
      viewBox="0 0 260 190"
      role="img"
      aria-label="A bright sun behind clouds"
    >
      <g className="not-found-rays">
        <path d="M130 18v17M130 155v17M51 96h18M191 96h18M74 40l12 12M174 140l12 12M186 40l-12 12M86 140l-12 12" />
      </g>
      <circle className="not-found-sun " cx="130" cy="95" r="45" />
    </svg>
  )
}

export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <main className="not-found-page">
      <Stars />
      <Clouds />
      <section className="not-found-content" aria-labelledby="not-found-title">
        <p className="not-found-eyebrow">Navigation exception</p>
        <h1 id="not-found-title">404</h1>
        <h2>This page is off the trade route.</h2>
        <p className="not-found-copy">
          The address does not point to an available workspace. Return to the previous page or
          continue to your dashboard.
        </p>
        <div className="not-found-art" aria-hidden="true">
          <NightIllustration />
          <DayIllustration />
        </div>
        <div className="not-found-actions">
          <button type="button" className="not-found-secondary" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} strokeWidth={1.5} />
            Go back
          </button>
          <button
            type="button"
            className="not-found-primary"
            onClick={() => navigate('/dashboard')}
          >
            <LayoutDashboard size={16} strokeWidth={1.5} />
            Go to dashboard
          </button>
        </div>
      </section>
    </main>
  )
}
