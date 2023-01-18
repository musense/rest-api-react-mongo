const express = require('express')
const Tag = require('../model/tags')

const tagRouter = new express.Router()

// *simulate delay situation in real world
tagRouter.use(function (req, res, next) {
    console.time('simulate get tag delay...')
    setTimeout(() => {
        next()
        console.timeEnd('simulate get tag delay...')
    }, 3 * 1000)
})

async function readTagsAndSend(req, res, next) {
    const { tagList } = res
    try {
        res.send(tagList)
    } catch (e) {
        res.status(500).send({ message: e.message })
    }
}

async function getAllTags(req, res, next) {
    try {
        const uTagList = await Tag.find()
            .limit(10)
            .sort({ id: 1 })
        // console.log(`router get tag: ${JSON.stringify(res.json(tag))}`)
        let tagList = [];
        let removeConst = ['updatedAt', 'createdAt', '__v']
        uTagList.map((doc) => {
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
                    if (removeConst.includes(key)) return
                    uTag[key] = "" + value
                })
            });
            // console.log(`uTag: ${JSON.stringify(uTag)}`);
            tagList.push(uTag)
        });
        res.tagList = tagList
        next()
    } catch (e) {
        next(e)
        res.status(500).send({ message: e.message })
    }
}

async function getTag(req, res, next) {
    const id = +req.params.id
    // console.log(`getTag req.params.id: ${+req.params.id}`)
    let tag
    try {
        tag = await Tag.findOne({ id })
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

tagRouter.get('/tags'
    , getAllTags
    , readTagsAndSend)

tagRouter.get('/tags/:id'
    , getTag
    , async (req, res) => {

        res.send(res.tag)
    })

tagRouter.post('/tags'
    , getAllTags
    , async (req, res) => {
        const { id, name, showOnPage, taggedNumber } = req.body
        const tag = new Tag({ id, name, showOnPage, taggedNumber, })
        try {
            // throw new Error('add error!!!')
            const saveTag = await tag.save()
            res.status(201).json(saveTag)
        } catch (e) {
            res.status(500).send({ message: e.message })
        }
    })

tagRouter.delete('/tags/:id'
    , getTag
    , async (req, res, next) => {
        try {
            await res.tag.remove()
            next()
        } catch (e) {
            res.status(500).send({ message: e.message })
        }
    }
    , getAllTags
    , readTagsAndSend)

tagRouter.patch('/tags/:id'
    , getTag
    , async (req, res, next) => {
        const { name, showOnPage, taggedNumber } = req.body
        if (name != null) res.tag.name = name
        if (showOnPage != null) res.tag.showOnPage = showOnPage
        if (taggedNumber != null) res.tag.taggedNumber = taggedNumber
        try {
            // const updateTag = await res.tag.save()
            // res.json(updateTag)
            await res.tag.save()
            next()
        } catch (e) {
            res.status(500).send({ message: e.message })
        }
    }
    , getAllTags
    , readTagsAndSend
)

module.exports = tagRouter


