const mongoose = require('mongoose')

if(process.argv.length < 3) {
  console.log("Please provide the password as an argument: node mongo.js <password>")
  process.exit(1)
}

const password = process.argv[2]
const dbName = 'phonebook-cmd-line'
const url = `mongodb+srv://user0:${password}@cluster0.8rrk2.mongodb.net/${dbName}?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if(process.argv.length >= 5){
  // insert
  const name = process.argv[3]
  const number = process.argv[4]

  const p = new Person({
    name: name,
    number: number,
  })

  p.save().then(result => {
      console.log(`added ${name} number ${number} to phonebook`)
      mongoose.connection.close()
  })
}
if(process.argv.length === 3){
  console.log('phonebook:')
  Person.find({}).then(persons => {
    persons.forEach(person => {
      console.log(person.name, person.number)
    })
    mongoose.connection.close()
  })
}
