import * as express from 'express'
const MainRouter = express.Router()

import { Fact } from '../models/fact.models.js'

// async function getFacts() {
// }


MainRouter.get('/facts', async (req,res) => {
    try{
        const facts = await Fact.aggregate([
            {
                $sample : {size : 5}
            }
        ])
        res.json(facts).status(200)    
    }
    catch{
        res.status(404) 
    }

})
export default MainRouter