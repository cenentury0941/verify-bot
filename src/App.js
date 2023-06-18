import logo from './logo.svg';
import './App.css';
import VerifyBot from './component/verify-bot';
import Home from './component/home';
import Tutorial from './component/tutorial';
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <header className="App-header">

      <BrowserRouter>
      <Routes>
          <Route path="/verifybot" element={<Home />} />
          <Route path="/verifybot/tutorial" element={<Tutorial />} />
      </Routes>
        <VerifyBot />
      </BrowserRouter>
      </header>
    </div>
  );
}

export default App;
