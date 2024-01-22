// const express = require('express')
import express from 'express'
const app = express()
import mongoose from 'mongoose'             //key aJdFrsui6248GtQo
// const mongoose = require('mongoose')    
import cors from 'cors'
// const cors = require('cors')
import dotenv from 'dotenv'
// const dotenv = require('dotenv')
import Contests from './routes/contests.js'
// const Contests = require('./routes/contests')
import codechefData from './routes/codechef.js'
// const codechefData = require('./routes/codechef')
import MainRouter from './routes/mainRouter.js'


const port = process.env.PORT || 4999

dotenv.config()
app.use(cors())
app.use(express.json())


mongoose.connect(process.env.ATLAS).then(() => {
    console.log("databaseConnected")
}).catch((err) => { "error=", err })

app.use('/contests', Contests)

app.use('/codechef', codechefData)

app.use('',MainRouter)

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})


