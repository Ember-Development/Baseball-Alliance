import { useState, useEffect } from 'react'

export function useCountdown(target: Date) {
  const targetMs = target.getTime()
  const [msLeft, setMsLeft] = useState(targetMs - Date.now())

  useEffect(() => {
    const iv = setInterval(() => {
      setMsLeft(targetMs - Date.now())
    }, 1000)
    return () => clearInterval(iv)
  }, [targetMs])

  const days    = Math.floor(msLeft / (1000*60*60*24))
  const hours   = Math.floor((msLeft % (1000*60*60*24)) / (1000*60*60))
  const minutes = Math.floor((msLeft % (1000*60*60))  / (1000*60))
  const seconds = Math.floor((msLeft % (1000*60))      / 1000)

  return { days, hours, minutes, seconds }
}
