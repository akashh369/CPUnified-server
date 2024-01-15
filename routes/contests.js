import express from 'express'
const Contests = express.Router();
import axios from 'axios';
Contests.get('/codechef', async (req, res) => {
    const data = await axios.get('https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc&offset=0&mode=premium')
    res.json({ data: JSON.stringify(data.data) });
})

export default Contests 