import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-dark-900 px-6 text-center">
          <p className="mb-2 text-lg font-semibold text-white">Something went wrong</p>
          <p className="mb-4 max-w-md text-sm text-slate-400">{this.state.error.message}</p>
          <button
            type="button"
            className="btn-primary text-sm"
            onClick={() => {
              localStorage.removeItem('splitly_auth');
              localStorage.removeItem('splitly_token');
              window.location.href = '/';
            }}
          >
            Clear session & reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
