import express from 'express'
const Contests = express.Router();
import axios from 'axios';
import { CodeforcesContestData } from '../models/codeforces-contest-data.model.js';
import moment from 'moment';

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
    const banner = data[0].state.data.contestRootBanners[0].banner;
    let past = data[1].state.data.pastContests.data;
    let future = data[4].state.data.topTwoContests;
    let present = [];

    past = past.map(contestData => {
        const startTime = new Date(contestData.startTime * 1000);
        const endTime = new Date((contestData.startTime + 5400) * 1000);
        return {
            platform: 'LEETCODE',
            name: contestData.title,
            url: `https://leetcode.com/contest/${contestData.titleSlug}`,
            start: moment(startTime).format('DD MMM YYYY HH:mm:ss'),
            end: moment(endTime).format('DD MMM YYYY HH:mm:ss'),
            banner: banner
        }
    });

    future = future.map(contestData => {
        const startTime = new Date(contestData.startTime * 1000);
        const endTime = new Date((contestData.startTime + contestData.endTime) * 1000);
        return {
            platform: 'LEETCODE',
            name: contestData.title,
            url: `https://leetcode.com/contest/${contestData.titleSlug}`,
            start: moment(startTime).format('DD MMM YYYY HH:mm:ss'),
            end: moment(endTime).format('DD MMM YYYY HH:mm:ss'),
            banner: banner
        }
    });

    return {
        past: past,
        future: future,
        present: present
    }

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
        const data = await axios.get('https://leetcode.com/_next/data/xVVXH3Clo8h3_-5OShKCy/contest.json', {
            headers: {
                'Host': 'leetcode.com',
                'User-Agent': 'Mozilla/5.0 (X11; Linux i686; rv:110.0) Gecko/20100101 Firefox/110.0.',
                'Cookie': '__cf_bm=nPyZaoaoZDOGHnKIG6sOfvBmYvz6IW0chPXogQEEzS8-1712599533-1.0.1.1-gGpbtUTACvJ4U2_jucId.AFsJZSg9eE5bHdZbnC41bOBbUOgSG9zY32BGsNqeEfEbtaH5mLDa_m9RHGeWjjA.w'
            }
        });
        const contestData = modifyLeetCodeData(data.data.pageProps.dehydratedState.queries);
        res.json({ data: contestData });
    }
    catch (err) {
        console.warn('error =>', err);
    }
})

export default Contests 