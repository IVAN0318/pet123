document.addEventListener('DOMContentLoaded', function() {
    let currentPage = 1;
    const totalPages = document.querySelectorAll('.form-page').length;

    // 添加進度條和頁面指示器
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.innerHTML = '<div class="progress"></div>';

    const pageIndicator = document.createElement('div');
    pageIndicator.className = 'page-indicator';

    const container = document.querySelector('.container');
    const formContainer = document.querySelector('.form-container');
    
    if (container && formContainer) {
        container.insertBefore(pageIndicator, formContainer);
        container.insertBefore(progressBar, pageIndicator);
    } else {
        console.error('Container or form-container not found');
    }

    function showPage(pageNumber) {
        const oldPage = document.querySelector('.form-page.active');
        const newPage = document.getElementById(`page${pageNumber}`);

        if (oldPage) {
            oldPage.classList.remove('active');
            setTimeout(() => {
                oldPage.style.display = 'none';
                newPage.style.display = 'block';
                setTimeout(() => newPage.classList.add('active'), 50);
            }, 500);
        } else {
            newPage.style.display = 'block';
            setTimeout(() => newPage.classList.add('active'), 50);
        }

        // 更新進度條和頁面指示器
        document.querySelector('.progress').style.width = `${(pageNumber / totalPages) * 100}%`;
        pageIndicator.textContent = `第 ${pageNumber} 頁,共 ${totalPages} 頁`;
    }

    function updateButtons() {
        document.querySelectorAll('.prev-btn').forEach(btn => {
            btn.style.display = currentPage === 1 ? 'none' : 'inline-block';
            btn.classList.toggle('disabled', currentPage === 1);
        });
        document.querySelectorAll('.next-btn').forEach(btn => {
            btn.style.display = currentPage === totalPages ? 'none' : 'inline-block';
            btn.classList.toggle('disabled', currentPage === totalPages);
        });
        document.getElementById('submitBtn').style.display = currentPage === totalPages ? 'inline-block' : 'none';
    }

    document.querySelectorAll('.next-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (currentPage < totalPages && validateCurrentPage()) {
                currentPage++;
                showPage(currentPage);
                updateButtons();
            }
        });
    });

    document.querySelectorAll('.prev-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                showPage(currentPage);
                updateButtons();
            }
        });
    });

    showPage(currentPage);
    updateButtons();

    // 移除重複的事件監聽器
    document.getElementById('catHealthForm').addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateForm()) {
            calculateScore();
        }
    });

    // 添加這個函數來初始化表單驗證
    function initFormValidation() {
        const form = document.getElementById('catHealthForm');
        const inputs = form.querySelectorAll('input, select');

        inputs.forEach(input => {
            input.addEventListener('input', function() {
                if (this.hasAttribute('required') && this.value.trim()) {
                    this.classList.remove('is-invalid');
                }
            });
        });
    }

    initFormValidation();

    function validateCurrentPage() {
        if (currentPage === 1) {
            const catName = document.getElementById('catName').value.trim();
            const catAge = document.getElementById('catAge').value.trim();
            
            if (!catName || !catAge) {
                alert('請填寫貓咪名稱和年齡。');
                return false;
            }
            
            if (isNaN(catAge) || parseInt(catAge) < 0) {
                alert('請輸入有效的年齡。');
                return false;
            }
        }
        return true;
    }

    function validateForm() {
        const form = document.getElementById('catHealthForm');
        const inputs = form.querySelectorAll('input, select');
        let isValid = true;

        inputs.forEach(input => {
            if (input.hasAttribute('required') && !input.value.trim()) {
                isValid = false;
                input.classList.add('is-invalid');
            } else {
                input.classList.remove('is-invalid');
            }
        });

        if (!isValid) {
            alert('請填寫所有必填欄位。');
        }

        return isValid;
    }
});

// 其他函數保持不變

function calculateScore() {
    let totalScore = 0;
    let categoryScores = {
        diet: 0,
        skin: 0,
        kidney: 0,
        behavior: 0,
        dental: 0,
        digestion: 0,
        history: 0
    };

    const formData = new FormData(document.getElementById('catHealthForm'));
    for (let [name, value] of formData.entries()) {
        const score = parseInt(value);
        if (!isNaN(score)) {
            totalScore += score;
            
            if (name.startsWith('diet') || name === 'water' || name === 'supplements') {
                categoryScores.diet += score;
            } else if (name.startsWith('fur') || name.startsWith('skin')) {
                categoryScores.skin += score;
            } else if (name.startsWith('urine') || name.startsWith('kidney')) {
                categoryScores.kidney += score;
            } else if (name.startsWith('activity') || name === 'anxiety' || name === 'socialBehavior') {
                categoryScores.behavior += score;
            } else if (name.startsWith('oral') || name === 'dentalCare') {
                categoryScores.dental += score;
            } else if (name === 'bowelMovement' || name === 'digestiveHistory') {
                categoryScores.digestion += score;
            } else if (name === 'healthHistory' || name === 'healthChecks') {
                categoryScores.history += score;
            }
        }
    }

    submitSurvey(totalScore, categoryScores);
}

function submitSurvey(totalScore, categoryScores) {
    const formData = new FormData(document.getElementById('catHealthForm'));
    const surveyData = {
        catName: formData.get('catName'),
        catAge: parseInt(formData.get('catAge')),
        catGender: formData.get('catGender'),
        catWeight: parseFloat(formData.get('catWeight')),
        totalScore: totalScore,
        categoryScores: categoryScores
    };

    fetch('/submit_survey', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(surveyData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        // 修改這裡：使用 window.location.href 進行跳轉
        window.location.href = `/results/${data.survey_id}`;
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('提交失敗，請稍後再試。');
    });
}

// 添加這個函數來驗證表單
function validateForm() {
    const form = document.getElementById('catHealthForm');
    const inputs = form.querySelectorAll('input, select');
    let isValid = true;

    inputs.forEach(input => {
        if (input.hasAttribute('required') && !input.value.trim()) {
            isValid = false;
            input.classList.add('is-invalid');
        } else {
            input.classList.remove('is-invalid');
        }
    });

    if (!isValid) {
        alert('請填寫所有必填欄位。');
    }

    return isValid;
}