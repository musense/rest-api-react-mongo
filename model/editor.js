const mongoose = require('mongoose')

const editorSchema = mongoose.Schema({
    id: {
        type: Number,
        required: true,
        trim: true,
        unique: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    tags: {
        type: [String],
        required: false,
        trim: true,
    },
    pageView: {
        type: Number,
        required: false,
        trim: true,
        default: 0,
    },
    recommend: {
        type: Number,
        required: false,
        trim: true,
        default: 0,
    },
},
    {
        timestamps: true,
    }
)


const Editor = mongoose.model('editor', editorSchema)

module.exports = Editor