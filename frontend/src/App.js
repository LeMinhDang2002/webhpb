import { Route } from 'react-router-dom';
import './App.css';
import Chatpage from './pages/Chatpage';
import Homepage from './pages/Homepage';

function App() {
  return (
    <div className="App">
      <Route path='/' component={Homepage} exact /> {/* đường dẫn hiển thị trang home */}
      <Route path='/chats' component={Chatpage} /> {/* đường dẫn hiển thị trang chat */}
    </div>
  )
}

export default App;
