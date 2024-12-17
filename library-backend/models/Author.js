const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 4
  },
  born: {
    type: Number,
  },
})

authorSchema.virtual("bookCount", {
  ref: "Book", 
  localField: "_id", 
  foreignField: "author", 
  count: true, 
})

authorSchema.set("toJSON", { virtuals: true })
authorSchema.plugin(uniqueValidator)

module.exports = mongoose.model('Author', authorSchema)
