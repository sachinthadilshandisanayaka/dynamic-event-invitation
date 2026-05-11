import { useState, useEffect } from 'react'

interface Props {
  targetDate?: string
  timezone?: string
  endedMessage?: string
  bgColor?: string
  textColor?: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  state: 'upcoming' | 'live' | 'ended'
}

function calcTimeLeft(targetDate: string): TimeLeft {
  if (!targetDate) return { days: 0, hours: 0, minutes: 0, seconds: 0, state: 'upcoming' }
  const diff = new Date(targetDate).getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, state: 'ended' }
  const days = Math.floor(diff / 86_400_000)
  const hours = Math.floor((diff % 86_400_000) / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000) / 60_000)
  const seconds = Math.floor((diff % 60_000) / 1_000)
  return { days, hours, minutes, seconds, state: 'upcoming' }
}

function Digit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="flex items-center justify-center rounded-2xl font-bold shadow-lg"
        style={{
          width: 'clamp(60px, 14vw, 112px)',
          height: 'clamp(60px, 14vw, 112px)',
          fontSize: 'clamp(1.5rem, 5vw, 3rem)',
          backgroundColor: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(4px)',
        }}
      >
        {String(value).padStart(2, '0')}
      </div>
      <span className="mt-2 text-fluid-xs uppercase tracking-widest opacity-80">{label}</span>
    </div>
  )
}

export function CountdownTimer({
  targetDate,
  timezone,
  endedMessage = 'The event has started!',
  bgColor = '#1e1b4b',
  textColor = '#ffffff',
}: Props) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calcTimeLeft(targetDate || ''))

  useEffect(() => {
    if (!targetDate) return
    const interval = setInterval(() => setTimeLeft(calcTimeLeft(targetDate)), 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  return (
    <div
      className="px-fluid flex flex-col items-center justify-center"
      style={{
        fontFamily: 'var(--font-heading, inherit)',
        backgroundColor: bgColor,
        color: textColor,
        paddingTop: 'clamp(4rem, 10vw, 6rem)',
        paddingBottom: 'clamp(4rem, 10vw, 6rem)',
      }}
    >
      {timeLeft.state === 'ended' ? (
        <div className="text-center">
          <div className="text-5xl mb-4">🎉</div>
          <p className="text-2xl font-semibold">{endedMessage}</p>
        </div>
      ) : (
        <>
          {!targetDate && (
            <p className="text-sm opacity-60 mb-8">Set a target date in the editor</p>
          )}
          <div className="flex items-center gap-[clamp(0.5rem,3vw,2rem)]">
            <Digit value={timeLeft.days} label="Days" />
            <span className="text-4xl font-bold opacity-60 mb-6">:</span>
            <Digit value={timeLeft.hours} label="Hours" />
            <span className="text-4xl font-bold opacity-60 mb-6">:</span>
            <Digit value={timeLeft.minutes} label="Minutes" />
            <span className="text-4xl font-bold opacity-60 mb-6">:</span>
            <Digit value={timeLeft.seconds} label="Seconds" />
          </div>
          {timezone && (
            <p className="mt-6 text-xs opacity-50">{timezone}</p>
          )}
        </>
      )}
    </div>
  )
}
