// ClassList.jsx

import React, { useEffect, useState } from "react";
import ClassCard from "./ClassCard.jsx";
import { getClasses } from "../../../backend/config/db.js"; // Adjust the path as per your project structure

const ClassList = () => {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const data = await getClasses();
      setClasses(data);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  return (
    <div className="container d-flex flex-wrap justify-content-center">
      {classes.map((classData) => (
        <ClassCard
          key={classData.id}
          subject={classData.subject_name}
          teacher={`Teacher ID: ${classData.teacher}`}
          location={`Location Preference: ${classData.location}`}
          price={`Price Per Hour: $${classData.price}`}
        />
      ))}
    </div>
  );
};

export default ClassList;
