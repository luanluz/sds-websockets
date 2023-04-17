window.onload = () => {
    // constants
    const consts = {
        inputLabelTextUser: 'Digite seu usuário',
        inputLabelTextMessage: 'Digite sua mensagem',
        disconnectEvent: 'disconnectUser',
        userEvent: 'user',
        messageEvent: 'message',
        userInfoEvent: 'userInfo',
        statusEvent: 'status'
    }
    const states = {
        wasClicked: false
    }
    // client socket
    const socket = io()

    // utils
    const $ = document.querySelector.bind(document)
    const sendMessage = message => {
        const event = states.wasClicked ? consts.messageEvent : consts.userEvent
        socket.emit(event, message)
    }
    const showNotification = (message, status = 'success') => {
        const element = noticiationEl(message, status)
        const ms = 5000

        $('#notification').appendChild(element)
        setTimeout(() =>  element.parentElement.removeChild(element), ms)
    }
    const noticiationEl = (message, status) => {
        const element = document.createElement('div')

        element.classList.add('fixed', 'md:bottom-3', 'left-3', 'right-3', 'mt-3')
        element.innerHTML = `
            <div class="alert alert-${status} shadow-lg w-max mx-auto">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current flex-shrink-0 w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>${message}</span>
                </div>
            </div>`

        return element
    }
    // copy and past from: https://www.joshwcomeau.com/snippets/javascript/debounce/
    const debounce = (callback, wait) => {
        let timeoutId = null

        return (...args) => {
            window.clearTimeout(timeoutId)
            timeoutId = window.setTimeout(() => {
                callback.apply(null, args)
            }, wait)
        }
    }
    const sendStatusMessage = debounce(event => {
        if (event.target.value.length && labelEl.textContent != consts.inputLabelTextUser) {
            socket.emit(consts.userInfoEvent, {username: user.username, message: 'está digitando...'})
        }
    }, 1000);

    // model
    const user = {id: null, username: ''}

    // elements
    const formEl = $('form')
    const messagesEl = $('#messages')
    const labelEl = $('label[for=message]')
    const textFieldMessage = $('#message')


    // waiting for user response
    socket.on(consts.userEvent, data => {
        user.id = data?.id
        user.username = data?.username

        showNotification(`Você está conectado como: ${data?.username}`)
        socket.emit(consts.userInfoEvent, {username: user.username, message: 'conectou'})
    })

    // waiting for user info
    socket.on(consts.userInfoEvent, data => showNotification(`${data?.username} ${data?.message}`, 'info'))

    // waiting for desconnected user
    socket.on(consts.disconnectEvent, data => showNotification(data?.message, 'info'))

    // waiting for messages
    socket.on(consts.messageEvent, data => {
        // check message was sender by current client logged
        const bubblePostion = data.sender.id === user.id ? 'end' : 'start'

        messagesEl.innerHTML += `
            <div class="chat chat-${bubblePostion}">
                <div class="chat-image avatar online placeholder">
                    <div class="bg-neutral-focus text-neutral-content rounded-full w-8">
                        <span class="text-xs uppercase">
                            ${data.sender.username.charAt(0)}
                        </span>
                    </div>
                </div>
                <div class="chat-header">
                    ${data.sender.username}
                    <time class="text-xs opacity-50">
                        ${data.sentAt}
                    </time>
                </div>
                <div class="chat-bubble">${data.message}</div>
            </div>`
    })

    labelEl.textContent = consts.inputLabelTextUser

    // listen keyboard
    textFieldMessage.addEventListener('keyup', sendStatusMessage)

    // submit form
    formEl.addEventListener('submit', event => {
        const messageField = event.target.message

        event.preventDefault()

        if (messageField.value)
            sendMessage(messageField.value)

        messageField.value = ''
        messageField.focus()

        if (!states.wasClicked) {
            labelEl.textContent = consts.inputLabelTextMessage
            states.wasClicked = true
        }
    })
}
