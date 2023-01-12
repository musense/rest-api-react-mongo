const { ObjectId } = require('mongodb')
const mongoose = require('mongoose')

function validatorGTZ(value) {
    return value >= 0
}
const many = [
    { validator: validatorGTZ, msg: 'TaggedNumber at least should be zero!' },
    { validator: Number.isInteger, msg: 'TaggedNumber is not an integer!' }
]
const tagsSchema = mongoose.Schema({
    id: {
        type: Number,
        required: true,
        trim: true,
        unique: true,

    },
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    showOnPage: {
        type: Boolean,
        default: false,
        trim: true,
    },
    taggedNumber: {
        type: Number,
        required: true,
        trim: true,
        default: 0,
        validate: many,
    },
},
    {
        timestamps: true,
    }
)


const Tag = mongoose.model('tags', tagsSchema)

module.exports = Tag