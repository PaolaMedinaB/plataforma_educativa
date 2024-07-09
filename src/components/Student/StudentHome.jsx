// StudentHome.jsx

import React, { useEffect, useState } from "react";
import UserHeader from "../User/UserHeader.jsx";
import ClassCard from "../Subjects/ClassCard.jsx";
import axios from 'axios';

const StudentHome = () => {
  const [studentName, setStudentName] = useState('');
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setStudentName(storedUserName);
    }
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/classes');
      console.log("Response from API:", response.data); // Log the response data for debugging
      setClasses(response.data);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setClasses([]); // Set an empty array on error
    }
  };

  return (
    <>
      <UserHeader />
      <main className="container my-4">
        <h2>
          Hola, <b>{studentName}</b>
        </h2>
        <input type="text" className="form-control my-3" placeholder="Buscar clases" />

        <div className="btn-group my-3">
          {/* Add your filter buttons here if needed */}
        </div>

        <div className="container d-flex flex-wrap justify-content-center">
          {classes.map((classData, index) => (
            <ClassCard
              key={index} // Use a unique identifier, like index or classData.teacher_id
              subject={`Specialty: ${classData.specialties}`} // Displaying specialties
              teacher={`Teacher ID: ${classData.teacher_id}`}
              location={`Location Preference: ${classData.location_preference}`}
              price={`Price Per Hour: $${classData.price_per_hour}`}
            />
          ))}
        </div>
      </main>
    </>
  );
};

export default StudentHome;
