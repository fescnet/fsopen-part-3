const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()
const Person = require('./models/person')
app.use(cors())
app.use(express.static('build'))

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req_body'))
morgan.token('req_body', (req) => {
  return JSON.stringify(req.body)
})

const requestLogger = (req, res, next) => {
  console.log('Method: ', req.method)
  console.log('Path: ', req.path)
  console.log('Body: ', req.body)
  console.log('---')
  next()
}
app.use(requestLogger)

app.get('/', (req, res) => {
  res.send('<h1>This\'s so cool!</h1>')
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons)
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  Person.findById(id).then(person => {
    if(!person){
      return res.status(404).end()
    }
    return res.json(person)
  })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  Person.findByIdAndRemove(id).then(() => {
    res.status(204).end()
  })
    .catch(error => next(error))
})

app.get('/info', (req, res) => {

  const count = Person.find({}).then(persons => persons.length)
  count.then(length => {
    res.send(`
      <p>
        Phonebook has info for ${length} people
      <p>
      <p>
        ${new Date()}
      </p>
    `)
  })
})

app.put('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  const body = req.body

  const newData = {
    number: body.number
  }

  Person.findByIdAndUpdate(id, newData, { new: true } ).then(changedPerson => {
    return res.json(changedPerson)
  })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {

  // it's necessary to copy the object to avoid changing the request's body
  // without this copy, morgan will show the id property of the object.
  const p = { ...req.body }
  const newPerson = new Person({
    name: p.name,
    number: p.number,
  })
  newPerson.save().then(result => {
    res.json(result)
    morgan('resbody', req, res)
  })
    .catch(error => next(error))
})

const errorHandler = (error, req, res, next) => {
  console.error(error.message)
  if(error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  }
  if(error.name === 'ValidationError'){
    return res.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'The resource you are requesting do not exist.' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Listenning at ${PORT}`)
})
