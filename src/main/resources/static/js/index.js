let element = $('.floating-chat');
let sessionId;
let stompClient = null;
let receiverId = null;
let receiveError = 0;
let connection = 0;
let isFirstInteraction = true;
let defaultErrorSocketConnectionMessage = "Nos encontramos sin servicio en estos momentos, inténtelo mas tarde!";
let defaultReconnectionSocketSuccess = "Hemos regresado al servicio";

async function initialize() {
    try {
        retrieveSessionId();
        await connect();
    } catch (error) {
        console.error(error);
    }
}

setTimeout(function () {
    element.addClass('enter');
}, 1000);

element.click(
    openElement
);

function activateLiveChat() {
    document.getElementById('chat-options').style.display = 'none';
    document.getElementById('footer').style.display = 'flex';
}

function connect() {
    return new Promise((resolve, reject) => {
        let socket = new SockJS('https://web.inferencelabs9.com/WebSocketSole/ws');//UAT
        //let socket = new SockJS('https://web-prd.inferencelabs9.com/WebSocketSole/ws');//Productivo
        stompClient = Stomp.over(socket);
        let headers = {
            'sessionId': sessionId
        };

        stompClient.connect(headers, () => {
            onConnected();
            resolve('Conexión exitosa');
        }, (error) => {
            onError(error);
            reject('Error al establecer la conexión');
        });

        setTimeout(() => {
            if (!stompClient.connected) {
                reject('Tiempo de espera excedido. La conexión no se pudo establecer.');
            }
        }, 4000);

        stompClient.debug = function (str) {
            if (str.startsWith('Whoops! Lost connection')) {
                handleLostConnection();
            }
        };
    });
}

function handleLostConnection() {
    if (!receiveError) {
        receiveError = 1;
        sendMessage(defaultErrorSocketConnectionMessage);
    }
    connection = 0;
    console.error('¡Conexión perdida! Intentando reconectar en 5 segundos...');
    setTimeout(() => {
        connect().then(() => {
            receiveError = 0;
            connection = 1;
            sendMessage(defaultReconnectionSocketSuccess);
            console.log('Reconectado exitosamente.');
        }).catch((error) => {
            console.error('Error al intentar reconectar:', error);
        });
    }, 5000);
}

function onConnected() {
    connection = 1;
    stompClient.subscribe('/user/' + sessionId + '/private', receiveNewMessage)
}

function onError() {
    console.log("Websocket connection failed");
}

function openElement() {
    let messages = element.find('.messages');
    let textInput = element.find('.text-box');
    element.find('>i').hide();
    element.addClass('expand');
    element.find('.chat').addClass('enter');
    let strLength = textInput.val().length * 2;
    textInput.keydown(onMetaAndEnter).prop("disabled", false).focus();
    element.off('click', openElement);
    element.find('.header button').click(closeElement);
    element.find('#sendMessage').click(sendNewMessage);
    textInput.keydown(function (event) {
        if (event.keyCode === 13 && !event.shiftKey) {
            event.preventDefault();
            sendNewMessage();
        }
    });
    initializeFileUploadFeature();
    checkFirstInteraction();

    messages.scrollTop(messages.prop("scrollHeight"));
}

function checkFirstInteraction() {
    if (isFirstInteraction) {
        initialize().then(() => {
            if (stompClient && stompClient.connected) {
                createConversationWebSocket();
            }
        });
        isFirstInteraction = false;
    }
}

function closeElement() {
    element.find('.chat').removeClass('enter').hide();
    element.find('>i').show();
    element.removeClass('expand');
    element.find('.header button').off('click', closeElement);
    element.find('#sendMessage').off('click', sendNewMessage);
    element.find('.text-box').off('keydown', onMetaAndEnter).prop("disabled", true).blur();
    setTimeout(function () {
        element.find('.chat').removeClass('enter').show()
        element.click(openElement);
    }, 500);
}

function createUUID() {
    let s = [];
    let hexDigits = "0123456789abcdef";
    for (let i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
    s[8] = s[13] = s[18] = s[23] = "-";
    return s.join("");
}

function sendNewMessage() {
    let newMessage = appendUserNewMessage();
    if (!connection) {
        sendMessage(defaultErrorSocketConnectionMessage);
        return;
    }
    if (!newMessage) return;


    sendMessageWebSocket(newMessage);
}

function appendUserNewMessage() {
    let userInput = $('.text-box');
    let newMessage = userInput.html().replace(/\<div\>|\<br.*?\>/ig, '\n').replace(/\<\/div\>/g, '').trim().replace(/\n/g, '<br>');
    let tmpMessage = newMessage;

    if (!newMessage) return;
    if (isURL(newMessage)) {
        let filename = extractFilenameFromUrl(newMessage);
        newMessage = '<a href="' + newMessage + '" target="_blank">' + filename + '</a>';
    }
    let messagesContainer = $('.messages');

    messagesContainer.append([
        '<li class="self">',
        newMessage,
        '<span class="message-time">', getCurrentHour(), '</span>',
        '</li>'
    ].join(''));

    clearUserInput();
    return tmpMessage;
}

function getDefaultHeaders() {
    return {
        'sessionId': sessionId,
        'receiverId': sessionId
    }
}

function clearUserInput() {
    let userInput = $('.text-box');
    let messagesContainer = $('.messages');

    userInput.html('');
    userInput.focus();

    messagesContainer.finish().animate({
        scrollTop: messagesContainer.prop("scrollHeight")
    }, 250);
}

function scrollDownToEnd() {
    let messagesContainer = $('.messages');
    messagesContainer.finish().animate({
        scrollTop: messagesContainer.prop("scrollHeight")
    }, 250);
}

function receiveNewMessage(payload) {
    let data = payload.body;
    let mensaje = sanitizeText(replaceBreakLines(data.replace('SOLE', 'SOLE')));

    if (isURL(mensaje)) {//If message starts with https or http
        let filename = extractFilenameFromUrl(mensaje);
        mensaje = '<a href="' + mensaje + '" target="_blank"><i class="bi bi-folder-fill"></i> ' + filename + '</a>';
    } else {//Check if https is inside message
        let regex = /{https?:\/\/[^}]*}/g;

        mensaje = mensaje.replace(regex, function(url) {
            let cleanUrl = url.slice(1, -1);
            return '<a href="' + cleanUrl + '" target="_blank" style="text-decoration: underline;">haz click aquí</a>';
        });
    }

    let messagesContainer = $('.messages');
    messagesContainer.append([
        '<li class="other">',
        mensaje,
        '<span class="message-time">', getCurrentHour(), '</span>',
        '</li>'
    ].join(''));
    scrollDownToEnd();
}

function isValidPhoneOrEmail(receiverId) {
    if (typeof receiverId !== 'string') {
        return false;
    }

    let phonePattern = /^9\d{8}$/;
    let emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    return phonePattern.test(receiverId) || emailPattern.test(receiverId);
}

function sendMessageWebSocket(newMessage) {
    let headers = getDefaultHeaders();
    let chatMessage = {
        sender: "",
        content: newMessage,
        type: 'CHAT',
        receiverId: sessionId,
    };
    stompClient.send("/app/message/private", headers, JSON.stringify(chatMessage));
}

function createConversationWebSocket() {
    console.log("Se envio el primer mensaje!!!")
    let headers = getDefaultHeaders();
    let chatMessage = {
        sender: "",
        content: "CREATE CONVERSATION",
        type: 'CHAT',
        receiverId: sessionId,
    };
    stompClient.send("/app/message/create-conversation", headers, JSON.stringify(chatMessage));
}

function sendMessage(message) {
    let messagesContainer = $('.messages');
    messagesContainer.append([
        '<li class="other">',
        message,
        '<span class="message-time">', getCurrentHour(), '</span>',
        '</li>'
    ].join(''));
    scrollDownToEnd();
}

function onMetaAndEnter(event) {
    if ((event.metaKey || event.ctrlKey) && event.keyCode === 13) {
        sendNewMessage();
    }
}

function retrieveSessionId() {
    const storedSessionId = localStorage.getItem("sessionId");
    if (storedSessionId) {
        sessionId = storedSessionId
        console.log("SessionId found: ", storedSessionId);
    } else {
        console.log("Session id not found, generating one");
        sessionId = createUUID();
        localStorage.setItem("sessionId", sessionId);

    }
}

function retrieveReceiverId() {
    const storedReceiverId = localStorage.getItem("receiverId");
    if (storedReceiverId) {
        receiverId = storedReceiverId
        console.log("SessionId found: ", storedReceiverId);
    } else {
        console.log("Receiver id not found");
    }
}

function replaceBreakLines(message) {
    let parts = message.split("\n");
    while (parts.length > 0 && parts[0].trim() === "") {
        parts.shift();
    }
    return parts.join('<br>');
}

function initializeFileUploadFeature() {
    const MAX_FILE_SIZE = 16 * 1024 * 1024;
    const ALLOWED_FILE_TYPES = [
        'audio/mpeg',
        'audio/mp3',
        'video/mp4',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'audio/wav',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/png',
        'image/jpeg'
    ];
    let supportedFormats = ["mp3", "mp4", "pdf", "doc", "docx", "wav", "ppt", "pptx", "xls", "xlsx", "png", "jpeg"];


    try {
        const attachMediaButton = document.getElementById("attachMedia");

        const customFileInput = document.createElement("input");
        customFileInput.setAttribute("type", "file");

        attachMediaButton.addEventListener('click', function () {
            customFileInput.click();
        });

        customFileInput.addEventListener('change', function (evt) {
            const file = this.files[0];
            if (file) {
                if (file.size > MAX_FILE_SIZE) {
                    alert('El archivo es demasiado grande. Debe ser menor de 16MB.');
                    customFileInput.value = '';
                    return;
                }

                if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                    alert('Tipo de archivo no permitido. Por favor, verifica los formatos soportados (' + supportedFormats.join(', ') + ').');
                    customFileInput.value = '';
                    return;
                }

                const formData = new FormData();
                formData.append('file', file);

                //fetch('https://web-prd.inferencelabs9.com/FileUploaderService-1.0/callback', {//Productivo
                fetch('https://web.inferencelabs9.com/FileUploaderService-1.0/callback', {//UAT
                    method: 'POST',
                    credentials: 'omit',
                    headers: {
                        'Accept': 'application/json'
                    },
                    body: formData
                }).then(
                    response => response.json()
                ).then(data => {
                    console.log(data.url);
                    data.url = sanitizeText(data.url)
                    const textBox = $('.text-box');
                    textBox.html(textBox.html() + data.url);
                    sendNewMessage();
                });
            }
        });

        customFileInput.style.display = "none";
        document.body.appendChild(customFileInput);
    } catch (ex) {
        console.log(ex);
    }
}

function isURL(str) {
    return str.startsWith("http://") || str.startsWith("https://");
}

function containsURL(str) {
    return str.includes("http://") || str.includes("https://");
}

function sanitizeText(str) {
    str = str.replace(/\[(TEXT|IMAGE|DOCUMENT|VIDEO|AUDIO)\]/g, '');
    return str.trimStart();
}

//Function added on 28/08/24, it permits to identify if an url is related to a document from Five9 agent side
function containsTags(str) {
    const tagsPattern = /\[(TEXT|IMAGE|DOCUMENT|VIDEO|AUDIO)\]/g;
    return tagsPattern.test(str);
}


function extractFilenameFromUrl(url) {
    let urlObject = new URL(url);
    let decodedPathname = decodeURIComponent(urlObject.pathname);
    return decodedPathname.split('/').pop();
}

function getCurrentHour() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}