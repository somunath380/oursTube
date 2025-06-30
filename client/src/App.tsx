import { BrowserRouter as Router } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Home from './pages/Home';
import './App.css';
import { AuthProvider } from './hooks/useAuth';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Home />
      </Router>
    </AuthProvider>
  );
}

export default App;
