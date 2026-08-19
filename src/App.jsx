import { Routes, Route } from 'react-router-dom';
import { Loginpage } from './login';
import { Home } from './home';
import { Employees } from './employees';
import { AddEmployee } from './addemployee';
import { Profile } from './profile';
import { Voting } from './voting';
import { LeaderboardPage } from './leaderboard';
import { EditEmployee } from './editemployee';
import axios from 'axios';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Loginpage />} />
      <Route path="/home" element={<Home />} />
      <Route path="/employees" element={<Employees />} />
      <Route path='/add-employee' element={< AddEmployee />}/>
      <Route path='/profile' element={< Profile />}/>
      <Route path='/votes' element={<Voting />}/>
      <Route path='/leaderboard' element={<LeaderboardPage />}></Route>
      <Route path='/edit-employee/:id' element={<EditEmployee />}></Route>
    </Routes>
  );
}

export default App;