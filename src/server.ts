import express from "express"
import { config, run } from "./utils/app-config"
import { connectDB } from "./utils/db"
import getRoutes from "./routes"
import { configDotenv } from "dotenv"
configDotenv()

const app = config(express)

getRoutes(app)
connectDB()
run(app)
