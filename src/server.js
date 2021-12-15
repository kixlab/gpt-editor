const express = require('express')
const routes = require('./routes')
const cors = require('cors')

const app = express()
const port = 5000

app.use(express.json())
app.use(cors())

// app.use(express.static(__dirname + '/../annotation/build'));

app.use("/api", routes)



app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})