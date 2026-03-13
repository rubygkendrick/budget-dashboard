import TransactionForm from "./components/TransactionForm";

import "./App.css";

function App() {
  return (
    <div>
      <h1 className="app-title">
        {"budget dashboard".split("").map((char, i) => (
          <span
            key={i}
            className={`app-title__letter app-title__letter--${i % 4}`}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </h1>
      <TransactionForm />
    </div>
  );
}

export default App;
