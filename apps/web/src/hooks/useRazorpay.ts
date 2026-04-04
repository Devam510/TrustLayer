import { useCallback, useEffect, useState } from 'react'

export const useRazorpay = () => {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // If script is already loaded
    if (window.Razorpay) {
      setIsLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => setIsLoaded(true)
    script.onerror = () => console.error('Failed to load Razorpay checkout script.')
    
    document.body.appendChild(script)

    // Cleanup: We typically keep the script loaded to avoid multi-reloads,
    // but if the component unmounts before loading, we could remove it.
    return () => {
      // document.body.removeChild(script) - usually safer to leave it loaded in a SPA
    }
  }, [])

  const initializeRazorpay = useCallback(
    (options: any) => {
      if (!isLoaded) {
        console.error('Razorpay SDK not loaded yet.')
        return
      }

      if (!window.Razorpay) {
        console.error('Razorpay not found on window object.')
        return
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (response: any) {
        console.error('Payment failed', response.error)
        if (options.onPaymentFailure) {
          options.onPaymentFailure(response.error)
        }
      })
      rzp.open()
    },
    [isLoaded]
  )

  return { isLoaded, initializeRazorpay }
}
