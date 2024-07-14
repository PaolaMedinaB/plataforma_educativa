import { useEffect, useState } from "react";
import UserHeader from "../User/UserHeader.jsx";
import TeacherSubjects from "./TeacherSubjects.jsx";
import TutoringSessions from "./TutoringSessions.jsx";

function TeacherHome() {
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    const storedUserId = localStorage.getItem('userId');
    
    if (storedUserName) {
      setUserName(storedUserName);
    }
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);
  
  return (
    <>
      <div>
        <UserHeader />
        <main className="container my-4">
          <h2>
            Hola, <b>profe {userName}</b>
          </h2>
          <h3>Mis materias</h3>
          {userId ? <TeacherSubjects userId={userId} /> : <p>Loading...</p>}
          <hr />
          <h4>Tutorias</h4>
          <TutoringSessions />
        </main>
      </div>
    </>
  );
}

export default TeacherHome;
