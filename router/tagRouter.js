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
        const tagList = await Tag.find()
            // .limit(10)
            .sort({ id: 1 })
        // console.log(`router get tag: ${JSON.stringify(res.json(tag))}`)
        let uTagLst = [];
        let trimConst = ['updatedAt', 'createdAt', '__v']
        tagList.map((doc) => {
            // set default value id db data not set
            let uTag = {
                id: '0',
                name: '',
                showOnPage: 'false',
                taggedNumber: '0',
            };
            Object.entries(doc).map(([docKey, tag]) => {
                if (docKey !== '_doc') return
                Object.entries(tag).map(([key, value]) => {
                    if (trimConst.includes(key)) return
                    uTag[key] = "" + value
                })
            });
            // console.log(`uTag: ${JSON.stringify(uTag)}`);
            uTagLst.push(uTag)
        });
        res.send(uTagLst)
    } catch (e) {
        res.status(500).send({ message: e.message })
    }
})

router.get('/tags/:id', getTag, async (req, res) => {

    res.send(res.tag)
})

router.post('/tags', async (req, res) => {
    const { id, name, showOnPage, taggedNumber } = req.body
    const tag = new Tag({ id, name, showOnPage, taggedNumber, })
    try {
        const saveTag = await tag.save()
        res.status(201).json(saveTag)
    } catch (e) {
        res.status(500).send({ message: e.message })
    }
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
    const { name, showOnPage, taggedNumber } = req.body
    if (name != null) res.tag.name = name
    if (showOnPage != null) res.tag.showOnPage = showOnPage
    if (taggedNumber != null) res.tag.taggedNumber = taggedNumber
    try {
        const updateTag = await res.tag.save()
        res.json(updateTag)
    } catch (e) {
        res.status(500).send({ message: e.message })
    }
})

module.exports = router


