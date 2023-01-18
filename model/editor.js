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
},
    {
        timestamps: true,
    }
)


const Editor = mongoose.model('editor', editorSchema)

module.exports = Editor