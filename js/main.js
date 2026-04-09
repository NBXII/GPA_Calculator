document.addEventListener('DOMContentLoaded', function () {
    // --- Icons (SVG) ---
    const Icons = {
        edit: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>',
        trash: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>',
        save: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
        cancel: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
        sun: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>',
        moon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>'
    };

    // --- Theme Management (Global) ---
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (themeToggleBtn) themeToggleBtn.innerHTML = theme === 'dark' ? Icons.sun : Icons.moon;
        localStorage.setItem('theme', theme);
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
        });
    }
    // Apply theme immediately
    applyTheme(localStorage.getItem('theme') || 'light');

    // --- Smooth Scrolling for Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    function showToast(message, undoCallback = null) {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return; // Don't fail if toast container not on page
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;

        if (undoCallback) {
            const undoBtn = document.createElement('button');
            undoBtn.className = 'toast-undo-btn';
            undoBtn.textContent = 'Undo';
            undoBtn.onclick = () => {
                undoCallback();
                toast.remove();
            };
            toast.appendChild(undoBtn);
        }

        toastContainer.appendChild(toast);
        setTimeout(() => {
            if (toast.parentElement) toast.remove();
        }, 5000);
    }

    // --- Universal Number Animation ---
    function animateNumber(element, endValue, duration = 600, formatter = (v) => v.toFixed(2)) {
        if (!element) return;
        // Cancel any existing animation on this element
        if (element.animationId) cancelAnimationFrame(element.animationId);

        // Extract numeric value from current text (handles "12 Credits" or "3.50")
        const currentText = element.textContent;
        const match = currentText.match(/-?\d+(\.\d+)?/);
        let startValue = match ? parseFloat(match[0]) : 0;
        if (isNaN(startValue)) startValue = 0;

        const finalValue = parseFloat(endValue);
        if (isNaN(finalValue)) return;

        const startTime = performance.now();

        function step(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease Out Quint for vivid effect
            const ease = 1 - Math.pow(1 - progress, 5);
            
            const current = startValue + (finalValue - startValue) * ease;
            element.textContent = formatter(current);

            if (progress < 1) {
                element.animationId = requestAnimationFrame(step);
            } else {
                element.textContent = formatter(finalValue);
                element.animationId = null;
            }
        }
        element.animationId = requestAnimationFrame(step);
    }

    // --- Shared Constants ---
    const defaultGradePointMap = {
        'A+': 4.0, 'A': 4.0, 'A-': 3.67,
        'B+': 3.33, 'B': 3.0, 'B-': 2.67,
        'C+': 2.0, 'C': 1.5, 'C-': 1.0,
        'D+': 1.0, 'D': 1.0, 'F': 0.0
    };
    const yearOrder = ['Freshman', 'Sophomore', 'Junior', 'Senior'];

    // --- Landing Page Enhancements ---
    const exploreBtn = document.getElementById('exploreBtn');
    if (exploreBtn) {
        exploreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetEl = document.getElementById('main-content-start');
            if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // --- Hero Parallax Effect ---
    const heroBg = document.querySelector('.hero-bg-image');
    if (heroBg) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            heroBg.style.transform = `translateY(${scrolled * 0.4}px)`;
        });
    }

    // --- Landing Page Logic ---
    const academicInsightsDashboard = document.getElementById('academicInsightsDashboard');
    if (academicInsightsDashboard) {
        const savedCourses = JSON.parse(localStorage.getItem('allCourses'));
        if (savedCourses && savedCourses.length > 0) {
            let currentMap = { ...defaultGradePointMap };
            const savedMap = localStorage.getItem('gradePointMap');
            if (savedMap) { try { currentMap = JSON.parse(savedMap); } catch(e){} }

            let totalPoints = 0;
            let totalCredits = 0;
            savedCourses.forEach(c => {
                // Recalculate using current map to ensure accuracy if scale changed
                const gp = currentMap[c.grade] !== undefined ? currentMap[c.grade] : (c.gradePoint || 0);
                const cr = parseFloat(c.credit);
                if (!isNaN(gp) && !isNaN(cr) && cr > 0) {
                    totalPoints += gp * cr;
                    totalCredits += cr;
                }
            });
            
            const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
            animateNumber(document.getElementById('landingGpa'), gpa);
            animateNumber(document.getElementById('landingCredits'), totalCredits, 600, (v) => v.toFixed(1));
            
            const msgEl = document.getElementById('landingMessage');
            const gpaNum = parseFloat(gpa);
            if (gpaNum >= 3.5) msgEl.textContent = "Outstanding performance.";
            else if (gpaNum >= 3.0) msgEl.textContent = "Great job. Keep maintaining this standard.";
            else if (gpaNum >= 2.0) msgEl.textContent = "Satisfactory performance. Aim higher next semester.";
            else msgEl.textContent = "Focus on improvement for the next semester.";

            academicInsightsDashboard.style.display = 'block';
        }
    }

    // --- GPA Calculator Logic ---
    const yearSetupSection = document.getElementById('year-setup-section');
    if (yearSetupSection) {
        // Elements
        const academicYearSelect = document.getElementById('academicYearSelect');
        const semesterCountInput = document.getElementById('semesterCount');
        const generateSemestersBtn = document.getElementById('generateSemestersBtn');
        const semestersContainer = document.getElementById('semesters-container');
        const clearAllBtn = document.getElementById('clearAllBtn');
        const calculateYearCgpaBtn = document.getElementById('calculateYearCgpaBtn');

        const totalCreditHoursDisplay = document.getElementById('totalCreditHours');
        const totalCoursesDisplay = document.getElementById('totalCourses');
        const cumulativeGpaDisplay = document.getElementById('cumulativeGpaDisplay');
        const coursesTableBody = document.getElementById('coursesTable').querySelector('tbody');

        const howToBtn = document.getElementById('howToBtn');
        const howToModal = document.getElementById('howToModal');
        const howToClose = document.getElementById('howToClose');

        howToBtn.addEventListener('click', () => howToModal.style.display = 'block');
        howToClose.addEventListener('click', () => howToModal.style.display = 'none');
        window.addEventListener('click', (e) => { if (e.target === howToModal) howToModal.style.display = 'none'; });

        // App state
    let academicData = {};
    let allCourses = [];
    let undoTimeout;
    let recentlyDeleted = null;
    let gradePointMap = { ...defaultGradePointMap };

        // --- Data Persistence ---
    function flattenAcademicData() {
        const flatCourses = [];
        for (const yearName of yearOrder) {
            const year = academicData[yearName];
            if (year && year.semesters) {
                year.semesters.forEach(semester => {
                    flatCourses.push(...semester.courses);
                });
            }
        }
        return flatCourses;
    }

    function saveAcademicData() {
        const flatCourses = flattenAcademicData();
        localStorage.setItem('academicData', JSON.stringify(academicData));
        localStorage.setItem('allCourses', JSON.stringify(flatCourses)); // Save flat array for other pages
    }

    // Helper to sync flat index to hierarchical data
    function findCourseLocation(flatIndex) {
        let count = 0;
        for (const yearName of yearOrder) {
            const year = academicData[yearName];
            if (!year) continue;
            for (const semester of year.semesters) {
                if (flatIndex < count + semester.courses.length) {
                    return { semester: semester, index: flatIndex - count };
                }
                count += semester.courses.length;
            }
        }
        return null;
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

    function populateGradeTables() {
        const legendTable = document.getElementById('gradeLegendTable');
        if (!legendTable) return;
        legendTable.innerHTML = `<thead><tr><th>Grade</th><th>Point</th></tr></thead><tbody></tbody>`;
        const legendBody = legendTable.querySelector('tbody');
        // Sort for consistent order
        Object.keys(gradePointMap).sort().forEach(grade => {
            const point = gradePointMap[grade];
            if (typeof point !== 'number') return; // Skip if point is not a number
            const row = legendBody.insertRow();
            row.innerHTML = `<td>${grade}</td><td>${point.toFixed(2)}</td>`;
        });
    }

    function populateDistinctionInfo() {
        const distinctionInfoEl = document.getElementById('distinction-info');
        if (distinctionInfoEl) {
            distinctionInfoEl.innerHTML = `
                <div class="distinction-item">
                    <span class="distinction-badge dist-first">Great Distinction</span>
                    <p>GPA ≥ 3.5</p>
                </div>
                <div class="distinction-item">
                    <span class="distinction-badge dist-upper">Distinction</span>
                    <p>GPA ≥ 3.0</p>
                </div>
                <div class="distinction-item">
                    <span class="distinction-badge dist-lower">Academic Warning</span>
                    <p>GPA ≥ 2.0</p>
                </div>
                <div class="distinction-item">
                    <span class="distinction-badge dist-fail">Academic Dismissal</span>
                    <p>GPA &lt; 2.0</p>
                </div>
            `;
        }
    }

    function generateSemesterUI() {
        const year = academicYearSelect.value;
        const semesterCount = parseInt(semesterCountInput.value, 10);
        semestersContainer.innerHTML = '';
        calculateYearCgpaBtn.style.display = 'block';

        if (!academicData[year]) {
            academicData[year] = { semesters: [] };
        }
        
        // Ensure we have the right number of semester objects
        while (academicData[year].semesters.length < semesterCount) {
            academicData[year].semesters.push({ title: `Semester ${academicData[year].semesters.length + 1}`, courses: [], gpa: 0, credits: 0 });
        }
        academicData[year].semesters.length = semesterCount; // Truncate if count is reduced

        academicData[year].semesters.forEach((semester, semesterIndex) => {
            const semesterBlock = document.createElement('div');
            semesterBlock.className = 'semester-block';
            semesterBlock.innerHTML = `
                <div class="semester-header" onclick="this.parentElement.classList.toggle('collapsed')">
                    <div class="header-left">
                        <i class="fas fa-chevron-down toggle-icon"></i>
                        <h3>${semester.title || `Semester ${semesterIndex + 1}`}</h3>
                    </div>
                    <div class="semester-gpa-display">GPA: <span id="sem-gpa-${semesterIndex}">${semester.gpa.toFixed(2)}</span></div>
                </div>
                <div class="semester-body">
                <table class="input-table" data-semester-index="${semesterIndex}">
                    <thead>
                        <tr><th>Course Name</th><th>Grade</th><th>Credits</th><th></th></tr>
                    </thead>
                    <tbody></tbody>
                </table>
                <div class="input-actions">
                    <button type="button" class="icon-btn add-sem-course-btn"><span>+</span> Add Course</button>
                </div>
                </div>
            `;
            semestersContainer.appendChild(semesterBlock);
            const tableBody = semesterBlock.querySelector('tbody');
            
            // Populate with existing courses or add an empty row
            if (semester.courses && semester.courses.length > 0) {
                semester.courses.forEach(course => addCourseToSemester(tableBody, course));
            }
            addCourseToSemester(tableBody); // Add a blank row for new entries
        });

        // Add event listeners for the new buttons
        semestersContainer.querySelectorAll('.add-sem-course-btn').forEach(btn => {
            btn.onclick = (e) => {
                const tableBody = e.target.closest('.semester-block').querySelector('.input-table tbody');
                addCourseToSemester(tableBody);
            };
        });
        semestersContainer.addEventListener('input', (e) => {
            if (e.target.closest('.input-table')) {
                const semesterBlock = e.target.closest('.semester-block');
                const semesterIndex = parseInt(semesterBlock.querySelector('.input-table').dataset.semesterIndex, 10);
                calculateSemesterGPA(semesterBlock, semesterIndex);
                updateCurrentYearDataFromDOM(); // Real-time save & update
            }
        });
    }

    function addCourseToSemester(tableBody, course = null) {
        const row = tableBody.insertRow();
        row.className = 'input-row';
        row.innerHTML = `
            <td><input type="text" class="courseName" placeholder="Course Name" value="${course ? course.name : ''}" /></td>
            <td>
                <select class="courseGrade">
                    <option value="" disabled selected>Grade</option>
                    ${getGradeOptionsHTML(course ? course.grade : '')}
                </select>
            </td>
            <td><input type="number" class="courseCredit" placeholder="Credits" min="0" step="0.5" value="${course ? course.credit : ''}" /></td>
            <td><button type="button" class="removeRowBtn" title="Remove">${Icons.trash}</button></td>
        `;
        row.querySelector('.removeRowBtn').onclick = function () {
            row.remove();
            const semesterBlock = row.closest('.semester-block');
            const semesterIndex = parseInt(semesterBlock.querySelector('.input-table').dataset.semesterIndex, 10);
            calculateSemesterGPA(semesterBlock, semesterIndex);
            updateCurrentYearDataFromDOM(); // Real-time save & update
        };
    }

    function calculateSemesterGPA(semesterBlock, semesterIndex) {
        const courseRows = semesterBlock.querySelectorAll('.input-table tbody tr');
        let totalPoints = 0;
        let totalCredits = 0;

        courseRows.forEach(row => {
            const gradeLetter = row.querySelector('.courseGrade').value;
            const credit = parseFloat(row.querySelector('.courseCredit').value);
            const gradePoint = gradePointMap[gradeLetter];
            if (gradeLetter && !isNaN(credit) && credit > 0) {
                totalPoints += gradePoint * credit;
                totalCredits += credit;
            }
        });

        const semesterGpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;
        animateNumber(semesterBlock.querySelector(`#sem-gpa-${semesterIndex}`), semesterGpa);
    }

    // Scrape DOM to update academicData and Dashboard in real-time
    function updateCurrentYearDataFromDOM() {
        const year = academicYearSelect.value;
        if (!academicData[year]) academicData[year] = { semesters: [] };
        const yearData = academicData[year];

        document.querySelectorAll('#semesters-container .semester-block').forEach((semesterBlock, semesterIndex) => {
            // Ensure semester object exists
            if (!yearData.semesters[semesterIndex]) {
                yearData.semesters[semesterIndex] = { title: `Semester ${semesterIndex + 1}`, courses: [], gpa: 0, credits: 0 };
            }
            const semester = yearData.semesters[semesterIndex];
            const semesterCourses = [];
            
            semesterBlock.querySelectorAll('.input-table tbody tr').forEach(row => {
                const name = row.querySelector('.courseName').value.trim();
                const gradeLetter = row.querySelector('.courseGrade').value;
                const credit = parseFloat(row.querySelector('.courseCredit').value);
                
                // Save if it has any data
                if (name || gradeLetter || !isNaN(credit)) {
                    const gradePoint = gradePointMap[gradeLetter] !== undefined ? gradePointMap[gradeLetter] : 0;
                    semesterCourses.push({ 
                        name, 
                        grade: gradeLetter || '', 
                        gradePoint, 
                        credit: isNaN(credit) ? 0 : credit 
                    });
                }
            });

            semester.courses = semesterCourses;
            
            // Recalculate semester stats internally
            let totalPoints = 0, totalCredits = 0;
            semesterCourses.forEach(c => {
                if (c.grade && c.credit > 0) {
                    totalPoints += c.gradePoint * c.credit;
                    totalCredits += c.credit;
                }
            });
            semester.credits = totalCredits;
            semester.gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
        });

        saveAcademicData();
        
        // Update in-memory allCourses and Dashboard
        allCourses = flattenAcademicData();
        updateDashboard();
    }

    function calculateYearCGPA() {
        const year = academicYearSelect.value;
        const yearData = academicData[year];
        if (!yearData) return;

        let allSemestersValid = true;
        let totalCoursesAdded = 0;

        document.querySelectorAll('#semesters-container .semester-block').forEach((semesterBlock, semesterIndex) => {
            const courseRows = semesterBlock.querySelectorAll('.input-table tbody tr');
            const semesterCourses = [];
            
            courseRows.forEach(row => {
                const name = row.querySelector('.courseName').value.trim();
                const gradeLetter = row.querySelector('.courseGrade').value;
                const credit = parseFloat(row.querySelector('.courseCredit').value);
                
                if (name || gradeLetter || row.querySelector('.courseCredit').value) {
                    if (name && gradeLetter && !isNaN(credit) && credit > 0) {
                        const gradePoint = gradePointMap[gradeLetter];
                        semesterCourses.push({ name, grade: gradeLetter, gradePoint, credit });
                    } else {
                        allSemestersValid = false;
                    }
                }
            });
            
            // Update semester data
            const semester = yearData.semesters[semesterIndex];
            semester.courses = semesterCourses;
            let totalPoints = 0, totalCredits = 0;
            semesterCourses.forEach(c => {
                totalPoints += c.gradePoint * c.credit;
                totalCredits += c.credit;
            });
            semester.credits = totalCredits;
            semester.gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
            totalCoursesAdded += semesterCourses.length;
        });

        if (!allSemestersValid) {
            alert('Please complete all fields for each course, or remove incomplete rows before calculating.');
            return;
        }

        if (totalCoursesAdded === 0) {
            showToast('No courses to calculate.');
            return;
        }

        saveAcademicData();
        
        // Flatten all courses from all years for cumulative display
        allCourses = flattenAcademicData();
        updateDashboard(); // This calculates cumulative GPA and updates UI
        showToast(`Academic year updated and CGPA calculated!`);
        generateSemesterUI(); // Refresh UI to show saved state
    }

    generateSemestersBtn.addEventListener('click', generateSemesterUI);
    calculateYearCgpaBtn.addEventListener('click', calculateYearCGPA);
    clearAllBtn.addEventListener('click', clearAllCourses);
    academicYearSelect.addEventListener('change', () => {
        semestersContainer.innerHTML = '';
        calculateYearCgpaBtn.style.display = 'none';
    });

    function updateDashboard() {
        calculateAndDisplayGPA(allCourses);
        populateTable(allCourses);
        renderChart(allCourses);
        renderDistributionChart(allCourses);

        // After rendering, ensure correct visibility based on current state
        const placeholder = document.getElementById('progressPlaceholder');
        const trendCanvas = document.getElementById('progressChart');
        const distCanvas = document.getElementById('distributionChart');
        if (allCourses.length === 0) {
            placeholder.style.display = 'flex';
            trendCanvas.style.display = 'none';
            distCanvas.style.display = 'none';
        } else {
            placeholder.style.display = 'none';
            // Re-apply active state visibility
            if (document.getElementById('btnShowTrend').classList.contains('active')) {
                trendCanvas.style.display = 'block';
            } else {
                distCanvas.style.display = 'block';
            }
        }
    }

        // Display courses and GPA
    function loadAcademicData() {
        loadGradeMap();
        populateGradeTables();

        const savedData = localStorage.getItem('academicData');
        if (savedData) {
            try {
                academicData = JSON.parse(savedData);
                const lastYear = Object.keys(academicData).pop();
                if (lastYear) {
                    academicYearSelect.value = lastYear;
                    semesterCountInput.value = academicData[lastYear].semesters.length;
                    generateSemesterUI();
                }
            } catch(e) { console.error("Could not parse academic data", e); }
        }
        
        const savedFlatCourses = JSON.parse(localStorage.getItem('allCourses')) || [];
        allCourses = savedFlatCourses;

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

    function calculateAndDisplayGPA(courses) {
        let totalPoints = 0;
        let totalCredits = 0;
        let highestWeightedCourse = null;
        let maxWeight = -1;

        courses.forEach(c => {
            const gp = parseFloat(c.gradePoint);
            const cr = parseFloat(c.credit);
            if (!isNaN(gp) && !isNaN(cr) && cr > 0) {
                totalPoints += gp * cr;
                totalCredits += cr;

                const weight = gp * cr;
                if (weight > maxWeight) {
                    maxWeight = weight;
                    highestWeightedCourse = c;
                }
            }
        });
        let gpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;

        animateNumber(cumulativeGpaDisplay, gpa);
        animateNumber(totalCreditHoursDisplay, totalCredits, 600, (v) => v.toFixed(1));

        // Update classification badges/texts (non-animated)
        const cumulativeLevelEl = document.getElementById('cumulativeLevel');
        const distinctionInfoEl = document.getElementById('distinction-info');
        const highestCourseEl = document.getElementById('highestWeightedCourse');
        const highestValueEl = document.getElementById('highestWeightedValue');

        if (highestCourseEl && highestValueEl) {
            if (highestWeightedCourse) {
                highestCourseEl.textContent = highestWeightedCourse.name;
                highestValueEl.textContent = `(Grade: ${highestWeightedCourse.grade}, Credits: ${highestWeightedCourse.credit})`;
            } else {
                highestCourseEl.textContent = '-';
                highestValueEl.textContent = '';
            }
        }

        animateNumber(totalCoursesDisplay, courses.length, 500, (v) => Math.round(v));

        if (cumulativeLevelEl) {
            const label = getDistinctionLabel(gpa);
            cumulativeLevelEl.innerHTML = label.text ? `<span class="distinction-badge ${label.cls}">${label.text}</span>` : '';
        }

        if (distinctionInfoEl) {
            if (courses.length > 0) {
                distinctionInfoEl.style.display = 'grid';
            } else {
                distinctionInfoEl.style.display = 'none';
            }
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
                    <button class="editRowBtn" title="Edit">${Icons.edit}</button>
                    <button class="removeRowBtn" title="Delete">${Icons.trash}</button>
                </td>
            `;
            tr.style.animationDelay = `${index * 40}ms`; // Staggered animation
            coursesTableBody.appendChild(tr);
        });
    }

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
                <button class="saveRowBtn" title="Save">${Icons.save}</button>
                <button class="cancelEditBtn" title="Cancel">${Icons.cancel}</button>
            </td>
        `;
        row.querySelector('input').focus();
    }

    function saveEditedCourse(row, index) {
        const name = row.querySelector('.courseName').value.trim();
        const gradeLetter = row.querySelector('.courseGrade').value.trim();
        const credit = parseFloat(row.querySelector('.courseCredit').value);
        const gradePoint = gradePointMap[gradeLetter];

        if (name && gradeLetter && !isNaN(credit) && credit > 0) {
            // Update source of truth
            const loc = findCourseLocation(index);
            if (loc) {
                loc.semester.courses[loc.index] = { name, grade: gradeLetter, gradePoint, credit };
                saveAcademicData();
                allCourses = flattenAcademicData();
            }
            updateDashboard(); // Recalculate everything after an edit
        } else {
            alert('Please ensure all fields are filled correctly. Credit hours must be greater than 0.');
        }
    }

    function revertRowToDisplay(row, index) {
        const course = allCourses[index];
        row.classList.remove('is-editing');
        // Re-populate the whole table to ensure consistency
        populateTable(allCourses);
    }

    function deleteCourse(index) {
        const row = coursesTableBody.querySelector(`tr[data-index="${index}"]`);
        if (row) {
            row.classList.add('is-deleting');
            // Disable interaction during animation
            coursesTableBody.style.pointerEvents = 'none';
            
            setTimeout(() => {
                const loc = findCourseLocation(index);
                if (loc) {
                    recentlyDeleted = { 
                        course: loc.semester.courses[loc.index], 
                        flatIndex: index,
                        semester: loc.semester,
                        semIndex: loc.index
                    };
                    loc.semester.courses.splice(loc.index, 1);

                    allCourses = flattenAcademicData();
                    // If Year Setup is visible, refresh it to reflect deletion
                    const currentYear = academicYearSelect.value;
                    if (academicData[currentYear] && academicData[currentYear].semesters.includes(loc.semester)) {
                         generateSemesterUI(); 
                    }
                }
                saveAcademicData(); // Save after all modifications

                updateDashboard(); // Update GPA/Credits immediately
                populateTable(allCourses);
                showToast('Course deleted.', undoDelete);
                
                coursesTableBody.style.pointerEvents = '';
                undoTimeout = setTimeout(() => {
                    recentlyDeleted = null;
                }, 5000);
            }, 350); // Wait for animation
        }
    }
    function undoDelete() {
        if (recentlyDeleted) {
            clearTimeout(undoTimeout);
            // Restore to specific semester
            recentlyDeleted.semester.courses.splice(recentlyDeleted.semIndex, 0, recentlyDeleted.course);
            saveAcademicData();
            allCourses = flattenAcademicData();
            recentlyDeleted = null;
            generateSemesterUI(); // Refresh UI
            updateDashboard();
            populateTable(allCourses); // Just update the table, don't recalculate GPA yet
        }
    }

    function clearAllCourses() {
        if (confirm('Are you sure you want to delete ALL courses? This action cannot be undone.')) {
            academicData = {};
            allCourses = [];
            saveAcademicData();
            updateDashboard();
            generateSemesterUI(); // Clears the year setup UI
            showToast('All courses have been deleted.');
        }
    }

    // --- Course Table Actions (Edit/Delete/Undo) using Event Delegation ---
    coursesTableBody.addEventListener('click', function (e) {
        const target = e.target;
        const row = target.closest('tr');
        if (!row || !coursesTableBody.contains(row)) return;

        // Pass the actual button that was clicked
        handleCourseAction(target, row);
    });

    function renderChart(courses) {
        const canvas = document.getElementById('progressChart');
        if (window.progressChart) {
            window.progressChart.destroy();
            window.progressChart = null;
        }
        
        if (!courses || courses.length === 0) {
            return;
        }

        const ctx = canvas.getContext('2d');
        window.progressChart = new Chart(ctx, {
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

    function renderDistributionChart(courses) {
        const canvas = document.getElementById('distributionChart');
        if (window.distributionChart) {
            window.distributionChart.destroy();
            window.distributionChart = null;
        }

        if (!courses || courses.length === 0) {
            return;
        }

        const gradeCounts = {};
        courses.forEach(c => {
            const g = c.grade;
            gradeCounts[g] = (gradeCounts[g] || 0) + 1;
        });

        const labels = Object.keys(gradeCounts).sort();
        const data = labels.map(l => gradeCounts[l]);
        const colors = labels.map((_, i) => `hsl(${210 + (i * 20)}, 70%, ${50 + (i * 5)}%)`);

        const ctx = canvas.getContext('2d');
        window.distributionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 1
                }]
            },
            options: {
                plugins: {
                    legend: { position: 'right' }
                },
                cutout: '60%'
            }
        });
    }

    // Chart Toggles
    const btnShowTrend = document.getElementById('btnShowTrend');
    const btnShowDist = document.getElementById('btnShowDist');
    const chartExplanationEl = document.getElementById('chart-explanation');

    if (btnShowTrend && btnShowDist && chartExplanationEl) {
        const explanations = {
            trend: 'The <strong>Trend</strong> chart shows the grade point for each course over time, helping you visualize your academic performance from one course to the next.',
            distribution: 'The <strong>Distribution</strong> chart provides a breakdown of how many times you have received each letter grade, showing your overall grade patterns.'
        };

        btnShowTrend.addEventListener('click', () => {
            if (allCourses.length > 0) {
                document.getElementById('progressChart').style.display = 'block';
                document.getElementById('distributionChart').style.display = 'none';
            }
            btnShowTrend.classList.add('active');
            btnShowDist.classList.remove('active');
            chartExplanationEl.innerHTML = explanations.trend;
        });
        btnShowDist.addEventListener('click', () => {
            if (allCourses.length > 0) {
                document.getElementById('progressChart').style.display = 'none';
                document.getElementById('distributionChart').style.display = 'block';
            }
            btnShowDist.classList.add('active');
            btnShowTrend.classList.remove('active');
            chartExplanationEl.innerHTML = explanations.distribution;
        });

        // Set initial explanation
        chartExplanationEl.innerHTML = explanations.trend;
    }

    // --- Grade Replacement Simulator ---
    const gradeReplaceBtn = document.getElementById('gradeReplaceBtn');
    const gradeReplaceModal = document.getElementById('gradeReplaceModal');
    const gradeReplaceClose = document.getElementById('gradeReplaceClose');

    if (gradeReplaceBtn) {
        const simOriginalGrade = document.getElementById('simOriginalGrade');
        const simNewGrade = document.getElementById('simNewGrade');
        const simCredits = document.getElementById('simCredits');
        const simCalculateBtn = document.getElementById('simCalculateBtn');
        const simResult = document.getElementById('simResult');
        const simNewGpa = document.getElementById('simNewGpa');
        const simGpaDiff = document.getElementById('simGpaDiff');

        function openGradeReplaceModal() {
            simOriginalGrade.innerHTML = getGradeOptionsHTML();
            simNewGrade.innerHTML = getGradeOptionsHTML();
            simResult.style.display = 'none';
            simCredits.value = '';
            gradeReplaceModal.style.display = 'block';
        }

        gradeReplaceBtn.addEventListener('click', openGradeReplaceModal);
        gradeReplaceClose.addEventListener('click', () => gradeReplaceModal.style.display = 'none');
        window.addEventListener('click', (e) => { if (e.target === gradeReplaceModal) gradeReplaceModal.style.display = 'none'; });

        simCalculateBtn.addEventListener('click', () => {
            const originalGrade = simOriginalGrade.value;
            const newGrade = simNewGrade.value;
            const credits = parseFloat(simCredits.value);

            if (!originalGrade || !newGrade || isNaN(credits) || credits <= 0) {
                showToast('Please fill all fields with valid values.');
                return;
            }

            let totalPoints = 0;
            let totalCredits = 0;
            allCourses.forEach(c => {
                totalPoints += c.gradePoint * c.credit;
                totalCredits += c.credit;
            });

            if (totalCredits === 0) {
                showToast('Add some courses first to establish a GPA.');
                return;
            }

            const originalGpa = totalPoints / totalCredits;
            const pointsFromOriginal = gradePointMap[originalGrade] * credits;
            const pointsFromNew = gradePointMap[newGrade] * credits;
            const newTotalPoints = totalPoints - pointsFromOriginal + pointsFromNew;
            const newGpa = newTotalPoints / totalCredits;
            const gpaDiff = newGpa - originalGpa;

            simNewGpa.textContent = newGpa.toFixed(3);
            simGpaDiff.textContent = `${gpaDiff >= 0 ? '+' : ''}${gpaDiff.toFixed(3)}`;
            simGpaDiff.style.color = gpaDiff >= 0 ? '#28a745' : 'var(--danger-color)';
            simResult.style.display = 'block';
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
            <td><button type="button" class="stdRemoveRowBtn" title="Remove">${Icons.trash}</button></td>
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

        // Update grade points in the source of truth: academicData
        Object.values(academicData).forEach(year => {
            year.semesters.forEach(semester => {
                semester.courses.forEach(course => {
                    course.gradePoint = newMap[course.grade] !== undefined ? newMap[course.grade] : 0;
                });
            });
        });
        // Also update the in-memory flat array for immediate UI updates
        allCourses.forEach(c => {
            c.gradePoint = newMap[c.grade] !== undefined ? newMap[c.grade] : 0;
        });
        saveAcademicData(); // Now this will save the updated academicData
        updateDashboard();
        populateGradeTables();
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
        loadAcademicData();
        populateDistinctionInfo();
    
    }
    // --- Focus Zone Logic ---
    const focusZoneContainer = document.getElementById('focusZoneContainer');
    if (focusZoneContainer) {
        // Elements
        const minutesEl = document.getElementById('timer-minutes');
        const secondsEl = document.getElementById('timer-seconds');
        const startStopBtn = document.getElementById('startStopBtn');
        const resetBtn = document.getElementById('resetBtn');
        const modeButtons = document.querySelectorAll('.timer-mode-btn');
        const pomodoroCountEl = document.getElementById('pomodoroCount');
        const totalTimeEl = document.getElementById('totalTime');
        const alarmSound = document.getElementById('alarmSound');
        const taskList = document.getElementById('taskList');
        const addTaskForm = document.getElementById('addTaskForm');
        const taskInput = document.getElementById('taskInput');

        // State
        let timer;
        let isRunning = false;
        let totalSeconds = 25 * 60;
        let currentMode = 'pomodoro';
        let pomodoros = 0;
        let totalTimeFocused = 0;

        const modes = {
            pomodoro: 25,
            shortBreak: 5,
            longBreak: 15
        };

        function updateDisplay() {
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            minutesEl.textContent = String(minutes).padStart(2, '0');
            secondsEl.textContent = String(seconds).padStart(2, '0');
            document.title = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} - Focus Zone`;
        }

        function switchMode(mode) {
            currentMode = mode;
            totalSeconds = modes[mode] * 60;
            isRunning = false;
            clearInterval(timer);
            startStopBtn.textContent = 'Start';
            document.body.dataset.mode = mode; // For potential styling
            modeButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.mode === mode);
            });
            updateDisplay();
        }

        function startTimer() {
            if (isRunning) return;
            isRunning = true;
            startStopBtn.textContent = 'Pause';
            timer = setInterval(() => {
                if (totalSeconds <= 0) {
                    clearInterval(timer);
                    if(alarmSound) alarmSound.play();
                    if (currentMode === 'pomodoro') {
                        pomodoros++;
                        totalTimeFocused += modes.pomodoro;
                        updateStats();
                    }
                    // Auto-switch logic
                    switchMode(currentMode === 'pomodoro' ? (pomodoros % 4 === 0 ? 'longBreak' : 'shortBreak') : 'pomodoro');
                    return;
                }
                totalSeconds--;
                updateDisplay();
            }, 1000);
        }

        function stopTimer() {
            isRunning = false;
            clearInterval(timer);
            startStopBtn.textContent = 'Start';
        }

        function resetTimer() {
            stopTimer();
            totalSeconds = modes[currentMode] * 60;
            updateDisplay();
        }

        function updateStats() {
            pomodoroCountEl.textContent = pomodoros;
            totalTimeEl.textContent = `${totalTimeFocused}m`;
            localStorage.setItem('focusStats', JSON.stringify({ pomodoros, totalTimeFocused, date: new Date().toLocaleDateString() }));
        }

        function loadStats() {
            const stats = JSON.parse(localStorage.getItem('focusStats'));
            if (stats && stats.date === new Date().toLocaleDateString()) {
                pomodoros = stats.pomodoros || 0;
                totalTimeFocused = stats.totalTimeFocused || 0;
            } else {
                // Reset stats for a new day
                pomodoros = 0;
                totalTimeFocused = 0;
            }
            updateStats();
        }

        // Task List Logic
        let tasks = JSON.parse(localStorage.getItem('sessionTasks')) || [];

        function saveTasks() {
            localStorage.setItem('sessionTasks', JSON.stringify(tasks));
        }

        function renderTasks() {
            taskList.innerHTML = '';
            tasks.forEach((task, index) => {
                const li = document.createElement('li');
                li.className = `task-item ${task.completed ? 'completed' : ''}`;
                li.dataset.index = index;
                li.innerHTML = `
                    <input type="checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="task-name">${task.name}</span>
                    <button class="delete-task-btn" title="Delete Task">&times;</button>
                `;
                taskList.appendChild(li);
            });
        }

        addTaskForm.addEventListener('submit', e => {
            e.preventDefault();
            const taskName = taskInput.value.trim();
            if (taskName) {
                tasks.push({ name: taskName, completed: false });
                taskInput.value = '';
                saveTasks();
                renderTasks();
            }
        });

        taskList.addEventListener('click', e => {
            const index = e.target.closest('.task-item')?.dataset.index;
            if (index === undefined) return;

            if (e.target.type === 'checkbox') {
                tasks[index].completed = e.target.checked;
            } else if (e.target.classList.contains('delete-task-btn')) {
                tasks.splice(index, 1);
            }
            saveTasks();
            renderTasks();
        });

        // Event Listeners
        startStopBtn.addEventListener('click', () => {
            if (isRunning) {
                stopTimer();
            } else {
                startTimer();
            }
        });
        resetBtn.addEventListener('click', resetTimer);
        modeButtons.forEach(btn => {
            btn.addEventListener('click', () => switchMode(btn.dataset.mode));
        });

        // Initial Load
        loadStats();
        renderTasks();
        switchMode('pomodoro'); // Set initial state
    }

    // --- Degree Tracker Logic ---
    const trackerContainer = document.getElementById('trackerContainer');
    if (trackerContainer) {
        const degreeCreditsTargetEl = document.getElementById('degreeCreditsTarget');
        const creditsCompletedEl = document.getElementById('creditsCompleted');
        const creditsRemainingEl = document.getElementById('creditsRemaining');
        const progressBarEl = document.getElementById('degreeProgressBar');
        const progressTextEl = document.getElementById('degreeProgressText');
        const completedCoursesListEl = document.getElementById('completedCoursesList');
        const noCoursesMessageEl = document.getElementById('noCoursesMessage');
        const targetGpaInput = document.getElementById('targetGpaInput');

        function updateAcademicStatus(savedCourses) {
            let totalPoints = 0;
            let totalCredits = 0;
            savedCourses.forEach(c => {
                const gp = parseFloat(c.gradePoint);
                const cr = parseFloat(c.credit);
                if (!isNaN(gp) && !isNaN(cr) && cr > 0) {
                    totalPoints += gp * cr;
                    totalCredits += cr;
                }
            });
            const gpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0.0;

            let status = { class: 'status-bad', icon: '<i class="fas fa-exclamation-triangle"></i>', title: 'Academic Warning', desc: 'Your GPA is below 2.0. Focus on improvement.' };
            if (gpa >= 3.0) {
                status = { class: 'status-good', icon: '<i class="fas fa-check-circle"></i>', title: 'On Track', desc: 'You are progressing well! Keep it up.' };
            } else if (gpa >= 2.0) {
                status = { class: 'status-average', icon: '<i class="fas fa-balance-scale"></i>', title: 'Satisfactory', desc: 'You are meeting requirements, but aim higher.' };
            }

            let statusCard = document.getElementById('academicStatusCard');
            if (!statusCard) {
                statusCard = document.createElement('div');
                statusCard.id = 'academicStatusCard';
                if (trackerContainer) trackerContainer.insertBefore(statusCard, trackerContainer.firstChild);
            }
            statusCard.className = `status-card`;
            statusCard.innerHTML = `
                <div class="status-indicator ${status.class}">${status.icon}</div>
                <div class="status-details">
                    <h3>${status.title}</h3>
                    <p>${status.desc} (Current GPA: ${gpa.toFixed(2)})</p>
                </div>
            `;
        }

        function updateTracker() {
            const targetCredits = parseFloat(degreeCreditsTargetEl.value) || 0;
            const savedCourses = JSON.parse(localStorage.getItem('allCourses')) || [];
            const targetGpa = parseFloat(targetGpaInput.value);
            
            let completedCredits = 0;
            completedCoursesListEl.innerHTML = '';

            if (savedCourses.length > 0) {
                noCoursesMessageEl.style.display = 'none';
                savedCourses.forEach(course => {
                    completedCredits += parseFloat(course.credit) || 0;
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <span>${course.name}</span>
                        <span class="course-credits">${course.credit.toFixed(1)} cr</span>
                    `;
                    completedCoursesListEl.appendChild(li);
                });
            } else {
                noCoursesMessageEl.style.display = 'block';
            }

            const remainingCredits = Math.max(0, targetCredits - completedCredits);
            const progressPercent = targetCredits > 0 ? Math.min(100, (completedCredits / targetCredits) * 100) : 0;

            animateNumber(creditsCompletedEl, completedCredits, 600, (v) => v.toFixed(1));
            animateNumber(creditsRemainingEl, remainingCredits, 600, (v) => v.toFixed(1));
            
            progressBarEl.style.width = `${progressPercent}%`;
            animateNumber(progressTextEl, progressPercent, 600, (v) => `${v.toFixed(1)}%`);

            localStorage.setItem('degreeCreditsTarget', targetCredits);
            updateAcademicStatus(savedCourses);

            // Target GPA Calculation
            if (!isNaN(targetGpa) && targetGpa > 0) {
                calculateTargetForecast(savedCourses, targetCredits, targetGpa);
            } else {
                document.getElementById('requiredGpaDisplay').textContent = '-';
            }
        }

        function calculateTargetForecast(courses, totalCredits, targetGpa) {
            let currentPoints = 0;
            let currentCredits = 0;
            courses.forEach(c => {
                if (!isNaN(parseFloat(c.gradePoint)) && !isNaN(parseFloat(c.credit))) {
                    currentPoints += c.gradePoint * c.credit;
                    currentCredits += c.credit;
                }
            });

            const remainingCredits = totalCredits - currentCredits;
            const requiredPoints = (targetGpa * totalCredits) - currentPoints;
            
            const resultEl = document.getElementById('requiredGpaDisplay');
            if (remainingCredits <= 0) {
                resultEl.textContent = "Degree Completed";
            } else {
                const requiredGpa = requiredPoints / remainingCredits;
                if (requiredGpa > 4.0) {
                    resultEl.textContent = `${requiredGpa.toFixed(2)} (Impossible)`;
                    resultEl.style.color = 'var(--danger-color)';
                } else if (requiredGpa < 0) {
                    resultEl.textContent = "Goal Achieved";
                    resultEl.style.color = '#28a745';
                } else {
                    resultEl.textContent = requiredGpa.toFixed(2);
                    resultEl.style.color = 'var(--primary-color)';
                }
            }
        }

        function loadTracker() {
            const savedTarget = localStorage.getItem('degreeCreditsTarget');
            if (savedTarget) {
                degreeCreditsTargetEl.value = savedTarget;
            }
            const savedTargetGpa = localStorage.getItem('targetGpaGoal');
            if (savedTargetGpa) targetGpaInput.value = savedTargetGpa;
            updateTracker();
        }

        degreeCreditsTargetEl.addEventListener('change', updateTracker);
        degreeCreditsTargetEl.addEventListener('keyup', updateTracker);
        targetGpaInput.addEventListener('input', () => {
            localStorage.setItem('targetGpaGoal', targetGpaInput.value);
            updateTracker();
        });

        window.addEventListener('storage', (e) => {
            if (e.key === 'allCourses' || e.key === 'degreeCreditsTarget') {
                loadTracker();
            }
        });

        loadTracker();
    }

    // --- Notes & Flashcards Logic ---
    const notesFlashcardsContainer = document.getElementById('notesFlashcardsContainer');
    if (notesFlashcardsContainer) {
        // --- Notes Elements ---
        const addNoteBtn = document.getElementById('addNoteBtn');
        const notesList = document.getElementById('notesList');
        const emptyNotesState = document.getElementById('emptyNotesState');
        const notesSearch = document.getElementById('notesSearch');
        const noteModal = document.getElementById('noteModal');
        const noteModalClose = document.getElementById('noteModalClose');
        const noteModalTitle = document.getElementById('noteModalTitle');
        const noteForm = document.getElementById('noteForm');
        const noteIdInput = document.getElementById('noteId');
        const noteTitleInput = document.getElementById('noteTitle');
        const noteContentInput = document.getElementById('noteContent');
        const deleteNoteBtn = document.getElementById('deleteNoteBtn');

        // --- Flashcards Elements ---
        const addFlashcardSetBtn = document.getElementById('addFlashcardSetBtn');
        const flashcardSetsList = document.getElementById('flashcardSetsList');
        const emptyFlashcardsState = document.getElementById('emptyFlashcardsState');
        const flashcardSetModal = document.getElementById('flashcardSetModal');
        const flashcardSetModalClose = document.getElementById('flashcardSetModalClose');
        const flashcardSetModalTitle = document.getElementById('flashcardSetModalTitle');
        const flashcardSetForm = document.getElementById('flashcardSetForm');
        const flashcardSetIdInput = document.getElementById('flashcardSetId');
        const flashcardSetNameInput = document.getElementById('flashcardSetName');
        const deleteFlashcardSetBtn = document.getElementById('deleteFlashcardSetBtn');

        const flashcardEditorModal = document.getElementById('flashcardEditorModal');
        const flashcardEditorModalClose = document.getElementById('flashcardEditorModalClose');
        const flashcardEditorModalTitle = document.getElementById('flashcardEditorModalTitle');
        const flashcardEditorSubtitle = document.getElementById('flashcardEditorSubtitle');
        const currentFlashcardsDiv = document.getElementById('currentFlashcards');
        const addFlashcardBtn = document.getElementById('addFlashcardBtn');
        const saveFlashcardsBtn = document.getElementById('saveFlashcardsBtn');

        const flashcardReviewModal = document.getElementById('flashcardReviewModal');
        const flashcardReviewModalClose = document.getElementById('flashcardReviewModalClose');
        const flashcardReviewTitle = document.getElementById('flashcardReviewTitle');
        const flashcardReviewSubtitle = document.getElementById('flashcardReviewSubtitle');
        const flashcardDisplay = document.getElementById('flashcardDisplay');
        const reviewCardFront = document.getElementById('reviewCardFront');
        const reviewCardBack = document.getElementById('reviewCardBack');
        const flipCardBtn = document.getElementById('flipCardBtn');
        const srsControls = document.getElementById('srsControls');
        const reviewCompleteMessage = document.getElementById('reviewCompleteMessage');

        // --- State ---
        let notes = JSON.parse(localStorage.getItem('notes')) || [];
        let flashcardSets = JSON.parse(localStorage.getItem('flashcardSets')) || [];
        let currentReviewSet = null;
        let currentReviewIndex = 0;
        let isFlipped = false;

        // --- Notes Functions ---
        function saveNotes() {
            localStorage.setItem('notes', JSON.stringify(notes));
            renderNotes();
        }

        function renderNotes(searchTerm = '') {
            notesList.innerHTML = '';
            const filteredNotes = notes.filter(note => 
                note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                note.content.toLowerCase().includes(searchTerm.toLowerCase())
            );

            if (filteredNotes.length === 0) {
                emptyNotesState.style.display = 'block';
            } else {
                emptyNotesState.style.display = 'none';
                filteredNotes.forEach(note => {
                    const noteCard = document.createElement('div');
                    noteCard.className = 'note-card';
                    noteCard.dataset.id = note.id;
                    noteCard.innerHTML = `
                        <h3>${note.title}</h3>
                        <p>${note.content.substring(0, 150)}${note.content.length > 150 ? '...' : ''}</p>
                        <span class="note-card-date">Last updated: ${new Date(note.timestamp).toLocaleDateString()}</span>
                    `;
                    noteCard.addEventListener('click', () => openNoteModal(note.id));
                    notesList.appendChild(noteCard);
                });
            }
        }

        function openNoteModal(id = null) {
            noteForm.reset();
            deleteNoteBtn.style.display = 'none';
            if (id) {
                const note = notes.find(n => n.id === id);
                if (note) {
                    noteModalTitle.textContent = 'Edit Note';
                    noteIdInput.value = note.id;
                    noteTitleInput.value = note.title;
                    noteContentInput.value = note.content;
                    deleteNoteBtn.style.display = 'inline-block';
                }
            } else {
                noteModalTitle.textContent = 'Add New Note';
                noteIdInput.value = '';
            }
            noteModal.style.display = 'block';
        }

        function closeNoteModal() {
            noteModal.style.display = 'none';
        }

        noteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = noteIdInput.value || Date.now().toString();
            const title = noteTitleInput.value.trim();
            const content = noteContentInput.value.trim();
            const timestamp = new Date().toISOString();

            if (!title || !content) {
                showToast('Title and content cannot be empty.', null);
                return;
            }

            const existingIndex = notes.findIndex(n => n.id === id);
            if (existingIndex > -1) {
                notes[existingIndex] = { id, title, content, timestamp };
            } else {
                notes.push({ id, title, content, timestamp });
            }
            saveNotes();
            closeNoteModal();
            showToast('Note saved!');
        });

        deleteNoteBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this note?')) {
                notes = notes.filter(n => n.id !== noteIdInput.value);
                saveNotes();
                closeNoteModal();
                showToast('Note deleted.');
            }
        });

        addNoteBtn.addEventListener('click', () => openNoteModal());
        noteModalClose.addEventListener('click', closeNoteModal);

        // Search listener
        if (notesSearch) {
            notesSearch.addEventListener('input', (e) => renderNotes(e.target.value));
        }

        // --- Flashcards Functions ---
        function saveFlashcardSets() {
            localStorage.setItem('flashcardSets', JSON.stringify(flashcardSets));
            renderFlashcardSets();
        }

        function renderFlashcardSets() {
            flashcardSetsList.innerHTML = '';
            if (flashcardSets.length === 0) {
                emptyFlashcardsState.style.display = 'block';
            } else {
                emptyFlashcardsState.style.display = 'none';
                flashcardSets.forEach(set => {
                    const setCard = document.createElement('div');
                    setCard.className = 'flashcard-set-card';
                    setCard.dataset.id = set.id;
                    setCard.innerHTML = `
                        <h3>${set.name}</h3>
                        <p>${set.cards.length} cards</p>
                        <div class="card-actions">
                            <button type="button" class="primary-btn edit-set-btn"><i class="fas fa-edit"></i> Edit Cards</button>
                            <button type="button" class="secondary-btn review-set-btn" ${set.cards.length === 0 ? 'disabled' : ''}><i class="fas fa-eye"></i> Review</button>
                        </div>
                    `;
                    setCard.querySelector('.edit-set-btn').addEventListener('click', (e) => {
                        e.stopPropagation(); // Prevent card click from triggering
                        openFlashcardEditorModal(set.id);
                    });
                    setCard.querySelector('.review-set-btn').addEventListener('click', (e) => {
                        e.stopPropagation();
                        startFlashcardReview(set.id);
                    });
                    flashcardSetsList.appendChild(setCard);
                });
            }
        }

        function openFlashcardSetModal(id = null) {
            flashcardSetForm.reset();
            deleteFlashcardSetBtn.style.display = 'none';
            if (id) {
                const set = flashcardSets.find(s => s.id === id);
                if (set) {
                    flashcardSetModalTitle.textContent = 'Edit Flashcard Set';
                    flashcardSetIdInput.value = set.id;
                    flashcardSetNameInput.value = set.name;
                    deleteFlashcardSetBtn.style.display = 'inline-block';
                }
            } else {
                flashcardSetModalTitle.textContent = 'Add New Flashcard Set';
                flashcardSetIdInput.value = '';
            }
            flashcardSetModal.style.display = 'block';
        }

        function closeFlashcardSetModal() {
            flashcardSetModal.style.display = 'none';
        }

        flashcardSetForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = flashcardSetIdInput.value || Date.now().toString();
            const name = flashcardSetNameInput.value.trim();

            if (!name) {
                showToast('Set name cannot be empty.', null);
                return;
            }

            const existingIndex = flashcardSets.findIndex(s => s.id === id);
            if (existingIndex > -1) {
                flashcardSets[existingIndex].name = name;
            } else {
                flashcardSets.push({ id, name, cards: [] });
            }
            saveFlashcardSets();
            closeFlashcardSetModal();
            showToast('Flashcard set saved!');
        });

        deleteFlashcardSetBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this flashcard set and all its cards?')) {
                flashcardSets = flashcardSets.filter(s => s.id !== flashcardSetIdInput.value);
                saveFlashcardSets();
                closeFlashcardSetModal();
                showToast('Flashcard set deleted.');
            }
        });

        addFlashcardSetBtn.addEventListener('click', () => openFlashcardSetModal());
        flashcardSetModalClose.addEventListener('click', closeFlashcardSetModal);

        // --- Flashcard Editor Functions ---
        let editingFlashcardSetId = null;

        function openFlashcardEditorModal(setId) {
            editingFlashcardSetId = setId;
            const set = flashcardSets.find(s => s.id === setId);
            if (!set) return;

            flashcardEditorModalTitle.textContent = `Edit Cards for "${set.name}"`;
            flashcardEditorSubtitle.textContent = `Total cards: ${set.cards.length}`;
            renderFlashcardsInEditor(set.cards);
            flashcardEditorModal.style.display = 'block';
        }

        function closeFlashcardEditorModal() {
            flashcardEditorModal.style.display = 'none';
            editingFlashcardSetId = null;
            renderFlashcardSets(); // Refresh set list in case card count changed
        }

        function renderFlashcardsInEditor(cards) {
            currentFlashcardsDiv.innerHTML = '';
            cards.forEach((card, index) => {
                addFlashcardInputRow(card.front, card.back, index);
            });
            if (cards.length === 0) {
                addFlashcardInputRow('', ''); // Add an empty row if no cards
            }
        }

        function addFlashcardInputRow(front = '', back = '', index = -1) {
            const row = document.createElement('div');
            row.className = 'flashcard-editor-row';
            row.innerHTML = `
                <input type="text" class="flashcard-front-input" placeholder="Front (Question)" value="${front}">
                <input type="text" class="flashcard-back-input" placeholder="Back (Answer)" value="${back}">
                <button type="button" class="icon-btn danger remove-flashcard-row"><i class="fas fa-trash"></i></button>
            `;
            row.querySelector('.remove-flashcard-row').addEventListener('click', () => row.remove());
            currentFlashcardsDiv.appendChild(row);
        }

        addFlashcardBtn.addEventListener('click', () => addFlashcardInputRow());

        saveFlashcardsBtn.addEventListener('click', () => {
            const set = flashcardSets.find(s => s.id === editingFlashcardSetId);
            if (!set) return;

            const newCards = [];
            currentFlashcardsDiv.querySelectorAll('.flashcard-editor-row').forEach(row => {
                const front = row.querySelector('.flashcard-front-input').value.trim();
                const back = row.querySelector('.flashcard-back-input').value.trim();
                if (front && back) {
                    newCards.push({ front, back });
                }
            });
            set.cards = newCards;
            saveFlashcardSets();
            closeFlashcardEditorModal();
            showToast('Flashcards updated!');
        });

        flashcardEditorModalClose.addEventListener('click', closeFlashcardEditorModal);

        // --- Flashcard Review Functions ---
        function startFlashcardReview(setId) {
            currentReviewSet = flashcardSets.find(s => s.id === setId);
            if (!currentReviewSet || currentReviewSet.cards.length === 0) {
                showToast('This set has no cards to review.', null);
                return;
            }

            currentReviewIndex = 0;
            isFlipped = false;
            flashcardReviewTitle.textContent = `Reviewing: ${currentReviewSet.name}`;
            flashcardReviewSubtitle.textContent = `Card ${currentReviewIndex + 1} of ${currentReviewSet.cards.length}`;
            reviewCompleteMessage.style.display = 'none';
            flashcardDisplay.style.display = 'block';
            flipCardBtn.style.display = 'inline-block';
            srsControls.style.display = 'none';

            renderCurrentFlashcard();
            flashcardReviewModal.style.display = 'block';
        }

        function renderCurrentFlashcard() {
            if (!currentReviewSet || currentReviewIndex >= currentReviewSet.cards.length) {
                flashcardDisplay.style.display = 'none';
                flipCardBtn.style.display = 'none';
                srsControls.style.display = 'none';
                reviewCompleteMessage.style.display = 'block';
                return;
            }

            const card = currentReviewSet.cards[currentReviewIndex];
            reviewCardFront.textContent = card.front;
            reviewCardBack.textContent = card.back;
            flashcardDisplay.classList.remove('flipped');
            isFlipped = false;
            flashcardReviewSubtitle.textContent = `Card ${currentReviewIndex + 1} of ${currentReviewSet.cards.length}`;
        }

        function flipFlashcard() {
            flashcardDisplay.classList.toggle('flipped');
            isFlipped = !isFlipped;
        }

        function nextFlashcard() {
            currentReviewIndex++;
            renderCurrentFlashcard();
        }

        function closeFlashcardReviewModal() {
            flashcardReviewModal.style.display = 'none';
            currentReviewSet = null;
        }

        flipCardBtn.addEventListener('click', flipFlashcard);
        nextCardBtn.addEventListener('click', nextFlashcard);
        flashcardReviewModalClose.addEventListener('click', closeFlashcardReviewModal);

        // Initial render on page load
        if (notesList) renderNotes();
        if (flashcardSetsList) renderFlashcardSets();

        // Close modals when clicking outside (only if elements exist)
        window.addEventListener('click', function (e) {
            if (e.target === noteModal) closeNoteModal();
            if (e.target === flashcardSetModal) closeFlashcardSetModal();
            if (e.target === flashcardEditorModal) closeFlashcardEditorModal();
            if (e.target === flashcardReviewModal) closeFlashcardReviewModal();
        });
    }

    // --- Resource Library Logic ---
    const resourceLibraryContainer = document.getElementById('resourceLibraryContainer');
    if (resourceLibraryContainer) {
        // Elements
        const addResourceBtn = document.getElementById('addResourceBtn');
        const resourcesList = document.getElementById('resourcesList');
        const emptyResourcesState = document.getElementById('emptyResourcesState');
        const resourceSearch = document.getElementById('resourceSearch');
        const resourceModal = document.getElementById('resourceModal');
        const resourceModalClose = document.getElementById('resourceModalClose');
        const resourceModalTitle = document.getElementById('resourceModalTitle');
        const resourceForm = document.getElementById('resourceForm');
        const resourceIdInput = document.getElementById('resourceId');
        const resourceTitleInput = document.getElementById('resourceTitle');
        const resourceUrlInput = document.getElementById('resourceUrl');
        const resourceDescriptionInput = document.getElementById('resourceDescription');
        const resourceTagsInput = document.getElementById('resourceTags');
        const deleteResourceBtn = document.getElementById('deleteResourceBtn');

        // State
        let resources = JSON.parse(localStorage.getItem('resources')) || [];

        // --- Resource Functions ---
        function saveResources() {
            localStorage.setItem('resources', JSON.stringify(resources));
            renderResources();
        }

        function renderResources(searchTerm = '') {
            resourcesList.innerHTML = '';
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            const filteredResources = resources.filter(resource =>
                resource.title.toLowerCase().includes(lowerCaseSearchTerm) ||
                resource.description.toLowerCase().includes(lowerCaseSearchTerm) ||
                resource.tags.some(tag => tag.toLowerCase().includes(lowerCaseSearchTerm))
            );

            if (filteredResources.length === 0) {
                emptyResourcesState.style.display = 'block';
            } else {
                emptyResourcesState.style.display = 'none';
                filteredResources.forEach(resource => {
                    const resourceCard = document.createElement('div');
                    resourceCard.className = 'resource-card';
                    resourceCard.dataset.id = resource.id;
                    const tagsHtml = resource.tags.map(tag => `<span>${tag}</span>`).join('');
                    resourceCard.innerHTML = `
                        <h3>${resource.title}</h3>
                        <p>${resource.description.substring(0, 150)}${resource.description.length > 150 ? '...' : ''}</p>
                        <a href="${resource.url}" target="_blank" rel="noopener noreferrer" class="resource-link">Go to Resource <i class="fas fa-external-link-alt"></i></a>
                        <div class="resource-tags">${tagsHtml}</div>
                    `;
                    resourceCard.addEventListener('click', (e) => {
                        // Only open modal if not clicking the link
                        if (!e.target.closest('.resource-link')) {
                            openResourceModal(resource.id);
                        }
                    });
                    resourcesList.appendChild(resourceCard);
                });
            }
        }

        function openResourceModal(id = null) {
            resourceForm.reset();
            deleteResourceBtn.style.display = 'none';
            if (id) {
                const resource = resources.find(r => r.id === id);
                if (resource) {
                    resourceModalTitle.textContent = 'Edit Resource';
                    resourceIdInput.value = resource.id;
                    resourceTitleInput.value = resource.title;
                    resourceUrlInput.value = resource.url;
                    resourceDescriptionInput.value = resource.description;
                    resourceTagsInput.value = resource.tags.join(', ');
                    deleteResourceBtn.style.display = 'inline-block';
                }
            } else {
                resourceModalTitle.textContent = 'Add New Resource';
                resourceIdInput.value = '';
            }
            resourceModal.style.display = 'block';
        }

        function closeResourceModal() {
            resourceModal.style.display = 'none';
        }

        resourceForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = resourceIdInput.value || Date.now().toString();
            const title = resourceTitleInput.value.trim();
            const url = resourceUrlInput.value.trim();
            const description = resourceDescriptionInput.value.trim();
            const tags = resourceTagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

            if (!title || !url) {
                showToast('Title and URL cannot be empty.', null);
                return;
            }

            const existingIndex = resources.findIndex(r => r.id === id);
            if (existingIndex > -1) {
                resources[existingIndex] = { id, title, url, description, tags };
            } else {
                resources.push({ id, title, url, description, tags });
            }
            saveResources();
            closeResourceModal();
            showToast('Resource saved!');
        });

        deleteResourceBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this resource?')) {
                resources = resources.filter(r => r.id !== resourceIdInput.value);
                saveResources();
                closeResourceModal();
                showToast('Resource deleted.');
            }
        });

        addResourceBtn.addEventListener('click', () => openResourceModal());
        resourceModalClose.addEventListener('click', closeResourceModal);

        // Search listener
        if (resourceSearch) {
            resourceSearch.addEventListener('input', (e) => renderResources(e.target.value));
        }

        // Initial render on page load
        renderResources();

        // Close modal when clicking outside
        window.addEventListener('click', function (e) {
            if (e.target === resourceModal) closeResourceModal();
        });
    }

    // --- Number System Calculator Logic ---
    const numberSystemContainer = document.getElementById('numberSystemContainer');
    if (numberSystemContainer) {
        const inputs = {
            dec: document.getElementById('inputDec'),
            bin: document.getElementById('inputBin'),
            oct: document.getElementById('inputOct'),
            hex: document.getElementById('inputHex')
        };
        const explanationSection = document.getElementById('explanationSection');
        const explanationContainer = document.getElementById('explanationContainer');

        function validateInput(value, radix) {
            // Allow empty string
            if (!value) return true;
            // Check if characters match the base
            const validChars = {
                2: /^[0-1]+$/,
                8: /^[0-7]+$/,
                10: /^[0-9]+$/,
                16: /^[0-9A-Fa-f]+$/
            };
            return validChars[radix].test(value);
        }

        function updateValues(sourceBase, value) {
            if (!value) {
                Object.values(inputs).forEach(input => input.value = '');
                explanationSection.style.display = 'none';
                return;
            }

            const decValue = parseInt(value, sourceBase);
            if (isNaN(decValue)) return;

            // Update other inputs
            if (sourceBase !== 10) inputs.dec.value = decValue.toString(10);
            if (sourceBase !== 2) inputs.bin.value = decValue.toString(2);
            if (sourceBase !== 8) inputs.oct.value = decValue.toString(8);
            if (sourceBase !== 16) inputs.hex.value = decValue.toString(16).toUpperCase();

            renderExplanation(sourceBase, value, decValue);
        }

        function renderExplanation(sourceBase, sourceValue, decValue) {
            explanationSection.style.display = 'block';
            explanationContainer.innerHTML = '';

            // 1. If source is NOT Decimal, show conversion TO Decimal
            if (sourceBase !== 10) {
                let html = `<div class="explanation-block"><h3>Base ${sourceBase} to Decimal</h3>`;
                html += `<p>Expand the number by powers of ${sourceBase}:</p>`;
                
                const digits = sourceValue.toString().split('').reverse();
                let sumStr = '';
                let calcStr = '';
                
                digits.forEach((digit, index) => {
                    const val = parseInt(digit, sourceBase);
                    const power = Math.pow(sourceBase, index);
                    const term = `${val} × ${sourceBase}<sup>${index}</sup>`;
                    const result = val * power;
                    
                    sumStr = (index === 0 ? term : term + ' + ') + sumStr;
                    calcStr = (index === 0 ? result : result + ' + ') + calcStr;
                });

                html += `<div class="step-row">${sumStr}</div>`;
                html += `<div class="step-row">= ${calcStr}</div>`;
                html += `<div class="step-row">= <strong>${decValue}</strong></div>`;
                html += `</div>`;
                explanationContainer.innerHTML += html;
            }

            // 2. Show conversion FROM Decimal to others (Binary, Octal, Hex)
            // If source was Decimal, show all. If source was others, show Decimal -> others
            const targets = [
                { base: 2, name: 'Binary' },
                { base: 8, name: 'Octal' },
                { base: 16, name: 'Hexadecimal' }
            ];

            targets.forEach(target => {
                if (target.base === sourceBase) return; // Skip converting to self

                let html = `<div class="explanation-block"><h3>Decimal to ${target.name}</h3>`;
                html += `<p>Divide by ${target.base} and keep track of remainders:</p>`;
                html += `<table class="calc-table"><tr><th>Division</th><th>Quotient</th><th>Remainder</th><th>Digit</th></tr>`;
                
                let current = decValue;
                let steps = [];
                
                if (current === 0) {
                    steps.push({ div: `0 / ${target.base}`, quo: 0, rem: 0, digit: 0 });
                }

                while (current > 0) {
                    const quotient = Math.floor(current / target.base);
                    const remainder = current % target.base;
                    let digit = remainder.toString(16).toUpperCase();
                    
                    steps.push({
                        div: `${current} / ${target.base}`,
                        quo: quotient,
                        rem: remainder,
                        digit: digit
                    });
                    current = quotient;
                }

                steps.forEach(step => {
                    html += `<tr><td>${step.div}</td><td>${step.quo}</td><td>${step.rem}</td><td><strong>${step.digit}</strong></td></tr>`;
                });

                html += `</table>`;
                html += `<p style="margin-top:12px">Read remainders from bottom to top: <strong>${decValue.toString(target.base).toUpperCase()}</strong></p>`;
                html += `</div>`;
                explanationContainer.innerHTML += html;
            });
        }

        // Event Listeners
        const inputMap = [
            { el: inputs.dec, base: 10 },
            { el: inputs.bin, base: 2 },
            { el: inputs.oct, base: 8 },
            { el: inputs.hex, base: 16 }
        ];

        inputMap.forEach(item => {
            item.el.addEventListener('input', (e) => {
                const val = e.target.value.trim();
                if (validateInput(val, item.base)) {
                    updateValues(item.base, val);
                }
            });
        });
    }

    // --- Bitwise Visualizer Logic ---
    const bitwiseContainer = document.getElementById('bitwiseContainer');
    if (bitwiseContainer) {
        const numA_el = document.getElementById('numA');
        const numB_el = document.getElementById('numB');
        const numB_group = document.getElementById('numB-group');
        const numB_label = document.getElementById('numB-label');
        const opBtns = document.querySelectorAll('.op-btn');
        const vizRowA = document.getElementById('viz-row-A');
        const vizRowB = document.getElementById('viz-row-B');
        const vizRowOp = document.getElementById('viz-row-op');
        const vizRowResult = document.getElementById('viz-row-result');
        const explanationTitle = document.getElementById('explanation-title');
        const explanationText = document.getElementById('explanation-text');

        let currentOp = 'AND';

        const explanations = {
            AND: { title: 'Bitwise AND (&)', text: 'Compares each bit of the first operand to the corresponding bit of the second operand. If both bits are 1, the corresponding result bit is set to 1. Otherwise, the result bit is set to 0.' },
            OR: { title: 'Bitwise OR (|)', text: 'Compares each bit of the first operand to the corresponding bit of the second operand. If either bit is 1, the corresponding result bit is set to 1. Otherwise, the result bit is set to 0.' },
            XOR: { title: 'Bitwise XOR (^)', text: 'Compares each bit of the first operand to the corresponding bit of the second operand. If the bits are different, the corresponding result bit is set to 1. If the bits are the same, the result bit is set to 0.' },
            NOT: { title: 'Bitwise NOT (~)', text: 'Inverts all the bits of its operand. Each 0 becomes a 1, and each 1 becomes a 0. This is a unary operator and only uses Operand A.' },
            LSHIFT: { title: 'Left Shift (<<)', text: 'Shifts the bits of Operand A to the left by the number of positions specified by Operand B. Bits shifted off the left are discarded, and zero-bits are shifted in from the right.' },
            RSHIFT: { title: 'Right Shift (>>)', text: 'Shifts the bits of Operand A to the right by the number of positions specified by Operand B. Bits shifted off the right are discarded. For signed numbers, copies of the sign bit are shifted in from the left (sign propagation).' }
        };

        function to8Bit(n) {
            let bin = (n & 0xFF).toString(2); // Ensure it's an 8-bit unsigned integer
            return bin.padStart(8, '0');
        }

        function render() {
            let numA = parseInt(numA_el.value) || 0;
            let numB = parseInt(numB_el.value) || 0;
            let result = 0;
            let opSymbol = '';

            // Clamp values
            if (currentOp === 'LSHIFT' || currentOp === 'RSHIFT') {
                if (numB > 7) { numB = 7; numB_el.value = 7; }
            } else {
                if (numA > 255) { numA = 255; numA_el.value = 255; }
                if (numB > 255) { numB = 255; numB_el.value = 255; }
            }
            if (numA < 0) { numA = 0; numA_el.value = 0; }
            if (numB < 0) { numB = 0; numB_el.value = 0; }

            switch (currentOp) {
                case 'AND': result = numA & numB; opSymbol = '&'; break;
                case 'OR': result = numA | numB; opSymbol = '|'; break;
                case 'XOR': result = numA ^ numB; opSymbol = '^'; break;
                case 'NOT': result = ~numA; opSymbol = '~'; break;
                case 'LSHIFT': result = numA << numB; opSymbol = '<<'; break;
                case 'RSHIFT': result = numA >> numB; opSymbol = '>>'; break;
            }

            const binA = to8Bit(numA);
            const binB = to8Bit(numB);
            const binRes = to8Bit(result);

            // Generate HTML for bit boxes
            function generateRowHTML(binaryString, label) {
                let html = `<div class="bit-box" style="border:none; width:auto; padding-right:10px;">${label}</div>`;
                for (let i = 0; i < binaryString.length; i++) {
                    html += `<div class="bit-box" style="animation-delay: ${i * 30}ms">${binaryString[i]}</div>`;
                }
                return html;
            }

            vizRowA.innerHTML = generateRowHTML(binA, 'A:');
            vizRowResult.innerHTML = generateRowHTML(binRes, 'R:');

            if (currentOp === 'NOT') {
                vizRowB.style.display = 'none';
                vizRowOp.innerHTML = `<div class="bit-box" style="border:none; width:auto; padding-right:10px;">${opSymbol}</div>`;
            } else {
                vizRowB.style.display = 'flex';
                vizRowB.innerHTML = generateRowHTML(binB, 'B:');
                vizRowOp.innerHTML = `<div class="bit-box" style="border:none; width:auto; padding-right:10px;"></div>` + `<div class="bit-box" style="border:none;">${opSymbol}</div>`.repeat(8);
            }

            // Update explanation
            explanationTitle.textContent = explanations[currentOp].title;
            explanationText.textContent = explanations[currentOp].text;
        }

        function switchOp(op) {
            currentOp = op;
            opBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.op === op);
            });

            // Adjust UI for specific operators
            if (op === 'NOT') {
                numB_group.style.display = 'none';
            } else {
                numB_group.style.display = 'block';
                if (op === 'LSHIFT' || op === 'RSHIFT') {
                    numB_label.textContent = 'Shift Amount (0-7)';
                    numB_el.max = 7;
                } else {
                    numB_label.textContent = 'Operand B (0-255)';
                    numB_el.max = 255;
                }
            }
            render();
        }

        // Event Listeners
        numA_el.addEventListener('input', render);
        numB_el.addEventListener('input', render);

        opBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                switchOp(btn.dataset.op);
            });
        });

        // Initial render
        switchOp('AND');
    }

    // --- Big-O Reference Tool Logic ---
    const bigoGrid = document.getElementById('bigoGrid');
    if (bigoGrid) {
        const searchInput = document.getElementById('bigoSearch');
        const categoryTabs = document.getElementById('bigoCategoryTabs');
        const noResultsEl = document.getElementById('noResults');

        const complexityData = [
            // Data Structures
            {
                name: 'Array',
                category: 'ds',
                complexities: {
                    'Access': { time: 'O(1)', class: 'c-green' },
                    'Search': { time: 'O(n)', class: 'c-orange' },
                    'Insertion': { time: 'O(n)', class: 'c-orange' },
                    'Deletion': { time: 'O(n)', class: 'c-orange' },
                    'Space': { time: 'O(n)', class: 'c-orange' }
                }
            },
            {
                name: 'Stack',
                category: 'ds',
                complexities: {
                    'Access': { time: 'O(n)', class: 'c-orange' },
                    'Search': { time: 'O(n)', class: 'c-orange' },
                    'Push': { time: 'O(1)', class: 'c-green' },
                    'Pop': { time: 'O(1)', class: 'c-green' },
                    'Space': { time: 'O(n)', class: 'c-orange' }
                }
            },
            {
                name: 'Queue',
                category: 'ds',
                complexities: {
                    'Access': { time: 'O(n)', class: 'c-orange' },
                    'Search': { time: 'O(n)', class: 'c-orange' },
                    'Enqueue': { time: 'O(1)', class: 'c-green' },
                    'Dequeue': { time: 'O(1)', class: 'c-green' },
                    'Space': { time: 'O(n)', class: 'c-orange' }
                }
            },
            {
                name: 'Singly-Linked List',
                category: 'ds',
                complexities: {
                    'Access': { time: 'O(n)', class: 'c-orange' },
                    'Search': { time: 'O(n)', class: 'c-orange' },
                    'Insertion': { time: 'O(1)', class: 'c-green' },
                    'Deletion': { time: 'O(1)', class: 'c-green' },
                    'Space': { time: 'O(n)', class: 'c-orange' }
                }
            },
            {
                name: 'Hash Table',
                category: 'ds',
                complexities: {
                    'Access': { time: 'N/A', class: 'c-yellow' },
                    'Search': { time: 'O(1)', class: 'c-green' },
                    'Insertion': { time: 'O(1)', class: 'c-green' },
                    'Deletion': { time: 'O(1)', class: 'c-green' },
                    'Space': { time: 'O(n)', class: 'c-orange' }
                }
            },
            {
                name: 'Binary Search Tree',
                category: 'ds',
                complexities: {
                    'Access': { time: 'O(log n)', class: 'c-blue' },
                    'Search': { time: 'O(log n)', class: 'c-blue' },
                    'Insertion': { time: 'O(log n)', class: 'c-blue' },
                    'Deletion': { time: 'O(log n)', class: 'c-blue' },
                    'Space': { time: 'O(n)', class: 'c-orange' }
                }
            },
            // Sorting Algorithms
            {
                name: 'Bubble Sort',
                category: 'sort',
                complexities: {
                    'Best Case': { time: 'O(n)', class: 'c-orange' },
                    'Average Case': { time: 'O(n²)', class: 'c-red' },
                    'Worst Case': { time: 'O(n²)', class: 'c-red' },
                    'Space': { time: 'O(1)', class: 'c-green' }
                }
            },
            {
                name: 'Insertion Sort',
                category: 'sort',
                complexities: {
                    'Best Case': { time: 'O(n)', class: 'c-orange' },
                    'Average Case': { time: 'O(n²)', class: 'c-red' },
                    'Worst Case': { time: 'O(n²)', class: 'c-red' },
                    'Space': { time: 'O(1)', class: 'c-green' }
                }
            },
            {
                name: 'Selection Sort',
                category: 'sort',
                complexities: {
                    'Best Case': { time: 'O(n²)', class: 'c-red' },
                    'Average Case': { time: 'O(n²)', class: 'c-red' },
                    'Worst Case': { time: 'O(n²)', class: 'c-red' },
                    'Space': { time: 'O(1)', class: 'c-green' }
                }
            },
            {
                name: 'Merge Sort',
                category: 'sort',
                complexities: {
                    'Best Case': { time: 'O(n log n)', class: 'c-yellow' },
                    'Average Case': { time: 'O(n log n)', class: 'c-yellow' },
                    'Worst Case': { time: 'O(n log n)', class: 'c-yellow' },
                    'Space': { time: 'O(n)', class: 'c-orange' }
                }
            },
            {
                name: 'Quick Sort',
                category: 'sort',
                complexities: {
                    'Best Case': { time: 'O(n log n)', class: 'c-yellow' },
                    'Average Case': { time: 'O(n log n)', class: 'c-yellow' },
                    'Worst Case': { time: 'O(n²)', class: 'c-red' },
                    'Space': { time: 'O(log n)', class: 'c-blue' }
                }
            },
            {
                name: 'Heap Sort',
                category: 'sort',
                complexities: {
                    'Best Case': { time: 'O(n log n)', class: 'c-yellow' },
                    'Average Case': { time: 'O(n log n)', class: 'c-yellow' },
                    'Worst Case': { time: 'O(n log n)', class: 'c-yellow' },
                    'Space': { time: 'O(1)', class: 'c-green' }
                }
            },
        ];

        function renderGrid(filter = '', category = 'all') {
            bigoGrid.innerHTML = '';
            let resultsFound = false;
            const lowerCaseFilter = filter.toLowerCase();

            complexityData.forEach((item, index) => {
                const matchesFilter = item.name.toLowerCase().includes(lowerCaseFilter);
                const matchesCategory = category === 'all' || item.category === category;

                if (matchesFilter && matchesCategory) {
                    resultsFound = true;
                    const card = document.createElement('div');
                    card.className = 'bigo-card';
                    card.style.animationDelay = `${index * 40}ms`;

                    let complexitiesHTML = '';
                    for (const [key, value] of Object.entries(item.complexities)) {
                        complexitiesHTML += `
                            <div class="complexity-row">
                                <span class="complexity-label">${key}</span>
                                <span class="complexity-value ${value.class}">${value.time}</span>
                            </div>
                        `;
                    }

                    card.innerHTML = `
                        <div class="bigo-card-header">
                            <h3>${item.name}</h3>
                        </div>
                        <div class="bigo-card-body">
                            ${complexitiesHTML}
                        </div>
                    `;
                    bigoGrid.appendChild(card);
                }
            });

            noResultsEl.style.display = resultsFound ? 'none' : 'block';
        }

        searchInput.addEventListener('input', () => {
            const activeTab = categoryTabs.querySelector('.active');
            const category = activeTab ? activeTab.dataset.category : 'all';
            renderGrid(searchInput.value, category);
        });

        categoryTabs.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-btn')) {
                categoryTabs.querySelector('.active').classList.remove('active');
                e.target.classList.add('active');
                renderGrid(searchInput.value, e.target.dataset.category);
            }
        });

        // Initial render
        renderGrid();
    }

    // --- On-Scroll Animation Observer ---
    const animatedElements = document.querySelectorAll('.scroll-animate');
    if (animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target); // Stop observing once visible
                }
            });
        }, {
            threshold: 0.1 // Trigger when 10% of the element is visible
        });

        animatedElements.forEach(el => observer.observe(el));
    }

    // --- Hamburger Menu Toggle ---
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => {
            const container = document.getElementById('pageContainer');
            container.classList.toggle('mobile-nav-open');
        });
    }

    













});
