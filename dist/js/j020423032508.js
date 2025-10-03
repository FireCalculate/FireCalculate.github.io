let principalEle = document.getElementById("principal");
let annualExpensesEle = document.getElementById("annualExpenses");
let stableIncomeEle = document.getElementById("stableIncome");
let annualInterestRateEle = document.getElementById('annualInterestRate');
let inflationRateEle = document.getElementById('inflationRate');
let startYearEle = document.getElementById("startYear");
let currentSystemYear = 36;

function limitInputLength(input, maxLength) {
    if (input.value.length > maxLength) {
        input.value = input.value.slice(0, maxLength);
    }
}

function updatePrincipalDisplay() {
    let value = parseInt(principalEle.value.replace(/\D/g, ''));
    principalEle.value = value;
    document.getElementById("principalDisplay").textContent = (value / 10000) + "万";
}

function updateMonthlyExpensesDisplay() {
    const value = parseFloat(annualExpensesEle.value.replace(/\D/g, ''));
    annualExpensesEle.value = value;
    document.getElementById("monthlyExpensesDisplay").textContent = (value / 10000) + "万, 月均:" + (value / 12).toFixed(2);
}

function updateStableIncomeDisplay() {
    const value = parseFloat(stableIncomeEle.value.replace(/\D/g, ''));
    stableIncomeEle.value = value;
    document.getElementById("stableIncomeDisplay").textContent = value == 0 ? "无" : (value / 10000) + "万, 月均:" + (value / 12).toFixed(2);
}

function incrementInterestRate() {
    annualInterestRateEle.stepUp();
    calculateInterest();
    updateLocalStorage();
}

function decrementInterestRate() {
    if (annualInterestRateEle.value > 0) {
        annualInterestRateEle.stepDown();
        calculateInterest();
    }
    updateLocalStorage();
}

function resetInterestRate() {
    if (annualInterestRateEle.value > 0) {
        annualInterestRateEle.value = 0;
        calculateInterest();
    }
    updateLocalStorage();
}

function incrementPrincipal() {
    principalEle.stepUp();
    updatePrincipalDisplay();
    calculateInterest();
    updateLocalStorage();
}

function decrementPrincipal() {
    if (principalEle.value > 0) {
        principalEle.stepDown();
        updatePrincipalDisplay();
        calculateInterest();
    }
    updateLocalStorage();
}

function incrementAnnualExpenses() {
    annualExpensesEle.stepUp();
    updateMonthlyExpensesDisplay();
    calculateInterest();
    updateLocalStorage();
}

function decrementAnnualExpenses() {
    if (annualExpensesEle.value > 0) {
        annualExpensesEle.stepDown();
        updateMonthlyExpensesDisplay();
        calculateInterest();
    }
    updateLocalStorage();
}

function incrementInflationRate() {
    inflationRateEle.stepUp();
    calculateInterest();
    updateLocalStorage();
}

function decrementInflationRate() {
    if (inflationRateEle.value > 0) {
        inflationRateEle.stepDown();
        calculateInterest();
    }
    updateLocalStorage();
}

function resetInflationRate() {
    if (inflationRateEle.value > 0) {
        inflationRateEle.value = 0;
        calculateInterest();
    }
    updateLocalStorage();
}

function incrementStableIncome() {
    stableIncomeEle.stepUp();
    updateStableIncomeDisplay();
    calculateInterest();
    updateLocalStorage();
}

function decrementStableIncome() {
    if (stableIncomeEle.value > 0) {
        stableIncomeEle.stepDown();
        updateStableIncomeDisplay();
        calculateInterest();
    }
    updateLocalStorage();
}

function resetStableIncome() {
    if (stableIncomeEle.value > 0) {
        stableIncomeEle.value = 0;
        updateStableIncomeDisplay();
        calculateInterest();
    }
    updateLocalStorage();
}

function incrementStartYear() {
    if (startYearEle.value == "") {
        startYearEle.value = currentSystemYear;
    } else {
        startYearEle.stepUp();
    }
    calculateInterest(true);
}

function decrementStartYear() {
    if (startYearEle.value == "") {
        startYearEle.value = currentSystemYear;
    } else {
        startYearEle.stepDown();
    }
    calculateInterest(true);
}

function resetStartYear() {
    startYearEle.value = "";
    calculateInterest(true);
}

function showAlert(errors) {
    let errorList = $('#errorList');
    errorList.empty();
    $.each(errors, function (index, message) {
        errorList.append('<li>' + message + '</li>');
    });
    $('#alertModal').modal('show');
}

//
function parseError(principal, annualInterestRate, stableIncome, annualExpenses, inflationRate) {
    let errors = [];
    if (isNaN(principal) || principal < 0 || principal > 999999999999999) {
        errors.push("0 ≤ 本金 ≤ 999999999999999（如:2000000）");
    }
    if (isNaN(annualInterestRate) || annualInterestRate < 0 || annualInterestRate > 1000) {
        errors.push("0 ≤ 年化利率 ≤ 1000（如:1.693）");
    }
    if (isNaN(stableIncome) || stableIncome < 0 || stableIncome > 999999999) {
        errors.push("0 ≤ 年收入 ≤ 999999999（如:10000）");
    }
    if (isNaN(annualExpenses) || annualExpenses < 0 || annualExpenses > 9999999999) {
        errors.push("0 ≤ 当前年消费 ≤ 9999999999（如:600000）");
    }
    if (isNaN(inflationRate) || inflationRate < 0 || inflationRate > 1000) {
        errors.push("0 ≤ 通胀率 ≤ 1000（如:2.2229）<a class='th-info' href='https://www.baidu.com/s?wd=中国近十年通胀率' target='_blank'>中国近十年通胀率平均在2.229%左右</a>");
    }
    return errors;
}

function innerHTMLExpense(annualExpensesCell, annualExpenses, additionalExpenses, principal) {
    annualExpensesCell.innerHTML =
        `
<td>
    <div class="row ${principal <= 0 ? 'justify-content-center' : ''}">
        <div class="col-4 order-1 ${principal <= 0 ? 'd-none' : ''}">
            <div class="text-right">${additionalExpenses != 0 ? additionalExpenses : ""}</div>
        </div>
        <div class="${principal <= 0 ? '' : 'col-5 order-2'}">
            <div class="${principal <= 0 ? 'text-center' : 'text-left'}">${annualExpenses.toFixed(2)} ${principal <= 0 ? "(不足)" : ""}</div>
        </div>
        <div class="col-3 order-3 ${principal <= 0 ? 'd-none' : ''}">
            <div class="d-flex align-items-center justify-content-end text-right">
                <div class="d-flex flex-grow-1">
                    <button class="btn btn-sm btn-secondary btn-extra-expense btn-extra-expense0 hidden mx-1" title="自后所有年清零额外支出">×</button>
                    <!-- <button class="btn btn-sm btn-secondary btn-extra-expense btn-extra-expense1 hidden mx-1">↓</button> -->
                    <button class="btn btn-sm btn-secondary btn-extra-expense btn-extra-expense2 hidden mx-1" title="自后所有年增加额外支出">+</button>
                </div>
            </div>
        </div>
    </div>
</td>



        `
}

function innerHTMLIncome(interestCell, annualInterest, additionalIncome) {
    interestCell.innerHTML =
        `
<td>
    <div class="row">
        <div class="col-4 order-1">
            <div class="text-right">${additionalIncome != 0 ? additionalIncome : ""}</div>
        </div>
        <div class="col-5 order-2">
            <div class="text-left">${annualInterest.toFixed(2)}</div>
        </div>
        <div class="col-3 order-3">
            <div class="d-flex align-items-center justify-content-end text-right">
                <div class="d-flex flex-grow-1">
                    <button class="btn btn-sm btn-secondary btn-extra-income btn-extra-income0 hidden mx-1" title="自后所有年清零额外收入">×</button>
                    <!-- <button class="btn btn-sm btn-secondary btn-extra-income btn-extra-income1 hidden mx-1">↓</button> -->
                    <button class="btn btn-sm btn-secondary btn-extra-income btn-extra-income2 hidden mx-1" title="自后所有年增加额外收入">+</button>
                </div>
            </div>
        </div>
    </div>
</td>


        `
}

//
let lineChart;

function drawLineChart(noChart, years, interests, principals, expenses) {
    if (noChart) {
        return;
    }
    if (lineChart) {
        lineChart.destroy();
    }
    let ctx = document.getElementById("lineChart").getContext('2d');
    let gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(214, 39, 40, 0.3)');
    gradient.addColorStop(1, 'rgba(214, 39, 40, 0.1)');
    lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [{
                label: '消费',
                data: expenses,
                borderColor: 'rgba(44, 160, 44, 1)',
                backgroundColor: 'rgba(44, 160, 44, 0.2)',
                fill: true,
            }, {
                label: '年利息',
                data: interests,
                borderColor: 'rgba(31, 119, 180, 1)',
                backgroundColor: 'rgba(31, 119, 180, 0.2)',
                fill: true,
            }, {
                label: '本金',
                data: principals,
                borderColor: 'rgba(214, 39, 40, 1)',
                backgroundColor: gradient,
                fill: true,
            }]
        }
    });
}


function performRowClickOperations(clickedCell) {
    let clickedRow = clickedCell.closest('tr');
    // 检查是否点击的是刚刚生成的详细计算行
    if (!clickedRow.hasClass('detailed-calculation')) {
        $('.detailed-calculation').remove();
        $('.btn-extra-expense').addClass('hidden');
        $('.btn-extra-income').addClass('hidden');
    }
    // 检查是否为第一行或本金为0的行
    if (parseFloat(clickedRow.find('.principal-cell').text()) > 0) {
        clickedRow.find('.btn-extra-expense').removeClass('hidden');
        clickedRow.find('.btn-extra-income').removeClass('hidden');

        let firstRow = clickedRow.is(':first-child');

        let regex = /-?\d+(\.\d+)?/g;
        // 计算详细值
        let matchesExpense = clickedRow.find('.annual-expenses-cell').text().match(regex);
        let matchesExpense1 = parseFloat(matchesExpense[0]);
        let matchesExpense2 = parseFloat(matchesExpense[1]);

        let expense, extraExpense;
        if (Math.abs(matchesExpense2) > 0) {
            expense = matchesExpense2.toFixed(2);
            extraExpense = matchesExpense1;
        } else {
            expense = matchesExpense1.toFixed(2);
            extraExpense = "";
            clickedRow.find('.btn-extra-expense0').css('visibility', 'hidden');
        }

        // console.log("-----------1")
        // console.log(matchesExpense[0])
        // console.log(matchesExpense[1])
        // console.log(matchesExpense1)
        // console.log(matchesExpense2)
        // console.log(expense)
        // console.log(extraExpense)

        let matchesIncome = clickedRow.find('.interest-cell').text().match(regex);
        let matchesIncome1 = parseFloat(matchesIncome[0]);
        let matchesIncome2 = parseFloat(matchesIncome[1]);

        let income, extraIncome;
        if (Math.abs(matchesIncome2) > 0) {
            income = matchesIncome2.toFixed(2);
            extraIncome = matchesIncome1 + "+";
        } else {
            income = matchesIncome1.toFixed(2);
            extraIncome = "";
            clickedRow.find('.btn-extra-income0').css('visibility', 'hidden');
        }

        // console.log("-----------2")
        // console.log(matchesIncome[0])
        // console.log(matchesIncome[1])
        // console.log(matchesIncome1)
        // console.log(matchesIncome2)
        // console.log(income)
        // console.log(extraIncome)

        let lastPrincipal = parseFloat(firstRow ? principalEle.value.toString() : clickedRow.prev().find('.principal-cell').text());
        let lastAnnualExpenses;
        if (firstRow) {
            lastAnnualExpenses = annualExpensesEle.value.toString()
        } else {
            let matchesLastExpense = clickedRow.prev().find('.annual-expenses-cell').text().match(regex);
            let 支出1 = parseFloat(matchesLastExpense[0]);
            let 支出2 = parseFloat(matchesLastExpense[1]);
            lastAnnualExpenses = Math.abs(支出2) > 0 ? 支出2 : 支出1;
        }

        let annualExpensesCalculation = `<span class="expenses-color">${extraExpense}</span>-(1+${inflationRateEle.value.toString()}%)×<span class="expenses-color">${((firstRow ? 1 : -1) * lastAnnualExpenses).toFixed(2)}</span>`;
        let annualInterestCalculation = `<span class="interest-color">${extraIncome}</span>(<span class="principal-color">${lastPrincipal.toFixed(2)}</span><span class="expenses-color">${extraExpense}${expense}</span>)×${annualInterestRateEle.value}%`;
        let principalCalculation = `<span class="principal-color">${lastPrincipal.toFixed(2)}</span><span class="expenses-color">${extraExpense}${expense}</span>+<span class="interest-color">${extraIncome}${income}</span>${stableIncomeEle.value > 0 ? "+" + stableIncomeEle.value : ""}`;

        let newRowHtml = `
                <tr class="detailed-calculation">
                    <td class="text-center">
                        <button class="collapse-button" title="收起">⤢</button>
                    </td>
                    <td class="text-center">=${annualExpensesCalculation}</td>
                    <td class="text-center">=${annualInterestCalculation}</td>
                    <td class="text-center">=${principalCalculation}</td>
                </tr>
            `;
        clickedRow.after(newRowHtml);
    }
}

let defaultOpenCellYearCount = 0;
let additionalExpensesMap = new Map();
let additionalIncomeMap = new Map();
let liveYear;

function updateMapValues(map, startYear, value, reset) {
    let maxYear = reset ? 101 : liveYear;
    for (let i = startYear; i <= maxYear; i++) {
        if (reset || value === 0) {
            map.delete(i);
        } else {
            map.set(i, value);
        }
    }
}

function handleExpenseButtonClick(event, increase, reset) {
    event.stopPropagation();
    let yearCount = $(this).closest('tr').index() + 1;
    let existingAdditionalExpense = additionalExpensesMap.get(yearCount) || 0;
    let value = reset ? 0 : (increase ? existingAdditionalExpense + (-1000) : Math.min(existingAdditionalExpense - (-1000), 0));
    updateMapValues(additionalExpensesMap, yearCount, value, reset);
    defaultOpenCellYearCount = yearCount;
    calculateInterest();
    let clickedCell = $(`#resultTable tr:nth-child(${defaultOpenCellYearCount}) td:first-child`);
    if (clickedCell.length > 0) {
        performRowClickOperations(clickedCell);
    }
}

function handleIncomeButtonClick(event, increase, reset) {
    event.stopPropagation();
    let yearCount = $(this).closest('tr').index() + 1;
    let existingAdditionalIncome = additionalIncomeMap.get(yearCount) || 0;
    let value = reset ? 0 : (increase ? existingAdditionalIncome + 1000 : Math.max(existingAdditionalIncome - 1000, 0));
    updateMapValues(additionalIncomeMap, yearCount, value, reset);
    defaultOpenCellYearCount = yearCount;
    calculateInterest();
    let clickedCell = $(`#resultTable tr:nth-child(${defaultOpenCellYearCount}) td:first-child`);
    if (clickedCell.length > 0) {
        performRowClickOperations(clickedCell);
    }
}

$(document).ready(function () {
    $(document).on('click', 'td', function () {
        let clickedCell = $(this);
        performRowClickOperations(clickedCell);
    });

    $(document).on('click', '.collapse-button', function (event) {
        event.stopPropagation();
        $('.detailed-calculation').remove();
        $('.btn-extra-expense').addClass('hidden');
        $('.btn-extra-income').addClass('hidden');
    });

    $(document).on('click', '.btn-extra-expense0', function (event) {
        handleExpenseButtonClick.call(this, event, null, true);
    });

    $(document).on('click', '.btn-extra-expense1', function (event) {
        handleExpenseButtonClick.call(this, event, false, false);
    });

    $(document).on('click', '.btn-extra-expense2', function (event) {
        handleExpenseButtonClick.call(this, event, true, false);
    });

    $(document).on('click', '.btn-extra-income0', function (event) {
        handleIncomeButtonClick.call(this, event, null, true);
    });

    $(document).on('click', '.btn-extra-income1', function (event) {
        handleIncomeButtonClick.call(this, event, false);
    });

    $(document).on('click', '.btn-extra-income2', function (event) {
        handleIncomeButtonClick.call(this, event, true);
    });
});


//

function parseFloatInfo(principal, annualInterestRate, stableIncome, annualExpenses, inflationRate) {
    let floatingInfo = '<div>';

    if (principal !== 0) {
        floatingInfo += `<strong>本金:</strong> ${principal} `;
    }

    if (annualInterestRate !== 0) {
        floatingInfo += `<strong>年化:</strong> ${annualInterestRate}% `;
    }

    if (stableIncome !== 0) {
        floatingInfo += `<strong>年收入:</strong> ${stableIncome} `;
    }

    floatingInfo += '</div><div>';

    if (annualExpenses !== 0) {
        floatingInfo += `<strong>年消费:</strong> ${annualExpenses} `;
    }

    if (inflationRate !== 0) {
        floatingInfo += `<strong>通胀率:</strong> ${inflationRate}% `;
    }

    floatingInfo += '</div>';
    return floatingInfo;
}

function showFloatingInfo(floatingInfo, liveYearCount) {
    let floatingText = document.getElementById("floatingText");
    floatingText.innerHTML = "";

    const summarizeMap = (sourceMap) => {
        return Array.from(sourceMap.entries())
            .filter(([year]) => year <= liveYearCount)
            .sort(([yearA], [yearB]) => yearA - yearB)
            .slice(0, 10)
            .map(([year, value]) => `年${year}: ${value}`);
    };

    const expensesSummary = summarizeMap(additionalExpensesMap);
    const incomeSummary = summarizeMap(additionalIncomeMap);

    if (additionalExpensesMap.size > 10) {
        expensesSummary.push("...");
    }
    if (additionalIncomeMap.size > 10) {
        incomeSummary.push("...");
    }

    const createDiv = (innerHTML, flex, paddingRight, paddingLeft, title) => {
        const div = document.createElement("div");
        div.style.flex = flex;
        div.style.paddingRight = paddingRight;
        div.style.paddingLeft = paddingLeft;
        div.style.textAlign = "center";

        const titleDiv = document.createElement("div");
        titleDiv.textContent = title;
        titleDiv.style.fontWeight = "bold";
        titleDiv.style.textAlign = "center";
        div.appendChild(titleDiv);

        const contentDiv = document.createElement("div");
        contentDiv.innerHTML = innerHTML;
        div.appendChild(contentDiv);

        return div;
    };

    const mainDiv = document.createElement("div");
    mainDiv.style.display = "flex";
    mainDiv.style.flexDirection = "column";
    mainDiv.style.alignItems = "center";

    const floatingDiv = document.createElement("div");
    floatingDiv.innerHTML = floatingInfo;
    floatingDiv.style.marginBottom = "5px";
    mainDiv.appendChild(floatingDiv);

    const flexContainer = document.createElement("div");
    flexContainer.style.display = "flex";
    flexContainer.style.width = "100%";

    if (additionalExpensesMap.size > 0) {
        const expenseDiv = createDiv(expensesSummary.join("<br>"), "1", "10px", "0", "额外支出");
        flexContainer.appendChild(expenseDiv);
    }

    if (additionalIncomeMap.size > 0) {
        const incomeDiv = createDiv(incomeSummary.join("<br>"), "1", "0", "10px", "额外收入");
        flexContainer.appendChild(incomeDiv);
    }

    mainDiv.appendChild(flexContainer);
    floatingText.appendChild(mainDiv);
}

function setTableTitle() {
    function setTitle(selector, formula) {
        let element = document.querySelector(selector);
        element.textContent = formula;
    }

    setTitle(".expense-title", (additionalExpensesMap.size === 0 ? "" : "支出+") + "(1+通胀率%)×上年消费");
    setTitle(".income-title", (additionalIncomeMap.size === 0 ? "" : "收入+") + "(上年本金-年消费)×年化利率%");
}
