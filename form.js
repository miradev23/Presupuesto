import CONST from './const.js';

document.getElementById("transaction-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const form = document.getElementById('transaction-form');
    const loadingIcon = document.getElementById('loading-icon');
    const compactModeSwitch = document.getElementById('compact-mode');
    const submitButton = document.querySelector('.submit-button');
    const submitText = document.getElementById('submit-text');
    const messageAl = document.getElementById("success-message");
    const paymentMethodContainer = document.getElementById('paymentMethodContainer');
    const paymentMethodSelect = document.getElementById('paymentMethods');
    const categoriesSelect = document.getElementById('categories');
    const investmentSelect = document.getElementById('investments');
    const descriptionContainer = document.getElementById('descriptionContainer');
    const multiPostBtn = document.getElementById('multiPost');
    const sendPostBtn = document.getElementById('sendPost');
    const sendMultiPostBtn = document.getElementById('sendMultiPost');
    const editLastPostBtn = document.getElementById('editLastPost');
    const prefix = 'Enviar todo ';

    if (compactModeSwitch.checked) {
        paymentMethodSelect.value = '';
        // descriptionInput.value = '';
        if (categoriesSelect.value != 'Inversiones') {
            investmentSelect.value = '';
        }
    } else {
        investmentSelect.value = '';
    }

    var formData = new FormData(this);
    var today = new Date();
    var formattedDate = today.getDate().toString().padStart(2, '0') + '/' + (today.getMonth() + 1).toString().padStart(2, '0') + '/' + today.getFullYear().toString().slice(-2);

    formData.append("Método de pago", paymentMethodSelect.value);
    formData.append("Categoria", categoriesSelect.value);
    formData.append("Inversión", investmentSelect.value);

    function sendPostRequest(formDataString) {
        return new Promise((resolve, reject) => {

            // URLs a las que enviar el POST
            var url1 = CONST.URL;

            var fetchOptions = {
                redirect: "follow",
                method: "POST",
                body: formDataString,
                headers: {
                    "Content-Type": "text/plain;charset=utf-8",
                }
            };

            Promise.all([fetch(url1, fetchOptions),
                //fetch(url2, fetchOptions)
            ])
                .then(function (response) {
                    if (response) {
                        resolve(response);
                    } else {
                        reject(new Error("Error al enviar el formulario."));
                    }
                })
                .then(function (data) {
                    messageAl.textContent = "Información publicada correctamente!";
                    messageAl.style.display = "flex";
                    setTimeout(function () {
                        messageAl.textContent = "";
                        messageAl.style.display = "none";
                    }, 2000);
                    resolve();
                })
                .catch(function (error) {
                    console.error(error);
                    messageAl.textContent = "Ha ocurrido un error al publicar la información.";
                    messageAl.style.display = "flex";
                    messageAl.classList.add('error-message');
                    setTimeout(function () {
                        messageAl.textContent = "";
                        messageAl.style.display = "none";
                        messageAl.classList.remove('error-message');
                    }, 2000);
                    reject(error);
                });
        });
    }

    async function sendAllRequests(multiFormData) {
        for (let i = 0; i < multiFormData.length; i++) {
            try {
                await sendPostRequest(multiFormData[i]);
            } catch (error) {
                console.error("Error al enviar solicitud múltiple:", error);
                break;
            }
        }

        localStorage.removeItem('multiFormData');
        submitText.textContent = 'Enviar';
        loadingIcon.style.display = 'none';
        submitButton.disabled = true;
        form.reset();
        categoriesSelect.disabled = false;
        paymentMethodContainer.style.display = 'flex';
        descriptionContainer.style.display = 'flex';
        handleSubmitText();
    }

    const submitter = e.submitter;
    if (submitter) {
        // Aqui va la lógica para manejar el botón que se ha pulsado
        if (submitter.id === 'multiPost') {
            multiPostBtn.classList.toggle('enabled');
            toggleSendMultiPost();
        } /* else if (submitter.id === 'editLastPost') {
            const lastRegisteredData = JSON.parse(localStorage.getItem('lastRegisteredData')) || [];
            if (lastRegisteredData.length > 0) {
                const lastData = lastRegisteredData[0];
                form.reset();
                lastData.forEach((item) => {
                    const [key, value] = item.split('=');
                    const input = document.querySelector(`[name="${key}"]`);
                    if (input) {
                        input.value = value;
                    }
                }); */
                /**
                 * Se oculta el botón de editar sin eliminar el registro aun
                 * se elimina segun la lógica después de comparar los datos
                 * con el siguiente registro
                 */
                /* editLastPostBtn.style.display = 'none';
                checkInputs();
            }
        } */ else if (submitter.id === 'sendMultiPost') {
            multiPostBtn.classList.toggle('enabled');
            toggleSendMultiPost();

            loadingIcon.style.display = 'block';
            submitText.textContent = 'Enviando...';
            submitButton.disabled = true;

            let multiFormData = JSON.parse(localStorage.getItem('multiFormData'));
            let lastObj = multiFormData[multiFormData.length - 1];

            lastObj += "&Notify=multi";
            multiFormData[multiFormData.length - 1] = lastObj;
            localStorage.setItem('multiFormData', JSON.stringify(multiFormData));
            sendAllRequests(multiFormData);
        } else if (submitter.id === 'sendPost') {
            loadingIcon.style.display = 'block';
            submitButton.disabled = true;

            // Obtener el valor de la categoría
            var category = document.getElementById("categories").value;

            // Agregar la fecha actual al formData si la categoría no es "Pago de tarjeta"
            if (category !== "Pago de tarjeta") {
                formData.append("Fecha", formattedDate);
            } else {
                // Obtener el mes actual
                var monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
                var currentMonth;
                if (today.getMonth() == 0) {
                    currentMonth = monthNames[11];
                } else {
                    currentMonth = monthNames[today.getMonth() - 1];
                }

                formData.append("Descripción", currentMonth);
            }

            var keyValuePairs = [];
            for (var pair of formData.entries()) {
                keyValuePairs.push(pair[0] + "=" + pair[1]);
            }
            var formDataString = keyValuePairs.join("&");

            if (multiPostBtn.classList.contains('enabled')) {
                submitText.textContent = 'Guardando...';
                let multiFormData = JSON.parse(localStorage.getItem('multiFormData')) || [];
                multiFormData.push(formDataString);
                localStorage.setItem('multiFormData', JSON.stringify(multiFormData));
                incrementDataLenght(multiFormData.length);
                if (multiFormData == null) {
                    sendMultiPostBtn.textContent = prefix;
                    sendMultiPostBtn.disabled = true;
                } else {
                    sendMultiPostBtn.textContent = `${prefix}(${multiFormData.length})`;
                    sendMultiPostBtn.disabled = multiFormData.length === 0 ? true : false;
                }
            } else {
                submitText.textContent = 'Enviando...';
                let lastRegisteredData = JSON.parse(localStorage.getItem('lastRegisteredData')) || [];

                if (lastRegisteredData.length === 0) {
                    /**
                     * Solo entra cuando es un gasto.
                     */
                    if (!compactModeSwitch.checked) {
                        console.log('entro dentro');
                        /**
                         * Se agrega el dato modify vacío para que el script de Google
                         * reconozca que es un registro nuevo y no una modificación
                         */
                        formDataString += "&Modify=";
                        /**
                         * Si no hay datos registrados, se guarda el registro
                         */
                        lastRegisteredData.push(keyValuePairs);
                        localStorage.setItem('lastRegisteredData', JSON.stringify(lastRegisteredData));
                    }
                } else if (lastRegisteredData.length > 0) {
                    const { isModification, differentData } = compareLastRegisteredData(keyValuePairs);

                    if (isModification) {
                        /**
                         * Hay modificación y elimina 'lastRegisteredData' de localStorage
                         * porque ya se hizo modificación con ese registro.
                         */
                        formDataString += `&Modify=${differentData}`;
                        localStorage.removeItem('lastRegisteredData');
                    } else {
                        /**
                         * No hay modificación, se agrega el dato modify vacío para que 
                         * el script de Google reconozca que es un registro nuevo además 
                         * se actualiza el localStorage existente con el último registro
                         * por si se quiere modificar.
                         */
                        formDataString += "&Modify=";
                        lastRegisteredData[0] = keyValuePairs;
                        localStorage.setItem('lastRegisteredData', JSON.stringify(lastRegisteredData));
                    }

                    //console.log(differentData);
                }

                formDataString += "&Notify=simple";
                //console.log(formDataString);
                sendPostRequest(formDataString);
            }

            setTimeout(() => {
                submitText.textContent = 'Enviar';
                loadingIcon.style.display = 'none';
                submitButton.disabled = true;
                form.reset();
                categoriesSelect.disabled = false;
                paymentMethodContainer.style.display = 'flex';
                descriptionContainer.style.display = 'flex';
                handleSubmitText();

                if (compactModeSwitch) {
                    const event = new Event('change');
                    compactModeSwitch.dispatchEvent(event);
                }
            }, 1000);
        }
    }

    function toggleSendMultiPost() {
        let multiFormData = JSON.parse(localStorage.getItem('multiFormData')) || [];
        sendMultiPostBtn.classList.toggle('visible');
        sendPostBtn.classList.toggle('collapsed');
        handleSubmitText();

        if (multiFormData == null) {
            sendMultiPostBtn.textContent = prefix;
            sendMultiPostBtn.disabled = true;
        } else {
            sendMultiPostBtn.textContent = `${prefix}(${multiFormData.length})`;
            sendMultiPostBtn.disabled = multiFormData.length === 0 ? true : false;
        }
    }

    function handleSubmitText() {
        if (sendMultiPostBtn.classList.contains('visible')) {
            submitText.textContent = 'Guardar';
        } else {
            submitText.textContent = 'Enviar';
        }
    }

    function incrementDataLenght(length) {
        if (length > 0) {
            sendMultiPostBtn.textContent = `${prefix}(${length})`;
        } else {
            sendMultiPostBtn.textContent = prefix;
        }
    }

    function compareLastRegisteredData(currentData) {
        let lastRegisteredData = JSON.parse(localStorage.getItem('lastRegisteredData')) || [];
        let lastData = lastRegisteredData[0]; // Usar el registro 0 para comparar
        let differentData = "";
        let equalDataLength = 0;

        lastData.forEach((element, index) => {
            if (element !== currentData[index]) {
                differentData = currentData[index].split('=')[0]; // Obtener el nombre del campo que es diferente
            } else {
                equalDataLength++;
            }
        });

        /**
         * EqualDataLength se compara con la longitud esperada
         * de los datos -1 para verificar si hay un campo a modificar
         */
        const isModification = equalDataLength === lastRegisteredData[0].length - 1;

        return { isModification, differentData };
    }
});