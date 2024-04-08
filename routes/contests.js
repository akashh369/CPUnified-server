import express from 'express'
const Contests = express.Router();
import axios from 'axios';
import { CodeforcesContestData } from '../models/codeforces-contest-data.model.js';

const sliceConstant = -5;

const modifyCodeChefData = (data) => {
    let { past_contests, present_contests, future_contests } = data;
    past_contests = past_contests.map(data => {
        return {
            platform: "CODECHEF",
            name: data.contest_name,
            url: 'https://www.codechef.com/' + data.contest_code,
            start: data.contest_start_date,
            end: data.contest_end_date,
            banner: `https://cdn.codechef.com/download/small-banner/${data.contest_code}/${data.image}.png`
        }
    });

    present_contests = present_contests.map(data => {
        return {
            platform: "CODECHEF",
            name: data.contest_name,
            url: 'https://www.codechef.com/' + data.contest_code,
            start: data.contest_start_date,
            end: data.contest_end_date,
            banner: `https://cdn.codechef.com/download/small-banner/${data.contest_code}/${data.image}.png`
        }
    });
    future_contests = future_contests.map(data => {
        return {
            platform: "CODECHEF",
            name: data.contest_name,
            url: 'https://www.codechef.com/' + data.contest_code,
            start: data.contest_start_date,
            end: data.contest_end_date,
            banner: `https://cdn.codechef.com/download/small-banner/${data.contest_code}/${data.image}.png`
        }
    })
    return {
        past: past_contests.slice(sliceConstant) || [],
        present: present_contests.slice(sliceConstant) || [],
        future: future_contests.slice(sliceConstant) || []
    }
}

const modifyCodeForcesData = (data) => {
    let past = [], future = []
    data.map(cData => {
        switch (cData.phase) {
            case "BEFORE":
                future.push(cData);
            case "FINISHED":
                past.push(cData);
        }
    })

    return {
        past: past,
        present: [],
        future: future
    }
}

const modifyLeetCodeData = (data) => {
    console.log(data);
}

Contests.get('/codechef', async (req, res) => {

    const data = await axios.get('https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc&offset=0&mode=premium')
    const contestData = modifyCodeChefData(data.data);
    res.json({ data: contestData });

})

Contests.get('/codeforces', async (req, res) => {
    try {
        const data = await CodeforcesContestData.find({}).lean();
        const contestData = modifyCodeForcesData(data);
        res.json({ data: contestData });
    }
    catch (err) {
        console.warn('error', err);
    }
});

Contests.get('/leetcode', async (req, res) => {
    try {
        const data = await axios({
            method: 'get',
            url: 'https://cors-anywhere.herokuapp.com/https://example.com/',
            headers: { 'Origin': 'https://leetcode.com/_next/data/xVVXH3Clo8h3_-5OShKCy/contest.json' }
        })
        const url = "https://proxy.cors.sh/https://leetcode.com/_next/data/xVVXH3Clo8h3_-5OShKCy/contest.json"
        // const data = await axios.post('https://leetcode.com/_next/data/xVVXH3Clo8h3_-5OShKCy/contest.json')
        const contestData = modifyLeetCodeData(data);
        res.json({ data: contestData });
    }
    catch (err) {
        console.warn('error =>', err);
    }
})

export default Contests 