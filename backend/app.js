import express from 'express'

const app = express()

app.get('/', (req, res) => {
  res.send('Hello World')
})

// 404 page
/*
  Attenzione: questa istruzione deve sempre essere alla fine del routing
*/
/* 
app.use((req, res) => {
  res.status(404).sendFile('./views/404.html', { root: __dirname })
})
*/
app.listen(3000)