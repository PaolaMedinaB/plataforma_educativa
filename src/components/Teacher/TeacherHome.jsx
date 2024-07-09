import { useEffect, useState } from "react";
import UserHeader from "../User/UserHeader.jsx";
import TeacherSubjects from "./TeacherSubjects.jsx";
import TutoringSessions from "./TutoringSessions.jsx";

function TeacherHome() {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
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
          <TeacherSubjects />
          <hr />
          <h4>Tutorias</h4>
          <TutoringSessions />
        </main>
      </div>
    </>
  );
}

export default TeacherHome;
