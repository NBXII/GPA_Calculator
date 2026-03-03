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

    // Grade letter to point mapping
    const defaultGradePointMap = {
        'A+': 4.0, 'A': 4.0, 'A-': 3.67,
        'B+': 3.33, 'B': 3.0, 'B-': 2.67,
        'C+': 2.0, 'C': 1.5, 'C-': 1.0,
        'D+': 1.0, 'D': 1.0, 'F': 0.0
    };
    let gradePointMap = { ...defaultGradePointMap };

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

    function saveGradeMap() {
        localStorage.setItem('gradePointMap', JSON.stringify(gradePointMap));
    }

    function getGradeOptionsHTML(selectedGrade = '') {
        let options = '';
        for (const grade in gradePointMap) {
            options += `<option value="${grade}" ${grade === selectedGrade ? 'selected' : ''}>${grade}</option>`;
        }
        return options;
    }

    function loadGradeMap() {
        const savedMap = localStorage.getItem('gradePointMap');
        if (savedMap) {
            try {
                const parsedMap = JSON.parse(savedMap);
                if (typeof parsedMap === 'object' && parsedMap !== null && Object.keys(parsedMap).length > 0) {
                    gradePointMap = parsedMap;
                } else {
                    gradePointMap = { ...defaultGradePointMap };
                }
            } catch (e) {
                console.error("Error parsing saved grade map, using default.", e);
                gradePointMap = { ...defaultGradePointMap };
            }
        } else {
            gradePointMap = { ...defaultGradePointMap };
        }
    }

    function populateGradeLegendTable() {
        const legendBody = document.getElementById('gradeLegendBody');
        if (!legendBody) return;
        legendBody.innerHTML = '';
        const headerRow = legendBody.insertRow();
        headerRow.innerHTML = `<th>Grade</th><th>Point</th>`;
        // Sort for consistent order
        Object.keys(gradePointMap).sort().forEach(grade => {
            const point = gradePointMap[grade];
            if (typeof point !== 'number') return; // Skip if point is not a number
            const row = legendBody.insertRow();
            row.innerHTML = `<td>${grade}</td><td>${point.toFixed(2)}</td>`;
        });
    }


    // Dynamic course input rows
    function addCourseRow() {
        const row = coursesInputTable.insertRow();
        row.innerHTML = `
            <td><input type="text" class="courseName" placeholder="Course Name" /></td>
            <td>
                <select class="courseGrade">
                    <option value="">Grade</option>
                    ${getGradeOptionsHTML()}
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

        // Load grade scale FIRST, as it's needed for calculations and UI rendering
        loadGradeMap();
        populateGradeLegendTable(); // Populate legend on initial load

        // Load courses
        const savedCourses = JSON.parse(localStorage.getItem('allCourses'));
        if (savedCourses) {
            // Recalculate grade points based on the current (possibly custom) scale
            savedCourses.forEach(c => {
                c.gradePoint = gradePointMap[c.grade] !== undefined ? gradePointMap[c.grade] : 0;
            });
            allCourses = savedCourses;
        }
        updateDashboard();
    }

    // Distinction / classification helper (4.0 scale)
    function getDistinctionLabel(gpa) {
        if (!Number.isFinite(gpa)) return { text: '', cls: '' };
        // Highest label now starts at the previous 3.3 threshold
        if (gpa >= 3.5) return { text: 'Great Distinction', cls: 'dist-first' };
        if (gpa >= 3.0) return { text: 'Distinction', cls: 'dist-upper' };
        if (gpa >= 2.0) return { text: 'Academic Warning', cls: 'dist-lower' };
        return { text: 'Academic Dismissal', cls: 'dist-fail' };
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

        // Update classification badges/texts (non-animated)
        const gpaLevelEl = document.getElementById('gpaLevel');
        const cumulativeLevelEl = document.getElementById('cumulativeLevel');
        if (gpaLevelEl) {
            const label = getDistinctionLabel(gpa);
            gpaLevelEl.innerHTML = label.text ? `<span class="distinction-badge ${label.cls}">${label.text}</span>` : '';
        }
        if (cumulativeLevelEl) {
            const label2 = getDistinctionLabel(gpa);
            cumulativeLevelEl.innerHTML = label2.text ? `<span class="distinction-badge ${label2.cls}">${label2.text}</span>` : '';
        }
    }

    function populateTable(courses) {
        coursesTableBody.innerHTML = '';
        courses.forEach((c, index) => {
            const tr = document.createElement('tr');
            tr.dataset.index = index;
            tr.innerHTML = `
                <td>${c.name}</td>
                <td>${c.grade}</td>
                <td>${c.gradePoint.toFixed(2)}</td>
                <td>${c.credit.toFixed(1)}</td>
                <td>
                    <button class="editRowBtn" title="Edit">&#9998;</button>
                    <button class="removeRowBtn" title="Delete">&#10006;</button>
                </td>
            `;
            tr.style.animationDelay = `${index * 40}ms`; // Staggered animation
            coursesTableBody.appendChild(tr);
        });
    }

    // --- Course Table Actions (Edit/Delete/Undo) ---
    coursesTableBody.addEventListener('click', function (e) {
        const target = e.target;
        const row = target.closest('tr');
        if (!row || !coursesTableBody.contains(row)) return;

        handleCourseAction(target, row);
    });

    function handleCourseAction(target, row) {
        const index = parseInt(row.dataset.index, 10);
        if (isNaN(index)) return;

        if (target.closest('.editRowBtn')) {
            const otherEditingRow = coursesTableBody.querySelector('.is-editing');
            if (otherEditingRow && otherEditingRow !== row) {
                const otherIndex = parseInt(otherEditingRow.dataset.index, 10);
                revertRowToDisplay(otherEditingRow, otherIndex);
            }
            turnRowToEditMode(row, index);
        } else if (target.closest('.removeRowBtn')) {
            deleteCourse(index);
        } else if (target.closest('.saveRowBtn')) {
            saveEditedCourse(row, index);
        } else if (target.closest('.cancelEditBtn')) {
            revertRowToDisplay(row, index);
        }
    }

    function turnRowToEditMode(row, index) {
        const course = allCourses[index];
        row.classList.add('is-editing');

        row.innerHTML = `
            <td><input type="text" class="courseName" value="${course.name}" /></td>
            <td><select class="courseGrade">${getGradeOptionsHTML(course.grade)}</select></td>
            <td>-</td>
            <td><input type="number" class="courseCredit" value="${course.credit}" min="0" step="0.5" /></td>
            <td>
                <button class="saveRowBtn" title="Save">&#10004;</button>
                <button class="cancelEditBtn" title="Cancel">&#10006;</button>
            </td>
        `;
        row.querySelector('input').focus();
    }

    function saveEditedCourse(row, index) {
        const name = row.querySelector('.courseName').value.trim();
        const gradeLetter = row.querySelector('.courseGrade').value;
        const credit = parseFloat(row.querySelector('.courseCredit').value);
        const gradePoint = gradePointMap[gradeLetter];

        if (name && gradeLetter && !isNaN(credit) && credit > 0) {
            allCourses[index] = { name, grade: gradeLetter, gradePoint, credit };
            saveCourses();
            updateDashboard();
        } else {
            alert('Please ensure all fields are filled correctly. Credit hours must be greater than 0.');
        }
    }

    function revertRowToDisplay(row, index) {
        const course = allCourses[index];
        row.classList.remove('is-editing');
        // Re-populate just this one row to its original state
        populateTable(allCourses);
    }

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
        const canvas = document.getElementById('progressChart');
        const placeholder = document.getElementById('progressPlaceholder');
        if (!courses || courses.length === 0) {
            // No data: destroy existing chart, show placeholder
            if (window.progressChart) {
                try { window.progressChart.destroy(); } catch(e){}
                window.progressChart = null;
            }
            canvas.style.display = 'none';
            placeholder.style.display = 'flex';
            return;
        }
        // Has data
        placeholder.style.display = 'none';
        canvas.style.display = '';
        const ctx2 = canvas.getContext('2d');
        if (window.progressChart) window.progressChart.destroy();
        window.progressChart = new Chart(ctx2, {
            type: 'line',
            data: {
                labels: courses.map(c => c.name),
                datasets: [{
                    label: 'Grade Point',
                    data: courses.map(c => c.gradePoint),
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color') || '#0056b3',
                    backgroundColor: 'rgba(0, 123, 255, 0.12)',
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
            const num = parseFloat(result);
            const label = getDistinctionLabel(num);
            semCgpaResult.innerHTML = `Weighted CGPA: ${result} (by credits) <span class="distinction-badge ${label.cls}" style="margin-left:8px">${label.text}</span>`;
        } else {
            result = (simpleSum / count).toFixed(3);
            const num = parseFloat(result);
            const label = getDistinctionLabel(num);
            semCgpaResult.innerHTML = `Unweighted CGPA: ${result} <span class="distinction-badge ${label.cls}" style="margin-left:8px">${label.text}</span>`;
        }
    });

    // End Semester CGPA Calculator Modal

    // --- Grade Scale Customization Modal ---
    const gradeScaleBtn = document.getElementById('gradeScaleBtn');
    const gradeScaleModal = document.getElementById('gradeScaleModal');
    const gradeScaleClose = document.getElementById('gradeScaleClose');
    const gradeScaleTableBody = document.getElementById('gradeScaleTableBody');
    const gradeScaleSaveBtn = document.getElementById('gradeScaleSaveBtn');
    const gradeScaleResetBtn = document.getElementById('gradeScaleResetBtn');

    function openGradeScaleModal() {
        populateGradeScaleEditor();
        gradeScaleModal.style.display = 'block';
    }

    function closeGradeScaleModal() {
        gradeScaleModal.style.display = 'none';
    }

    function populateGradeScaleEditor() {
        gradeScaleTableBody.innerHTML = '';
        Object.keys(gradePointMap).sort().forEach(grade => {
            const row = gradeScaleTableBody.insertRow();
            row.innerHTML = `
                <td>${grade}</td>
                <td><input type="number" class="grade-point-input" data-grade="${grade}" value="${gradePointMap[grade]}" step="0.01" /></td>
            `;
        });
    }

    function updateGradeScale(newMap) {
        gradePointMap = newMap;
        saveGradeMap();
        allCourses.forEach(c => {
            c.gradePoint = gradePointMap[c.grade] !== undefined ? gradePointMap[c.grade] : 0;
        });
        saveCourses();
        updateDashboard();
        populateGradeLegendTable();
        showToast('Grading scale updated.');
    }

    gradeScaleBtn.addEventListener('click', openGradeScaleModal);
    gradeScaleClose.addEventListener('click', closeGradeScaleModal);
    window.addEventListener('click', function (e) {
        if (e.target === gradeScaleModal) closeGradeScaleModal();
    });

    gradeScaleSaveBtn.addEventListener('click', () => {
        const inputs = gradeScaleTableBody.querySelectorAll('.grade-point-input');
        const newMap = {};
        let isValid = true;
        inputs.forEach(input => {
            const grade = input.dataset.grade;
            const point = parseFloat(input.value);
            if (isNaN(point)) {
                isValid = false;
            }
            newMap[grade] = point;
        });

        if (!isValid) {
            alert('Please enter valid numbers for all grade points.');
            return;
        }
        updateGradeScale(newMap);

        // --- Visual Feedback ---
        const originalText = gradeScaleSaveBtn.textContent;
        gradeScaleSaveBtn.textContent = 'Saved!';
        gradeScaleSaveBtn.classList.add('is-success');
        gradeScaleSaveBtn.disabled = true;

        setTimeout(() => {
            gradeScaleSaveBtn.textContent = originalText;
            gradeScaleSaveBtn.classList.remove('is-success');
            gradeScaleSaveBtn.disabled = false;
            closeGradeScaleModal();
        }, 1500);
    });

    gradeScaleResetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset the grading scale to the default values? This will also recalculate your GPA.')) {
            updateGradeScale({ ...defaultGradePointMap });
            populateGradeScaleEditor();
        }
    });

    // Initial setup
    addCourseRow();
    loadCourses();
});
