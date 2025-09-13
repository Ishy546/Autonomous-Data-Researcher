import express, { Request, Response } from "express"
import cors from "cors"  
import { agent } from "./agentic/agent.js"

const PORT = 8000
const app = express()

app.use(cors())
app.use(express.json())

// POST /research endpoint
app.post("/research", async (req: Request, res: Response) => {
  try {
    const { query } = req.body as { query?: string }

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Missing or invalid query" })
    }

    // Run your agent (make sure agent returns a string!)
    const result = await agent(query)

    res.json({ result })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: "Something went wrong", details: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})