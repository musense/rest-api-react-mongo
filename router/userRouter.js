const express = require('express')
const User = require('../model/user')

const userRouter = new express.Router()

async function getUser(req, res, next) {
    const { username } = req.params
    console.log(`getUser req.params.username: ${req.params.username}`)
    let user
    try {
        user = await User.findOne({ username })
        // return res.json(user)
        if (user == undefined) {
            return res.status(404).json({ message: "can't find user!" })
        }
    } catch (e) {
        return res.status(500).send({ message: e.message })
    }
    res.user = user
    next()
}

userRouter.get('/user', async (req, res) => {
    try {
        const userList = await User.find()
            .limit(10)
            .sort({ username: 1 })
        // console.log(`router get user: ${JSON.stringify(res.json(user))}`)
        res.send(userList)
    } catch (e) {
        res.status(500).send({ message: e.message })
    }
})

// deprecated
// router.get('/user/loginByEmail/:email/:password', getUser, async (req, res) => {
//     res.send(res.user)
// })
// deprecated
// router.get('/user/loginByName/:username/:password', getUser, async (req, res) => {

//     res.send(res.user)
// })

// test
userRouter.get('/user/:username', getUser, async (req, res) => {

    res.send(res.user)
})

// login
userRouter.post('/user/login', async (req, res) => {
    const { email, password } = req.body
    let user
    if (email) {
        console.log(`/user/login Condition: Email`)
        user = await User.findOne({ email, password })
        try {
            if (user == undefined) {
                return res.status(404).json({ message: "can't find user!" })
            }
        } catch (e) {
            return res.status(500).send({ message: e.message })
        }
    }
    else if (username) {
        console.log(`/user/login Condition: UserName`)
        user = await User.findOne({ username, password })
        try {
            if (user == undefined) {
                return res.status(404).json({ message: "can't find user!" })
            }
        } catch (e) {
            return res.status(500).send({ message: e.message })
        }
    }
    console.log(`/user/login ${user}`)
    res.send(user)
})

// register
userRouter.post('/user/register', async (req, res) => {
    const { email, username, password } = req.body
    const user = new User({ email, username, password })
    try {
        // throw new Error('add error!!!')
        const saveUser = await user.save()
        const registerUserSuccess = Object.assign({}, saveUser['_doc'], { errorMessage: 'register successfully' })
        console.log({registerUserSuccess})
        res.status(201).json(registerUserSuccess)
        // res.status(201).json(saveUser)
    } catch (e) {
        res.status(500).send({ message: e.message })
    }
})

// delete user account
userRouter.delete('/user/:username', getUser, async (req, res) => {
    try {
        await res.user.remove()
        res.json({ message: "Delete user successful!" })
    } catch (e) {
        res.status(500).send({ message: e.message })
    }
})

// modify user account
// TODO: add personal info
userRouter.patch('/user/:username', getUser, async (req, res) => {
    const { name, showOnPage, usergedNumber } = req.body
    if (name != null) res.user.name = name
    if (showOnPage != null) res.user.showOnPage = showOnPage
    if (usergedNumber != null) res.user.usergedNumber = usergedNumber
    try {
        // throw new Error('update error!!!')
        const updateUser = await res.user.save()
        res.json(updateUser)
    } catch (e) {
        res.status(500).send({ message: e.message })
    }
})

module.exports = userRouter


