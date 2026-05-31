import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || "Unknown screen error" };
  }

  componentDidCatch(error, info) {
    console.error("Shadow Syndicate screen error", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="panel error-boundary-panel">
        <p className="kicker">Screen Guard</p>
        <h2>The city hit a bad screen.</h2>
        <p className="soft-text">The app stayed alive instead of going white screen. Reload the page or go back to Home.</p>
        <small>{this.state.message}</small>
        <button className="primary" type="button" onClick={() => window.location.reload()}>Reload Game</button>
      </div>
    );
  }
}
