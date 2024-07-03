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
            start: data.contest_start_date.slice(0, -3),
            end: data.contest_end_date.slice(0, -3),
            banner: `https://cdn.codechef.com/download/small-banner/${data.contest_code}/${data.image}.png`
        }
    });

    present_contests = present_contests.map(data => {
        return {
            platform: "CODECHEF",
            name: data.contest_name,
            url: 'https://www.codechef.com/' + data.contest_code,
            start: data.contest_start_date.slice(0, -3),
            end: data.contest_end_date.slice(0, -3),
            banner: `https://cdn.codechef.com/download/small-banner/${data.contest_code}/${data.image}.png`
        }
    });
    future_contests = future_contests.map(data => {
        return {
            platform: "CODECHEF",
            name: data.contest_name,
            url: 'https://www.codechef.com/' + data.contest_code,
            start: data.contest_start_date.slice(0, -3),
            end: data.contest_end_date.slice(0, -3),
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
    let future = data['topTwoContests'];
    let present = data['ongoingVirtualContest'];
    present = present ?? [];
    let futurePresentContestSet = new Set(future.map(data => data.titleSlug));
    present.map(data => futurePresentContestSet.add(data.titleSlug));
    let past = [];
    for (let i = 0; i < 15; i++) {
        if (!futurePresentContestSet.has(data['allContests'][i].titleSlug))
            past.push(data['allContests'][i]);
    }

    past = past.map(contestData => {
        const startTime = new Date(contestData.startTime * 1000);
        const endTime = new Date((contestData.startTime + contestData.duration ?? 5400) * 1000);
        return {
            platform: 'LEETCODE',
            name: contestData.title,
            url: `https://leetcode.com/contest/${contestData.titleSlug}`,
            start: moment(startTime).format('DD MMM YYYY HH:mm'),
            end: moment(endTime).format('DD MMM YYYY HH:mm'),
            banner: contestData.cardImg
        }
    });

    future = future.map(contestData => {
        const startTime = new Date(contestData.startTime * 1000);
        const endTime = new Date((contestData.startTime + contestData.duration ?? 5400) * 1000);
        return {
            platform: 'LEETCODE',
            name: contestData.title,
            url: `https://leetcode.com/contest/${contestData.titleSlug}`,
            start: moment(startTime).format('DD MMM YYYY HH:mm'),
            end: moment(endTime).format('DD MMM YYYY HH:mm'),
            banner: contestData.cardImg
        }
    });

    return {
        past: past,
        future: future,
        present: present
    }

}

const getLeetCodeContestData = () => {
    const endPoint = `https://leetcode.com/graphql/`;
    const query = ` {
            topTwoContests {
              title
              titleSlug
              startTime
              cardImg
              duration
            }
            ongoingVirtualContest {
              title
              titleSlug
              startTime
              cardImg
              duration
            }
            allContests{
              title
              titleSlug
              startTime
              cardImg
              duration
            }
          }`;
    const graphqlQuery = {
        operationName: "Contests",
        query: `query Contests ${query}`,
        variables: {}
    };
    const data = axios({
        url: endPoint,
        method: 'get',
        data: graphqlQuery
    });
    return data;
}


Contests.get('/codechef', async (req, res) => {
    try {
        const data = await axios.get('https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc&offset=0&mode=premium')
        const contestData = modifyCodeChefData(data.data);
        res.json({ data: contestData });
    }
    catch (err) {
        console.log('err=>', err);
    }
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
        const [leetCodeContestData] = await Promise.all([getLeetCodeContestData()]);
        const contestData = modifyLeetCodeData(leetCodeContestData.data.data);
        res.json({ data: contestData });
    }
    catch (err) {
        console.warn('error =>', err);
    }
})


Contests.get('/all', async (req, res) => {
    let [codechefData, codeForcesData, leetcodeData] = await Promise.all(
        [
            axios.get('https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc&offset=0&mode=premium'),
            CodeforcesContestData.find({}).lean(),
            getLeetCodeContestData()
        ]
    )
    codechefData = modifyCodeChefData(codechefData.data);
    codeForcesData = modifyCodeForcesData(codeForcesData);
    leetcodeData = modifyLeetCodeData(leetcodeData.data.data);

    let allContests = {
        past: ([...codechefData.past, ...codeForcesData.past, ...leetcodeData.past]).sort((a, b) => a.start < b.start),
        present: ([...codechefData.present, ...codeForcesData.present, ...leetcodeData.present]).sort((a, b) => a.start < b.start),
        future: ([...codechefData.future, ...codeForcesData.future, ...leetcodeData.future]).sort((a, b) => a.start < b.start)
    }
    res.json({ data: allContests })
})
export default Contests 