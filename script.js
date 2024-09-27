document.addEventListener('DOMContentLoaded', function() {
    let currentPage = 1;
    const totalPages = document.querySelectorAll('.form-page').length;

    // 添加進度條和頁面指示器
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.innerHTML = '<div class="progress"></div>';
    document.querySelector('.container').insertBefore(progressBar, document.querySelector('form'));

    const pageIndicator = document.createElement('div');
    pageIndicator.className = 'page-indicator';
    document.querySelector('.container').insertBefore(pageIndicator, document.querySelector('form'));

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
            if (currentPage < totalPages) {
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

    // 保留原有的表單提交和評分邏輯
    document.getElementById('catHealthForm').addEventListener('submit', function(e) {
        e.preventDefault();
        calculateScore();
    });

    // calculateScore, displayResults, 和圖表創建函數保持不變
});

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

    displayResults(totalScore, categoryScores);
}

function displayResults(score, categoryScores) {
    document.getElementById('totalScore').textContent = score;
    document.getElementById('results').style.display = 'block';

    let status = '';
    if (score >= 80) {
        status = '貓咪健康狀況非常理想，但仍可進行常規檢查保持良好狀態。';
    } else if (score >= 60) {
        status = '貓咪健康狀況尚可，但需注意某些方面的潛在問題，建議進行進一步檢查。';
    } else if (score >= 40) {
        status = '貓咪健康狀況中等，應該開始考慮進行特定的檢測（如腸道健康、腎臟健康等）。';
    } else {
        status = '貓咪可能存在較多健康問題，建議馬上與獸醫討論，並考慮更深入的檢測如NGS或QPCR。';
    }
    document.getElementById('healthStatus').textContent = status;

    createTotalScorePieChart(score);
    createCategoryPieChart(categoryScores);
    createCategoryBarChart(categoryScores);

    submitSurvey(score, categoryScores);
}

// 在文件開頭添加以下顏色定義
const chartColors = {
    primary: '#EE7300',
    primaryLight: '#FFA64D',
    primaryDark: '#B85700',
    secondary: '#4A90E2',
    background: '#FFF5E6',
    text: '#333333'
};

// 修改 createTotalScorePieChart 函數
function createTotalScorePieChart(score) {
    const ctx = document.getElementById('scoreChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['得分', '未得分'],
            datasets: [{
                data: [score, 100 - score],
                backgroundColor: [chartColors.primary, chartColors.background]
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: '總體健康評分',
                fontColor: chartColors.text
            }
        }
    });
}

// 修改 createCategoryPieChart 函數
function createCategoryPieChart(categoryScores) {
    const ctx = document.getElementById('categoryPieChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['飲食與營養', '毛髮與皮膚', '腎臟健康', '情緒與行為', '牙齒與口腔', '消化與排泄', '壽命與健康史'],
            datasets: [{
                data: Object.values(categoryScores),
                backgroundColor: [
                    chartColors.primary, chartColors.primaryLight, chartColors.primaryDark,
                    chartColors.secondary, '#9b59b6', '#1abc9c', '#34495e'
                ]
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: '各類別健康評分分布',
                fontColor: chartColors.text
            }
        }
    });
}

// 修改 createCategoryBarChart 函數
function createCategoryBarChart(categoryScores) {
    const ctx = document.getElementById('categoryBarChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['飲食與營養', '毛髮與皮膚', '腎臟健康', '情緒與行為', '牙齒與口腔', '消化與排泄', '壽命與健康史'],
            datasets: [{
                label: '各類別得分',
                data: Object.values(categoryScores),
                backgroundColor: [
                    chartColors.primary, chartColors.primaryLight, chartColors.primaryDark,
                    chartColors.secondary, '#9b59b6', '#1abc9c', '#34495e'
                ]
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            responsive: true,
            title: {
                display: true,
                text: '各類別健康評分',
                fontColor: chartColors.text
            }
        }
    });
}

// 其他 JavaScript 代碼保持不變