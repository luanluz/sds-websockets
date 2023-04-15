window.onload = () => {
    // constants
    const socketEvent = 'messageEvent'

    // utils
    const $ = document.querySelector.bind(document)
    const sendMessage = message => socket.emit(socketEvent, message)

    // client socket
    const socket = io()

    // waiting for messages
    socket.on(socketEvent, message => $('#messages').innerHTML += `
        <div class="chat chat-end">
            <div class="chat-bubble">${message}</div>
        </div>`
    )

    // submit form
    $('form').addEventListener('submit', event => {
        const messageField = event.target.message

        event.preventDefault()

        if (messageField.value)
            sendMessage(messageField.value)

        messageField.value = ''
        messageField.focus()
    })
}
