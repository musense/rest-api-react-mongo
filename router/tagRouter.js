const express = require('express')
const Tag = require('../model/tags')

const router = new express.Router()

async function getTag(req, res, next) {
    const id = +req.params.id
    // console.log(`getTag req.params.id: ${+req.params.id}`)
    let tag
    try {
        tag = await Tag.findOne({ id: id })
        // return res.json(tag)
        if (tag == undefined) {
            return res.status(404).json({ message: "can't find tag!" })
        }
    } catch (e) {
        return res.status(500).send({ message: e.message })
    }
    res.tag = tag
    next()
}

router.get('/tags', async (req, res) => {
    try {
        // const tag = (await new Tag(req.body)).toJSON()
        const tag = await Tag.find().limit(10).sort({ id: 1 })
        // console.log(`router get tag: ${JSON.stringify(res.json(tag))}`)
        res.json(tag)
        // const await tag.toJSON()
    } catch (e) {
        res.status(500).send({ message: e.message })
    }
})

router.post('/tags', async (req, res) => {
    const tag = new Tag({
        id: req.body.id,
        name: req.body.name,
        showOnPage: req.body.showOnPage,
        taggedNumber: req.body.taggedNumber,
    })
    try {
        const saveTag = await tag.save()
        res.status(201).json(saveTag)
    } catch (e) {
        res.status(500).send({ message: e.message })
    }
})

router.get('/tags/:id', getTag, async (req, res) => {
    res.send(res.tag)
})

router.delete('/tags/:id', getTag, async (req, res) => {
    try {
        await res.tag.remove()
        res.json({ message: "Delete tag successful!" })
    } catch (e) {
        res.status(500).send({ message: e.message })
    }
})

router.patch('/tags/:id', getTag, async (req, res) => {
    // if (req.body.id != null) res.tag.id = req.body.id
    if (req.body.name != null) res.tag.name = req.body.name
    if (req.body.showOnPage != null) res.tag.showOnPage = req.body.showOnPage
    if (req.body.taggedNumber != null) res.tag.taggedNumber = req.body.taggedNumber
    try {
        const updateTag = await res.tag.save()
        res.json(updateTag)
    } catch (e) {
        res.status(500).send({ message: e.message })
    }
})

module.exports = router