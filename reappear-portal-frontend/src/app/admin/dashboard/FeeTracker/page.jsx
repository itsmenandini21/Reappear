"use client"
import React from 'react';
import './feeTracker.css';

const FeeTracker = () => {
  const feeData = [
    {
      semester: "1st Semester",
      branches: [
        {
          name: "COMPUTER SCIENCE (CSE)",
          students: [
            { id: 1, name: "Aryan Kulshrestha", roll: "122103044", unpaid: ["Applied Physics", "Manufacturing Processes", "Mathematics-I"] },
            { id: 2, name: "Ishan Sharma", roll: "122103055", unpaid: ["Programming in C", "Digital Electronics"] }
          ]
        },
        {
          name: "INFORMATION TECHNOLOGY (IT)",
          students: [
            { id: 3, name: "Rahul Verma", roll: "122103099", unpaid: ["Communication Skills", "EE-101"] },
            { id: 4, name: "Simran Kaur", roll: "122103102", unpaid: ["Operating Systems", "Microprocessors"] }
          ]
        }
      ]
    },
    {
      semester: "2nd Semester",
      branches: [
        {
          name: "ELECTRONICS (ECE)",
          students: [
            { id: 5, name: "Jatin Dev", roll: "122103088", unpaid: ["Circuit Theory"] }
          ]
        }
      ]
    }
  ];
  
  return (
    
    <div className="ft-main-wrapper">
      {feeData.map((sem, sIndex) => (
        <div key={sIndex} className="ft-sem-wrapper">
          <div className="ft-sem-indicator">
            <div className="ft-sem-tag">{sem.semester}</div>
            <div className="ft-header-divider"></div>
          </div>

          {sem.branches.map((branch, bIdx) => (
            <div key={bIdx} className="ft-branch-group">
              <h3 className="ft-branch-label">{branch.name}</h3>
              
              <div className="ft-vertical-list">
                {branch.students.map((student) => (
                  <div key={student.id} className="ft-student-card">
                    {/* Upper Part */}
                    <div className="ft-card-header">
                      <div className="ft-name-roll">
                        <span className="ft-student-name">{student.name}</span>
                        <span className="ft-student-roll">{student.roll}</span>
                      </div>
                      <button className="ft-mail-action">📩</button>
                    </div>

                    {/* Lower Expandable Part (Dropdown now inside frame) */}
                    <div className="ft-subject-panel">
                      <div className="ft-panel-title">Pending Fees:</div>
                      <div className="ft-sub-container">
                        {student.unpaid.map((sub, i) => (
                          <div key={i} className="ft-sub-entry">
                            <span className="ft-sub-bullet"></span> {sub}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default FeeTracker;