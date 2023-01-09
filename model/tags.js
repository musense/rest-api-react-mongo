const mongoose = require('mongoose')

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
        default:false,
        trim: true,
    },
    taggedNumber: {
        type: Number,
        required: true,
        trim: true,
        validate(value) {
            if (value < 0) {
                throw new Error('TaggedNumber at least should be zero!')

            }
        }
    },
},
    {
        timestamps: true,
    }
)


const Tag = mongoose.model('tags', tagsSchema)

module.exports = Tag