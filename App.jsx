import React, {useState} from 'react';

import LoginScreen from './src/screens/LoginScreen';
import TeacherHome from './src/screens/TeacherHome';

export default function App() {
  const [logged, setLogged] = useState(false);

  return logged ? (
    <TeacherHome onLogout={() => setLogged(false)} />
  ) : (
    <LoginScreen onLogin={() => setLogged(true)} />
  );
}