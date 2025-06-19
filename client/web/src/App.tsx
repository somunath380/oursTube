import { BrowserRouter as Router } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Home from './pages/Home';
import './App.css';

function App() {
  return (
    <Router>
      <Home />
    </Router>
  );
}

export default App;
