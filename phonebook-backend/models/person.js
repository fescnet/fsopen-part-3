const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const url = process.env.MONGODB_URI
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => {
    console.log('connected to mongodb')
  })
  .catch(error => {
    console.log('error connecting to mongodb:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 3, unique: true },
  number: { type: String, required: true, minlength: 8 },
})

personSchema.plugin(uniqueValidator)

personSchema.set('toJSON', {
  transform: (document, newDocument) => {
    newDocument.id = document._id.toString()
    delete newDocument._id
    delete newDocument.__v
  }
})

module.exports = mongoose.model('Person', personSchema)
