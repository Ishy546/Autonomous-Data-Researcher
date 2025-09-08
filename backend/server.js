import express from "express"
import cors from "cors"
const PORT = 8000

const app = express()

const researchRouter = express.Router()

const researchController = (req, res) => {
    console.log("Received body:", req.body)
    res.json({ message: "Got your data!", data: req.body })
}

researchRouter.post('/', researchController)
app.use(cors())
app.use('/research', researchRouter)

app.listen(PORT, ()=> console.log(`Running on Port ${PORT}`))