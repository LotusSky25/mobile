import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || "Unexpected app error.",
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("UI crash captured by ErrorBoundary", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "1rem" }}>
          <h2>Something went wrong</h2>
          <p>
            The page could not be rendered. If this happened after a database
            request, check Firestore permissions.
          </p>
          <p>Details: {this.state.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
