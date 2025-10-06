import { useEffect } from "react"

export function useAutoScroll<T extends HTMLElement>(
  messages: unknown[],
  isChatOpen: boolean,
  endRef: React.MutableRefObject<T | null>
) {
  useEffect(() => {
    if (endRef.current && isChatOpen) {
      endRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages, isChatOpen, endRef])
}




