window.onload = () => {
    // constants
    const consts = {
        inputLabelTextUser: 'Digite seu usuário',
        inputLabelTextMessage: 'Digite sua mensagem',
        userEvent: 'user',
        messageEvent: 'message'
    }
    const states = {
        wasClicked: false
    }

    // utils
    const $ = document.querySelector.bind(document)
    const sendMessage = message => {
        const event = states.wasClicked ? consts.messageEvent : consts.userEvent
        socket.emit(event, message)
    }

    // Elements
    const formEl = $('form')
    const messageEl = $('#messages')
    const labelEl = $('label[for=message]')

    // client socket
    const socket = io()

    // waiting for messages
    socket.on(consts.messageEvent, message => messageEl.innerHTML += `
        <div class="chat chat-end">
            <div class="chat-bubble">${message}</div>
        </div>`
    )

    labelEl.textContent = consts.inputLabelTextUser

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
