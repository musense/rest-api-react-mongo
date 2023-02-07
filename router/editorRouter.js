const express = require('express');
const { json2html } = require('html2json');
const Editor = require('../model/editor')
const html2json = require('html2json').html2json;

const editorRouter = new express.Router()

// *simulate delay situation in real world
// editorRouter.use(function (req, res, next) {
//     console.time('simulate get editor delay...')
//     setTimeout(() => {
//         next()
//         console.timeEnd('simulate get editor delay...')
//     }, 0 * 1000)
// })

function parseHTML(req, res, next) {
    const content = req.body.content;
    if (content === null) next()

    const jsonData = html2json(content);
    const jsonDataString = JSON.stringify(jsonData)
    console.log(JSON.stringify(jsonDataString))
    // console.log(jsonData.child)
    let title = ''
    let foundH1 = false
    for (const node of jsonData.child) {
        // console.log(node)
        if (foundH1)
            break;

        if (node['tag'] === 'h1') {
            title = node['child'][0]['text']
        }
    }
    console.log(`title: ${title}`)


    res.title = title
    res.jsonDataString = jsonDataString
    next()
}

function parseJSON(req, res, next) {
    if (res.editor.constructor === Array) {
        res.editor
            .filter(edit => edit.content !== null)
            .map(edit => {
                const jsonDataObject = JSON.parse(edit.content)
                const htmlData = json2html(jsonDataObject);
                edit.content = htmlData
            })

    } else if (typeof res.editor === 'object') {
        const content = res.editor.content
        if (content === null) next()

        const jsonDataObject = JSON.parse(content)
        const htmlData = json2html(jsonDataObject);

        res.editor.content = htmlData
    }

    next()
}

async function getEditor(req, res, next) {
    const id = req.params.id
    // console.log(`getEditor req.params.id: ${req.params.id}`)
    // console.log(req)

    let editor
    try {
        editor = await Editor.findOne({ _id: id })
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

async function getAllEditor(req, res, next) {
    try {
        const editor = await Editor.find({})

        res.editor = editor
    } catch (e) {
        res.status(500).send({ message: e.message })
    }
    next()
}

editorRouter.get('/editor'
    , getAllEditor
    , parseJSON
    , async (req, res) => {

        const { editor: editorList } = res
        try {
            res.send(editorList)
        } catch (e) {
            res.status(500).send({ message: e.message })
        }
    })

// *get only title & _id field
editorRouter.get('/editor/title'
    , async (req, res) => {
        try {
            const editor = await Editor.find({}).select('id title')
                // .limit(10)
                // .sort({ id: 1 })
            res.send(editor)
        } catch (e) {
            res.status(500).send({ message: e.message })
        }
    })


editorRouter.get('/editor/:id'
    , getEditor
    , parseJSON
    , async (req, res, next) => {

        res.send(res.editor)
    })

editorRouter.patch('/editor/:id'
    , parseHTML
    , getEditor
    , async (req, res) => {
        const { title, jsonDataString } = res
        res.editor.content = jsonDataString
        res.editor.title = title

        try {
            const updateEditor = await res.editor.save()
            res.json(updateEditor)
        } catch (e) {
            res.status(500).send({ message: e.message })
        }
    })

editorRouter.post('/editor'
    , parseHTML
    , async (req, res) => {
        const { title, jsonDataString } = res
        const id = await Editor.find({}).select('id')
        const editor = new Editor({
            id,
            title,
            content: jsonDataString
        })
        try {
            const saveEditor = await editor.save()
            res.status(201).json(saveEditor)
        } catch (e) {
            res.status(500).send({ message: e.message })
        }
    })

editorRouter.delete('/editor/:id'
    , getEditor
    , async (req, res) => {
        try {
            await res.editor.remove()
            res.json({ message: "Delete editor successful!" })
        } catch (e) {
            res.status(500).send({ message: e.message })
        }
    })



module.exports = editorRouter


