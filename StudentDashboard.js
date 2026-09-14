// ===============================
// Student Dashboard Version 2
// ===============================

// Student Array
let studentList = [];

// Inputs
const nameInput = document.getElementById("name");
const ageInput = document.getElementById("age");
const courseInput = document.getElementById("course");

const addStudentBtn = document.getElementById("addStudentBtn");

const students = document.getElementById("students");

// Button Event
addStudentBtn.addEventListener("click", addStudent);

// ===============================
// Add Student
// ===============================

function addStudent(){

    const student={

        name:nameInput.value.trim(),

        age:ageInput.value.trim(),

        course:courseInput.value.trim()

    };

    if(student.name=="" || student.age=="" || student.course==""){

        alert("Please fill all fields.");

        return;

    }

    studentList.push(student);

    renderStudents();

    clearInputs();

}

function renderStudents() {

    students.innerHTML = "";

    studentList.forEach(function(student, index) {

        const card = document.createElement("div");

        card.classList.add("student-card");

        card.innerHTML = `
            <h3>👨‍🎓 ${student.name}</h3>

            <p>🎂 Age : ${student.age}</p>

            <p>📚 Course : ${student.course}</p>

            <button class="edit-btn">✏ Edit</button>

            <button class="delete-btn">🗑 Delete</button>
        `;

        // Delete Button
        const deleteBtn = card.querySelector(".delete-btn");

        deleteBtn.addEventListener("click", function () {

            studentList.splice(index, 1);

            renderStudents();

        });

        students.appendChild(card);

    });

}