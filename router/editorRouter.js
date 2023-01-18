const express = require('express')
const Editor = require('../model/editor')

const editorRouter = new express.Router()

// *simulate delay situation in real world
editorRouter.use(function (req, res, next) {
    console.time('simulate get editor delay...')
    setTimeout(() => {
        next()
        console.timeEnd('simulate get editor delay...')
    }, 3 * 1000)
})

async function getEditor(req, res, next) {
    const id = +req.params.id
    // console.log(`getEditor req.params.id: ${+req.params.id}`)
    let editor
    try {
        editor = await Editor.findOne({ id })
        // return res.json(editor)
        if (editor == undefined) {
            return res.status(404).json({ message: "can't find editor!" })
        }
    } catch (e) {
        return res.status(500).send({ message: e.message })
    }
    res.editor = editor
    next()
}

editorRouter.get('/editor', async (req, res) => {
    try {
        const editorList = await Editor.find({})
            .limit(10)
        // .sort({ id: 1 })
        // console.log(`router get editor: ${JSON.stringify(editorList)}`)

        res.send(editorList)
    } catch (e) {
        res.status(500).send({ message: e.message })
    }
})

// *get only title & _id field
editorRouter.get('/editor/title', async (req, res) => {
    try {
        const editor = await Editor.find({}).select('id title')
            .limit(10)
            .sort({ id: 1 })

        let uTitleLst = [];
        let removeConst = ['updatedAt', 'createdAt', '__v']

        editor.map((doc) => {
            // set default value id db data not set
            let uTitle = {
                id: '0',
                title: ''
            };
            Object.entries(doc).map(([docKey, tag]) => {
                if (docKey !== '_doc') return
                Object.entries(tag).map(([key, value]) => {
                    if (removeConst.includes(key)) return
                    uTitle[key] = "" + value
                })
            });
            // console.log(`uTag: ${JSON.stringify(uTag)}`);
            uTitleLst.push(uTitle)
        });
        res.send(uTitleLst)
    } catch (e) {
        res.status(500).send({ message: e.message })
    }
})

// * ?id={}
editorRouter.get('/editor/page', async (req, res, next) => {
    const { id } = req.query
    console.log(`'/editor/page' id: ${id}`)
    if (!id)
        res.json('{error: query should be ?id=}')

    let editor
    try {
        editor = await Editor.findOne({ _id: id })
        if (editor == undefined)
            return res.status(404).json({ message: "can't find editor!" })
    } catch (e) {
        return res.status(500).send({ message: e.message })
    }
    res.send(editor)
})

// * ?id={}
editorRouter.patch('/editor/page', async (req, res) => {
    const { title } = req.query
    if (!title)
        res.json('{error: query should be ?title=}')
    try {

        const updateEditor = await res.editor.save()
        res.json(updateEditor)
    } catch (e) {
        res.status(500).send({ message: e.message })
    }
})

editorRouter.post('/editor', async (req, res) => {
    const { id, title, content } = req.body
    const editor = new Editor({ id, title, content })
    try {
        // throw new Error('add error!!!')
        const saveEditor = await editor.save()
        res.status(201).json(saveEditor)
    } catch (e) {
        res.status(500).send({ message: e.message })
    }
})

// not implemented
// router.delete('/editor/:id', getEditor, async (req, res) => {
//     try {
//         await res.editor.remove()
//         res.json({ message: "Delete editor successful!" })
//     } catch (e) {
//         res.status(500).send({ message: e.message })
//     }
// })



module.exports = editorRouter


