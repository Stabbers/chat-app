const socket = io()

//socket overseer OrderofOperations:
//      sender(emit) -> reciever(recieve) /acknowledgement--> sender

//alemants
const $messageForm = document.querySelector('#chat-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton  = document.querySelector('#share-location')
const $messages = document.querySelector('#messages')


//templates:
const messageTemplate = document.querySelector('#message-template').innerHTML
const linkTemplate = document.querySelector('#link-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})


//Socket Calls
socket.on('sendMessage' , (message) => {
    //console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm:ss')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage' , (locMSG) => {
    console.log(locMSG)

    const link = Mustache.render(linkTemplate, {
        username: locMSG.username,
        message: locMSG.text,
        LocationLink: locMSG.url,
        createdAt: moment(locMSG.createdAt).format('h:mm:ss')
    })
    $messages.insertAdjacentHTML('beforeend', link)
    autoscroll()
})

socket.on('countUpdated' , (count) => {
    console.log(`count updated: ${count} high, since Server reset.`)

    // const html = Mustache.render(messageTemplate, {
    //     count: count,
    // })
    // $counts.insertAdjacentHTML('beforeend', html)
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

socket.on('displaymsg' , (msg) => {
    console.log(`page loaded: ${msg}`)
})

const autoscroll = () => {
    //get newset message
    const $newMessage = $messages.lastElementChild

    //calc Height
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    //visible height
    const visibleHeight = $messages.offsetHeight
    //height of messages container
    const containerHeight = $messages.scrollHeight
    //current scroll distance
    const scrollOffset = $messages.scrollTop + visibleHeight


    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
    
}



$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')
    //disable
    const message = e.target.elements.message.value
    //document.querySelector('input').value

    if (message === '') {
        return $messageFormButton.removeAttribute('disabled')
    }
    socket.emit('sendMessage', message, (callback) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        //enable
        console.log(callback)
    })
})

$locationButton.addEventListener('click', () =>{
    $locationButton.setAttribute('disabled', 'disabled')

    if (!navigator.geolocation) {
        //setAttribute('disabled', 'disabled')
        return alert('Geolocation not supported by this Browser')
    }

    navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude
        const lon = position.coords.longitude
        socket.emit('sendLocation', `https://google.com/maps?=${lat},${lon}`, () => {
            //console.log(`sharing your location : https://google.com/maps?=${lat},${lon}`)
        })
        $locationButton.removeAttribute('disabled')
    })
})

// document.querySelector('#increment').addEventListener('click', () =>{
//     socket.emit('increment', () =>{
//         //console.log('increment sent')
//     })
// })

socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})