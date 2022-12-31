const { twitterBearer, twitterClient } = require("./client.js");
const express = require("express");
const {readFile} = require("fs/promises");
const CronJob = require("cron").CronJob;
const app = express();
const port = process.env.PORT || 4000;

app.listen(port, () => {
	console.log(`Server started on PORT ${port}`);
});

const readQuery = async () => {
	const res = await readFile("./query.txt", "utf8")
	return res
};

const readQuoteTweet = async () => {
	const res = await readFile("./quote_tweet.txt", "utf8")
	return res
};

const getTweets = async () => {
	const queryRes = await readQuery()

	const result = await twitterClient.v2.get("tweets/search/recent", {
		query: queryRes,
		max_results: 20,
		start_time: new Date(Date.now() - (process.env.TIME_INTERVAL * 60000)).toISOString()
	});
	const x = result.data.map(d => d.id)

	console.log(x);
	x.forEach(async (d) => {
		await quoteTweet(d)
	})
};

const quoteTweet = async (id) => {
const quoteMessage = await readQuoteTweet()

	const { data: createdTweet } = await twitterClient.v2.tweet(
		quoteMessage,
		{
			quote_tweet_id: id,
		}
	);
	console.log("Tweet", createdTweet.id, ":", createdTweet.text);
};
// getTweets()

// const cronTweet = new CronJob(`* 30 * * * *`, async () => {
const cronTweet = new CronJob(process.env.CRON_SETTINGS, async () => {
	getTweets();
});

cronTweet.start();
