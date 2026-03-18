import React from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <p className="font-medium text-red-600">Something went wrong</p>
          <p className="text-sm text-gray-500">{this.state.error?.message}</p>
          <Button variant="outline" onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
