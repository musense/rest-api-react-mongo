const express = require('express')
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

function parseHTML(htmlData) {
    const jsonData = html2json(htmlData);
    // console.log(jsonData)
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
    return title
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
editorRouter.get('/editor/title'
    , async (req, res) => {
        try {
            const editor = await Editor.find({}).select('id title')
                .limit(10)
                .sort({ id: 1 })
            res.send(editor)
        } catch (e) {
            res.status(500).send({ message: e.message })
        }
    })

// * ?id={}
editorRouter.get('/editor/:id'
    , getEditor
    , async (req, res, next) => {

        res.send(res.editor)
    })

// TODO: parse HTML
editorRouter.patch('/editor/:id'
    , getEditor
    , async (req, res) => {
        const {content} = req.body;
        console.log(req.body);
        console.log(content);
        
        if (content != null) {
            let title = parseHTML(content)
            console.log(title);
            
            res.editor.content = content
            res.editor.title = title
        }
        try {
            const updateEditor = await res.editor.save()
            res.json(updateEditor)
        } catch (e) {
            res.status(500).send({ message: e.message })
        }
    })

// TODO: parse HTML    
editorRouter.post('/editor', async (req, res) => {
    const { content } = req.body
    const editor = new Editor({ content })
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


