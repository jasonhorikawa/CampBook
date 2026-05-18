import React from "react";
import ReactDOM from "react-dom/client";
import CampBook from "./app.jsx";
import "./styles.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  componentDidCatch(error) {
    this.setState({ error });
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 20, fontFamily: "Arial", color: "red" }}>
          <h1>CampBook crashed</h1>
          <pre>{String(this.state.error)}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <CampBook />
  </ErrorBoundary>
);
