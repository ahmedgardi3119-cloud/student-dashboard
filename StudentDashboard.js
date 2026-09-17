// ===============================
// Advanced Background Animation
// Particle network with mouse interaction
// ===============================

(function initBackgroundAnimation() {

    const canvas = document.getElementById("bg-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    let width, height, particles;

    const PARTICLE_COUNT = 90;
    const MAX_LINK_DIST = 140;
    const MOUSE_LINK_DIST = 180;

    const mouse = { x: null, y: null };

    const colors = ["#9333ea", "#4f46e5", "#22d3ee", "#e879f9"];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.6;
            this.vy = (Math.random() - 0.5) * 0.6;
            this.radius = Math.random() * 2 + 1;
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }
        step() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    function createParticles() {
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(new Particle());
        }
    }

    function linkParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < MAX_LINK_DIST) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(147, 51, 234, ${1 - dist / MAX_LINK_DIST})`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }

            // Link to mouse position
            if (mouse.x !== null) {
                const dx = particles[i].x - mouse.x;
                const dy = particles[i].y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < MOUSE_LINK_DIST) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(34, 211, 238, ${1 - dist / MOUSE_LINK_DIST})`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(function (p) {
            p.step();
            p.draw();
        });

        linkParticles();

        requestAnimationFrame(animate);
    }

    window.addEventListener("resize", function () {
        resize();
        createParticles();
    });

    window.addEventListener("mousemove", function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener("mouseout", function () {
        mouse.x = null;
        mouse.y = null;
    });

    resize();
    createParticles();
    animate();

})();

// ===============================
// Student Dashboard Version 3
// Now backed by PostgreSQL via the Express API
// ===============================

// Change this to your deployed backend URL once it's hosted
// (e.g. "https://your-app.up.railway.app/api/students")
const API_URL = "http://localhost:5000/api/students";

// Inputs
const nameInput = document.getElementById("name");
const ageInput = document.getElementById("age");
const courseInput = document.getElementById("course");

const addStudentBtn = document.getElementById("addStudentBtn");

const students = document.getElementById("students");

// Tracks which student is currently being edited (null = adding a new one)
let editingId = null;

// Button Event
addStudentBtn.addEventListener("click", handleFormSubmit);

// ===============================
// Load all students from the database
// ===============================

async function loadStudents() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Failed to load students.");
        const studentList = await res.json();
        renderStudents(studentList);
    } catch (err) {
        console.error(err);
        students.innerHTML = `<p>⚠ Could not connect to the server. Is the backend running?</p>`;
    }
}

// ===============================
// Add or Update (depending on editingId)
// ===============================

async function handleFormSubmit() {

    const student = {
        name: nameInput.value.trim(),
        age: ageInput.value.trim(),
        course: courseInput.value.trim()
    };

    if (student.name === "" || student.age === "" || student.course === "") {
        alert("Please fill all fields.");
        return;
    }

    try {
        if (editingId === null) {
            // Create new student
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(student)
            });
            if (!res.ok) throw new Error("Failed to add student.");
        } else {
            // Update existing student
            const res = await fetch(`${API_URL}/${editingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(student)
            });
            if (!res.ok) throw new Error("Failed to update student.");

            editingId = null;
            addStudentBtn.textContent = "Add Student";
        }

        clearInputs();
        loadStudents();

    } catch (err) {
        console.error(err);
        alert("Something went wrong talking to the server.");
    }
}

// ===============================
// Delete a student
// ===============================

async function deleteStudent(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete student.");
        loadStudents();
    } catch (err) {
        console.error(err);
        alert("Could not delete this student.");
    }
}

// ===============================
// Put a student's data into the form for editing
// ===============================

function startEdit(student) {
    nameInput.value = student.name;
    ageInput.value = student.age;
    courseInput.value = student.course;

    editingId = student.id;
    addStudentBtn.textContent = "Update Student";

    nameInput.focus();
}

// ===============================
// Clear the form inputs
// ===============================

function clearInputs() {
    nameInput.value = "";
    ageInput.value = "";
    courseInput.value = "";
}

// ===============================
// Render students to the page
// ===============================

function renderStudents(studentList) {

    students.innerHTML = "";

    if (studentList.length === 0) {
        students.innerHTML = "<p>No students yet. Add one!</p>";
        return;
    }

    studentList.forEach(function (student) {

        const card = document.createElement("div");

        card.classList.add("student-card");

        card.innerHTML = `
            <h3>👨‍🎓 ${student.name}</h3>

            <p>🎂 Age : ${student.age}</p>

            <p>📚 Course : ${student.course}</p>

            <button class="edit-btn">✏ Edit</button>

            <button class="delete-btn">🗑 Delete</button>
        `;

        // Edit Button
        const editBtn = card.querySelector(".edit-btn");
        editBtn.addEventListener("click", function () {
            startEdit(student);
        });

        // Delete Button
        const deleteBtn = card.querySelector(".delete-btn");
        deleteBtn.addEventListener("click", function () {
            deleteStudent(student.id);
        });

        students.appendChild(card);

    });

}

// Load existing students as soon as the page opens
loadStudents();
