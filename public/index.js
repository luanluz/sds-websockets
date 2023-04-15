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

    // model
    const user = {id: null, username: ''}

    // elements
    const formEl = $('form')
    const messageEl = $('#messages')
    const labelEl = $('label[for=message]')

    // client socket
    const socket = io()

    // waiting for user response
    socket.on(consts.userEvent, data => {
        user.id = data?.id
        user.username = data?.username
    })

    // waiting for messages
    socket.on(consts.messageEvent, data => {
        // check message was sender by current client logged
        const bubblePostion = data.sender.id === user.id ? 'end' : 'start'

        messageEl.innerHTML += `
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
