import CONST from './const.js';

document.addEventListener('DOMContentLoaded', () => {
    const now = new Date();
    const hour = now.getHours();
    const compactModeSwitch = document.getElementById('compact-mode');
    const switchLabel = document.getElementById('switch-label');
    const submitButton = document.querySelector('.submit-button');
    const sendMultiPostBtn = document.getElementById('sendMultiPost');
    const editLastPostBtn = document.getElementById('editLastPost');
    const paymentMethodContainer = document.getElementById('paymentMethodContainer');
    const investmentContainer = document.getElementById('investmentContainer');
    const descriptionContainer = document.getElementById('descriptionContainer');
    const amountInput = document.getElementById('amountInput');
    const descriptionInput = document.getElementById('descriptionInput');
    const messageAl = document.getElementById("success-message");
    const body = document.body;
    const inputGroups = document.querySelectorAll('.input-group');
    const inputs = document.querySelectorAll('.input-group input');
    const formInputs = document.querySelectorAll('input');
    const paymentMethodsSelect = document.getElementById('paymentMethods');
    const categoriesSelect = document.getElementById('categories');
    const selects = document.querySelectorAll('select');
    const prefix = 'Enviar todo ';

    investmentContainer.style.display = 'none';

    const toggleLightMode = (isLightMode) => {
        body.classList.toggle('light-mode', isLightMode);
        inputGroups.forEach(input => input.classList.toggle('light-mode', isLightMode));
        inputs.forEach(input => input.classList.toggle('light-mode', isLightMode));
        selects.forEach(select => select.classList.toggle('light-mode', isLightMode));
    };

    toggleLightMode(hour >= 6 && hour < 20);

    compactModeSwitch.addEventListener('change', () => {
        const isCompactMode = compactModeSwitch.checked;
        let multiFormData = JSON.parse(localStorage.getItem('multiFormData')) || [];
        paymentMethodContainer.style.display = isCompactMode ? 'none' : 'flex';
        investmentContainer.style.display = isCompactMode ? 'flex' : 'none';
        descriptionContainer.style.display = isCompactMode ? 'none' : 'flex';
        switchLabel.textContent = isCompactMode ? 'Ingreso' : 'Gasto';
        categoriesSelect.disabled = false;

        fillDataLists(!isCompactMode);
        showModifyButton();

        if (multiFormData == null) {
            sendMultiPostBtn.textContent = prefix;
            sendMultiPostBtn.disabled = true;
        } else {
            sendMultiPostBtn.textContent = `${prefix}(${multiFormData.length})`;
            sendMultiPostBtn.disabled = multiFormData.length === 0 ? true : false;
        }
    });

    window.checkInputs = () => {
        submitButton.disabled = !amountInput.value.trim();
    };

    const evaluatePaymentMethod = () => {
        const isCash = paymentMethodsSelect.value === 'Efectivo';

        if (isCash) {
            categoriesSelect.value = 'Apartados';
            categoriesSelect.disabled = true;
        } else {
            categoriesSelect.value = 'Gastos fijos';
            categoriesSelect.disabled = false;
        }
    }

    const evaluateCategory = () => {
        const isInvestment = categoriesSelect.value === 'Inversiones';
        const isCardPayment = categoriesSelect.value === 'Pago de tarjeta';
        if (compactModeSwitch.checked) {
            descriptionContainer.style.display = isInvestment ? 'none' : 'flex';
            investmentContainer.style.display = isInvestment ? 'flex' : 'none';
        } else {
            descriptionContainer.style.display = isCardPayment ? 'none' : 'flex';
        }
    };

    const showModifyButton = () => {
        const lastRegisteredData = JSON.parse(localStorage.getItem('lastRegisteredData')) || [];
        const isCompactMode = compactModeSwitch.checked;

        editLastPostBtn.style.display = (lastRegisteredData.length > 0 && !isCompactMode) ? 'flex' : 'none';
    };

    amountInput.addEventListener('blur', () => {
        let value = amountInput.value.replace(/,/g, '').replace(/\$/g, '');
        if (value.trim() === '') {
            amountInput.value = '';
        } else if (parseFloat(value.trim()) < 0 || value.trim() === '-') {
            amountInput.value = '';
            checkInputs();
            messageAl.textContent = "El monto no puede ser negativo";
            messageAl.style.display = "flex";
            messageAl.classList.add('error-message');
            setTimeout(function () {
                messageAl.textContent = "";
                messageAl.style.display = "none";
                messageAl.classList.remove('error-message');
            }, 1200);
        } else if (!isNaN(value)) {
            value = parseFloat(value);
            amountInput.value = `$${value.toFixed(2)}`;
            checkInputs();
        }
    });

    amountInput.addEventListener('input', checkInputs);
    descriptionInput.addEventListener('input', checkInputs);
    paymentMethodsSelect.addEventListener('change', evaluatePaymentMethod);
    categoriesSelect.addEventListener('change', evaluateCategory);
    checkInputs();
    showModifyButton();
    init();
    //fillDataLists(true);
});

async function init() {
    const response = await fetch(`${CONST.URL}?accessType=${encodeURIComponent("fillData")}`);
    const encoded = await response.text();
    const decoded = atob(encoded.trim());
    const result = JSON.parse(decoded);
    console.log(result);

    localStorage.setItem('paymentMethodList', result.paymentMethodList);
    localStorage.setItem('expenseCategoryList', result.expenseCategoryList);
    localStorage.setItem('incomeCategoryList', result.incomeCategoryList);
    localStorage.setItem('investmentList', result.investmentList);

    fillDataLists(true);
}

async function fillDataLists(isSpend) {
    const paymentMethodSelect = document.getElementById('paymentMethods');
    const categorySelect = document.getElementById('categories');
    const investmentSelect = document.getElementById('investments');
    const paymentMethodList = localStorage.getItem('paymentMethodList').split(",") || [];
    const expenseCategoryList = localStorage.getItem('expenseCategoryList').split(",") || [];
    const incomeCategoryList = localStorage.getItem('incomeCategoryList').split(",") || [];
    const investmentListData = localStorage.getItem('investmentList').split(",") || [];

    paymentMethodSelect.innerHTML = '';
    categorySelect.innerHTML = '';
    investmentSelect.innerHTML = '';

    paymentMethodList.forEach(card => {
        const option = document.createElement('option');
        option.value = card;
        option.textContent = card;
        paymentMethodSelect.appendChild(option);
    });

    const categoriesToUse = isSpend ? expenseCategoryList : incomeCategoryList;
    categoriesToUse.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat === 'N?mina' ? 'Nómina' : cat;
        option.textContent = cat === 'N?mina' ? 'Nómina' : cat;
        categorySelect.appendChild(option);
    });

    investmentListData.forEach(investment => {
        const option = document.createElement('option');
        option.value = investment;
        option.textContent = investment;
        investmentSelect.appendChild(option);
    });
}

const clearLocalStorage = () => {
    localStorage.removeItem('lastRegisteredData');
};

window.addEventListener('beforeunload', clearLocalStorage);
window.addEventListener('pagehide', clearLocalStorage);