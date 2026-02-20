document.addEventListener('DOMContentLoaded', function () {
    // Elements
    const addCourseRowBtn = document.getElementById('addCourseRowBtn');
    const submitCoursesBtn = document.getElementById('submitCoursesBtn');
    const coursesInputTable = document.getElementById('coursesInputTable').getElementsByTagName('tbody')[0];
    const totalCreditHoursDisplay = document.getElementById('totalCreditHours');
    const gpaDisplay = document.getElementById('gpaDisplay');
    const cumulativeGpaDisplay = document.getElementById('cumulativeGpaDisplay');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const coursesTableBody = document.getElementById('coursesTable').querySelector('tbody');

    // App state
    let allCourses = [];
    let undoTimeout;
    let recentlyDeleted = null;

    // Grade letter to point mapping (standard 4.0 scale)
    const gradePointMap = {
        'A+': 4.0, 'A': 4.0, 'A-': 3.67,
        'B+': 3.33, 'B': 3.0, 'B-': 2.67,
        'C+': 2.0, 'C': 1.5, 'C-': 1.0,
        'D+': 1.0, 'D': 1.0, 'F': 0.0
    };

    // --- Theme Management ---
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        themeToggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
        localStorage.setItem('theme', theme);
    }

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    });

    // --- Data Persistence ---
    function saveCourses() {
        localStorage.setItem('allCourses', JSON.stringify(allCourses));
    }

    // Dynamic course input rows
    function addCourseRow() {
        const row = coursesInputTable.insertRow();
        row.innerHTML = `
            <td><input type="text" class="courseName" placeholder="Course Name" /></td>
            <td>
                <select class="courseGrade">
                    <option value="">Grade</option>
                    <option value="A+">A+</option>
                    <option value="A">A</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B">B</option>
                    <option value="B-">B-</option>
                    <option value="C+">C+</option>
                    <option value="C">C</option>
                    <option value="C-">C-</option>
                    <option value="D+">D+</option>
                    <option value="D">D</option>
                    <option value="F">F</option>
                </select>
            </td>
            <td><input type="number" class="courseCredit" placeholder="Credit Hours" min="0" step="0.5" /></td>
            <td><button type="button" class="removeRowBtn" title="Remove">&#10006;</button></td>
        `;
        row.querySelector('.removeRowBtn').onclick = function () {
            row.remove();
        };
    }

    addCourseRowBtn.addEventListener('click', addCourseRow);

    submitCoursesBtn.addEventListener('click', function () {
        const courseRows = coursesInputTable.querySelectorAll('tr');
        let newCourses = [];
        let valid = true;

        courseRows.forEach(row => {
            const name = row.querySelector('.courseName').value.trim();
            const gradeLetter = row.querySelector('.courseGrade').value;
            const credit = parseFloat(row.querySelector('.courseCredit').value);
            const gradePoint = gradePointMap[gradeLetter];

            if (name && gradeLetter && !isNaN(credit) && credit > 0) {
                newCourses.push({ name, grade: gradeLetter, gradePoint, credit });
            } else if (name || gradeLetter || row.querySelector('.courseCredit').value) {
                // If row is partially filled
                valid = false;
            }
        });

        if (!valid) {
            alert('Please fill all fields for courses you have started entering.');
            return;
        }

        if (newCourses.length === 0) {
            alert('Please add at least one course.');
            return;
        }

        allCourses.push(...newCourses);
        saveCourses();

        // Calculate and display GPA
        updateDashboard();

        // Update UI
        coursesInputTable.innerHTML = '';
        addCourseRow();
    });

    function updateDashboard() {
        calculateAndDisplayGPA(allCourses);
        populateTable(allCourses);
        renderChart(allCourses);
    }

    // Display courses and GPA
    function loadCourses() {
        // Load theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        applyTheme(savedTheme);

        // Load courses
        const savedCourses = JSON.parse(localStorage.getItem('allCourses'));
        if (savedCourses) {
            allCourses = savedCourses;
        }
        updateDashboard();
    }

    function animateValue(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const currentValue = progress * (end - start) + start;
            if (element.id === 'totalCreditHours') {
                element.textContent = currentValue.toFixed(1);
            } else {
                element.textContent = currentValue.toFixed(2);
            }
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    function calculateAndDisplayGPA(courses) {
        let totalPoints = 0;
        let totalCredits = 0;
        courses.forEach(c => {
            const gp = parseFloat(c.gradePoint);
            const cr = parseFloat(c.credit);
            if (!isNaN(gp) && !isNaN(cr) && cr > 0) {
                totalPoints += gp * cr;
                totalCredits += cr;
            }
        });
        let gpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;

        const currentGpa = parseFloat(gpaDisplay.textContent.replace(/[^0-9.]/g, '')) || 0;
        const currentCredits = parseFloat(totalCreditHoursDisplay.textContent.replace(/[^0-9.]/g, '')) || 0;

        animateValue(gpaDisplay, currentGpa, gpa, 500);
        animateValue(cumulativeGpaDisplay, currentGpa, gpa, 500);
        animateValue(totalCreditHoursDisplay, currentCredits, totalCredits, 500);
    }

    function populateTable(courses) {
        coursesTableBody.innerHTML = '';
        courses.forEach((c, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${c.name}</td>
                <td>${c.grade}</td>
                <td>${c.gradePoint.toFixed(2)}</td>
                <td>${c.credit.toFixed(1)}</td>
                <td><button class="removeRowBtn" data-index="${index}" title="Delete">&#10006;</button></td>
            `;
            coursesTableBody.appendChild(tr);
        });
    }

    // --- Delete with Undo ---
    coursesTableBody.addEventListener('click', function (e) {
        if (e.target.classList.contains('removeRowBtn')) {
            const index = parseInt(e.target.dataset.index, 10);
            deleteCourse(index);
        }
    });

    function deleteCourse(index) {
        // Store deleted item for possible undo
        recentlyDeleted = { course: allCourses[index], index: index };
        // Remove and persist immediately so refresh reflects deletion
        allCourses.splice(index, 1);
        saveCourses();
        updateDashboard();
        showToast('Course deleted.', true);

        // Allow undo for a short window; if not undone, clear the cache
        undoTimeout = setTimeout(() => {
            recentlyDeleted = null;
        }, 5000);
    }

    function undoDelete() {
        if (recentlyDeleted) {
            clearTimeout(undoTimeout);
            allCourses.splice(recentlyDeleted.index, 0, recentlyDeleted.course);
            // Re-save restored state so undo persists
            saveCourses();
            recentlyDeleted = null;
            updateDashboard();
        }
    }

    function showToast(message, showUndo = false) {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;

        if (showUndo) {
            const undoBtn = document.createElement('button');
            undoBtn.className = 'toast-undo-btn';
            undoBtn.textContent = 'Undo';
            undoBtn.onclick = () => {
                undoDelete();
                toast.remove();
            };
            toast.appendChild(undoBtn);
        }

        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    }


    function renderChart(courses) {
        const ctx = document.getElementById('progressChart').getContext('2d');
        if (window.progressChart) window.progressChart.destroy();
        window.progressChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: courses.map(c => c.name),
                datasets: [{
                    label: 'Grade Point',
                    data: courses.map(c => c.gradePoint),
                    borderColor: 'var(--primary-color)',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 4.0,
                        grid: { color: 'var(--border-color-light)' },
                        ticks: { color: 'var(--text-muted-color)' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: 'var(--text-muted-color)' }
                    }
                }
            }
        });
    }

    // --- Standard GPA Calculator Modal ---
    // Elements
    const stdGpaBtn = document.getElementById('stdGpaBtn');
    const stdGpaModal = document.getElementById('stdGpaModal');
    const stdGpaClose = document.getElementById('stdGpaClose');
    const stdGpaTableBody = document.getElementById('stdGpaTableBody');
    const stdGpaAddRowBtn = document.getElementById('stdGpaAddRowBtn');
    const stdGpaCalcBtn = document.getElementById('stdGpaCalcBtn');
    const stdGpaResult = document.getElementById('stdGpaResult');

    function openStdGpaModal() {
        stdGpaModal.style.display = 'block';
        stdGpaTableBody.innerHTML = '';
        addStdGpaRow();
        stdGpaResult.textContent = '';
    }
    function closeStdGpaModal() {
        stdGpaModal.style.display = 'none';
    }
    stdGpaBtn.addEventListener('click', openStdGpaModal);
    stdGpaClose.addEventListener('click', closeStdGpaModal);
    window.addEventListener('click', function (e) {
        if (e.target === stdGpaModal) closeStdGpaModal();
    });

    function addStdGpaRow() {
        const row = stdGpaTableBody.insertRow();
        row.innerHTML = `
            <td><input type="text" class="stdCourseName" placeholder="Course Name" /></td>
            <td>
                <select class="stdCourseGrade">
                    <option value="">Grade</option>
                    <option value="A+">A+</option>
                    <option value="A">A</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B">B</option>
                    <option value="B-">B-</option>
                    <option value="C+">C+</option>
                    <option value="C">C</option>
                    <option value="C-">C-</option>
                    <option value="D+">D+</option>
                    <option value="D">D</option>
                    <option value="F">F</option>
                </select>
            </td>
            <td><input type="number" class="stdCourseCredit" placeholder="Credit Hours" min="0" step="0.5" /></td>
            <td><button type="button" class="stdRemoveRowBtn" title="Remove">&#10006;</button></td>
        `;
        row.querySelector('.stdRemoveRowBtn').onclick = function () {
            row.remove();
        };
    }
    stdGpaAddRowBtn.addEventListener('click', addStdGpaRow);

    stdGpaCalcBtn.addEventListener('click', function () {
        const names = Array.from(stdGpaTableBody.getElementsByClassName('stdCourseName')).map(i => i.value.trim());
        const grades = Array.from(stdGpaTableBody.getElementsByClassName('stdCourseGrade')).map(i => i.value.trim());
        const credits = Array.from(stdGpaTableBody.getElementsByClassName('stdCourseCredit')).map(i => i.value.trim());
        let valid = true, totalPoints = 0, totalCredits = 0;
        for (let i = 0; i < names.length; i++) {
            const gradePoint = gradePointMap[grades[i]];
            const credit = parseFloat(credits[i]);
            if (!names[i] || !grades[i] || typeof gradePoint === 'undefined' || isNaN(credit) || credit <= 0) {
                valid = false;
                break;
            }
            totalPoints += gradePoint * credit;
            totalCredits += credit;
        }
        if (!valid || totalCredits === 0) {
            stdGpaResult.textContent = 'Please enter valid data for all rows.';
            return;
        }
        const gpa = (totalPoints / totalCredits).toFixed(2);
        stdGpaResult.textContent = `Calculated GPA: ${gpa}`;
    });

    // --- End Standard GPA Calculator Modal ---

    // --- Semester CGPA Calculator Modal ---
    const semCgpaBtn = document.getElementById('semCgpaBtn');
    const semCgpaModal = document.getElementById('semCgpaModal');
    const semCgpaClose = document.getElementById('semCgpaClose');
    const semCgpaTableBody = document.getElementById('semCgpaTableBody');
    const semCgpaAddRowBtn = document.getElementById('semCgpaAddRowBtn');
    const semCgpaCalcBtn = document.getElementById('semCgpaCalcBtn');
    const semCgpaResult = document.getElementById('semCgpaResult');
    const semCountInput = document.getElementById('semCountInput');
    const semGenerateBtn = document.getElementById('semGenerateBtn');

    function openSemCgpaModal() {
        semCgpaModal.style.display = 'block';
        semCgpaTableBody.innerHTML = '';
        addSemRow();
        semCgpaResult.textContent = '';
    }
    function closeSemCgpaModal() {
        semCgpaModal.style.display = 'none';
    }
    semCgpaBtn.addEventListener('click', openSemCgpaModal);
    semCgpaClose.addEventListener('click', closeSemCgpaModal);
    window.addEventListener('click', function (e) {
        if (e.target === semCgpaModal) closeSemCgpaModal();
    });

    function addSemRow(label) {
        const row = semCgpaTableBody.insertRow();
        const semLabel = label || `Semester ${semCgpaTableBody.rows.length + 1}`;
        row.innerHTML = `
            <td><input type="text" class="semLabel" value="${semLabel}" /></td>
            <td><input type="number" class="semGpa" placeholder="GPA" min="0" max="4" step="0.01" /></td>
            <td><input type="number" class="semCredits" placeholder="Credits (optional)" min="0" step="0.5" /></td>
            <td><button type="button" class="stdRemoveRowBtn" title="Remove">&#10006;</button></td>
        `;
        row.querySelector('.stdRemoveRowBtn').onclick = function () { row.remove(); };
    }
    semCgpaAddRowBtn.addEventListener('click', addSemRow);

    semGenerateBtn.addEventListener('click', function () {
        const count = parseInt(semCountInput.value, 10) || 0;
        if (count <= 0) return;
        semCgpaTableBody.innerHTML = '';
        for (let i = 1; i <= count; i++) addSemRow(`Semester ${i}`);
    });

    semCgpaCalcBtn.addEventListener('click', function () {
        const gpaEls = Array.from(semCgpaTableBody.getElementsByClassName('semGpa'));
        const creditEls = Array.from(semCgpaTableBody.getElementsByClassName('semCredits'));
        if (gpaEls.length === 0) {
            semCgpaResult.textContent = 'Add at least one semester.';
            return;
        }
        let totalWeighted = 0, totalCredits = 0, simpleSum = 0, count = 0;
        for (let i = 0; i < gpaEls.length; i++) {
            const gpaVal = parseFloat(gpaEls[i].value);
            const crVal = parseFloat(creditEls[i].value);
            if (isNaN(gpaVal) || gpaVal < 0) {
                semCgpaResult.textContent = 'Please enter valid GPA values for all semesters.';
                return;
            }
            count++;
            simpleSum += gpaVal;
            if (!isNaN(crVal) && crVal > 0) {
                totalWeighted += gpaVal * crVal;
                totalCredits += crVal;
            }
        }
        let result;
        if (totalCredits > 0) {
            result = (totalWeighted / totalCredits).toFixed(3);
            semCgpaResult.textContent = `Weighted CGPA: ${result} (by credits)`;
        } else {
            result = (simpleSum / count).toFixed(3);
            semCgpaResult.textContent = `Unweighted CGPA: ${result} (simple average)`;
        }
    });

    // End Semester CGPA Calculator Modal

    // Initial setup
    addCourseRow();
    loadCourses();
});
