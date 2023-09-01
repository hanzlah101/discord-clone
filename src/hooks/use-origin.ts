import * as React from 'react'

export const useOrigin = () => {
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : ''

  if (!isMounted) {
    return ''
  }

  return origin
}
