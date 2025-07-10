const CLOUD_FUNCTION_URL = 'https://us-central1-ukrainian-church-vinarso-web.cloudfunctions.net/sendEmail';
const SENDER_EMAIL = 'msmjtsenkder@gmail.com';
const RECIPIENT_EMAIL = 'yuriishabanov1846@gmail.com';
const BASE_SUBJECT = 'IGCU Form';

function initContactForm(formId, lang = 'es', subjectPrefix = '') {
    const form = document.getElementById(formId);
    if (!form) {
        console.error(`Formulario con ID "${formId}" no encontrado.`);
        return;
    }

   const messages = {
        es: {
            sending: 'Enviando...',
            verifyRobot: 'Por favor, verifica que no eres un robot.',
            privacyConsent: 'Debes aceptar la política de privacidad para enviar el formulario.',
            alertSuccess: '¡Tu mensaje ha sido enviado con éxito! Nos pondremos en contacto contigo pronto.',
            sentSuccess: '¡Mensaje enviado con éxito!',
            sendError: 'Error al enviar el mensaje:',
            connectionError: 'Hubo un error de conexión. Por favor, inténtalo de nuevo.',
            pleaseTryAgain: 'Por favor, inténtalo de nuevo.'
        },
        en: {
            sending: 'Sending...',
            verifyRobot: 'Please verify that you are not a robot.',
            privacyConsent: 'You must accept the privacy policy to submit the form.',
            alertSuccess: 'Your message has been sent successfully! We will contact you soon.',
            sentSuccess: 'Message sent successfully!',
            sendError: 'Error sending message:',
            connectionError: 'A connection error occurred. Please try again.',
            pleaseTryAgain: 'Please try again.'
        },
        ca: {
            sending: 'Enviant...',
            verifyRobot: 'Si us plau, verifica que no ets un robot.',
            privacyConsent: 'Has d\'acceptar la política de privadesa per enviar el formulari.',
            alertSuccess: 'El teu missatge ha estat enviat amb èxit! Ens posarem en contacte amb tu aviat.',
            sentSuccess: 'Missatge enviat amb èxit!',
            sendError: 'Error en enviar el missatge:',
            connectionError: 'Hi ha hagut un error de connexió. Si us plau, torna-ho a intentar.',
            pleaseTryAgain: 'Si us plau, torna-ho a intentar.'
        },
        va: {
            sending: 'Enviant...',
            verifyRobot: 'Per favor, verifica que no eres un robot.',
            privacyConsent: 'Has d\'acceptar la política de privacitat per a enviar el formulari.',
            alertSuccess: 'El teu missatge ha sigut enviat amb èxit! Ens posarem en contacte amb tu prompte.',
            sentSuccess: 'Missatge enviat amb èxit!',
            sendError: 'Error en enviar el missatge:',
            connectionError: 'Hi ha hagut un error de connexió. Per favor, torna a intentar-ho.',
            pleaseTryAgain: 'Per favor, torna a intentar-ho.'
        },
        ukr: {
            sending: 'Надсилання...',
            verifyRobot: 'Будь ласка, підтвердьте, що ви не робот.',
            privacyConsent: 'Ви повинні прийняти політику конфіденційності, щоб надіслати форму.',
            alertSuccess: 'Ваше повідомлення успішно надіслано! Ми зв\'яжемося з вами найближчим часом.',
            sentSuccess: 'Повідомлення успішно надіслано!',
            sendError: 'Помилка надсилання повідомлення:',
            connectionError: 'Сталася помилка з\'єднання. Будь ласка, спробуйте ще раз.',
            pleaseTryAgain: 'Будь ласка, спробуйте ще раз.'
        }
    };

    const currentMessages = messages[lang] || messages.es;

    let statusDiv = document.getElementById(`${formId}-status`);
    if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.id = `${formId}-status`;
        statusDiv.style.marginTop = '20px';
        statusDiv.style.textAlign = 'center';
        form.parentNode.insertBefore(statusDiv, form.nextSibling);
    }

    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        statusDiv.textContent = currentMessages.sending;
        statusDiv.style.color = 'yellow';

        const recaptchaResponse = grecaptcha.getResponse();

        if (!recaptchaResponse) {
            statusDiv.textContent = currentMessages.verifyRobot;
            statusDiv.style.color = 'red';
            return;
        }

        const privacyCheckbox = form.querySelector('input[name="privacy"][type="checkbox"]');
        if (privacyCheckbox && !privacyCheckbox.checked) {
            statusDiv.textContent = currentMessages.privacyConsent;
            statusDiv.style.color = 'red';
            return;
        }

        const formData = {};
        const htmlParts = [];
        const textParts = [];

        for (const element of form.elements) {
            if (element.name === 'g-recaptcha-response') {
                continue;
            }

            if (element.name && (
                (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'email' || element.type === 'tel' || element.type === 'number' || element.type === 'url' || element.type === 'date')) ||
                element.tagName === 'TEXTAREA' ||
                element.tagName === 'SELECT'
            )) {
                const value = element.tagName === 'SELECT' && element.options[element.selectedIndex].value === ''
                                       ? ''
                                       : element.value;

                if (value) {
                    formData[element.name] = value;
                    htmlParts.push(`<strong>${element.placeholder || element.name || element.title || element.tagName}:</strong> ${value}`);
                    textParts.push(`${element.placeholder || element.name || element.title || element.tagName}: ${value}`);
                }
            }
        }

        if (privacyCheckbox && privacyCheckbox.checked) {
            htmlParts.push(`<strong>Consentimiento de Privacidad:</strong> Aceptado`);
            textParts.push(`Consentimiento de Privacidad: Aceptado`);
        }

        const emailHtmlContent = htmlParts.map(part => `<p>${part}</p>`).join('');
        const emailTextContent = textParts.join('\n');

        let finalSubject = BASE_SUBJECT;
        if (subjectPrefix) {
            finalSubject += ` - ${subjectPrefix}`;
        }
        if (formData.name) {
            finalSubject += ` (${formData.name})`;
        } else if (formData.email) {
            finalSubject += ` (${formData.email})`;
        }

        const payload = {
            fromEmail: SENDER_EMAIL,
            fromName: formData.name || 'Contacto Web',
            toEmail: RECIPIENT_EMAIL,
            subject: finalSubject,
            htmlContent: emailHtmlContent,
            textContent: emailTextContent,
        };

        try {
            const response = await fetch(CLOUD_FUNCTION_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const resultText = await response.text();

            if (response.ok) {
                statusDiv.textContent = currentMessages.sentSuccess;
                statusDiv.style.color = 'yellow';
                form.reset();
                grecaptcha.reset();
            } else {
                console.error(currentMessages.sendError, resultText);
                statusDiv.textContent = `${currentMessages.sendError} ${resultText || currentMessages.pleaseTryAgain}`;
                statusDiv.style.color = 'red';
                grecaptcha.reset();
            }
        } catch (error) {
            console.error('Error de red o inesperado:', error);
            statusDiv.textContent = currentMessages.connectionError;
            statusDiv.style.color = 'red';
            grecaptcha.reset();
        }
    });
}