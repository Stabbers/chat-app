const users = []

// addUser, remove, get, Get room's users

const addUser = ({id, username, room}) => {
    //clean data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate Data
    if (!username || !room) {
        return {error: 'Username and Room are both Required.'}
    }

    //check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //Validate username
    if (existingUser) {
        return {error: 'Username already in use'}
    }

    //Store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room="Main") => {
    room = room.trim().toLowerCase()
    const found = users.filter((user) => user.room === room)
    return found
}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}

// //testing
// addUser({
//     id: 146,
//     username: '   Tom',
//     room: 'Main    '
// })
// addUser({
//     id: 12,
//     username: '   Dick',
//     room: 'Main    '
// })
// addUser({
//     id: 15,
//     username: '   Harry',
//     room: 'Main    '
// })
// addUser({
//     id: 55,
//     username: '   Corbin',
//     room: 'His Own    '
// })

// console.log(users)
// console.log('removing Tom')
// removeUser(146)
// console.log(users)
// console.log('fetching Dick')
// console.log(getUser(12))
// console.log('fetching noone')
// console.log(getUser(666))
// console.log('listing users in Main Room')
// console.log(getUsersInRoom('Main'))
// console.log('listing users in nonexistant room')
// console.log(getUsersInRoom('nowhere'))