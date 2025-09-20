const express = require('express')
const cors = require('cors')
const app = express()

const port = 3000
app.use(cors())
app.use(express.json())

const usuariosRouter = require('./routes/users.routes');
const authRouter = require('./routes/auth.routes')

app.use('/usuarios', usuariosRouter)
app.use('/auth', authRouter)

app.listen(port, () => {
    console.log(`servidor corriendo en localhost:${port}`)
})  

