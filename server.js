require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");



const Pool = require('pg').Pool;
const url = require('url')

const params = url.parse(process.env.DATABASE_URL);
let auth;
if (params.auth) {
	auth = params.auth.split(':');
} else {
	auth = [];
}

const config = {
	user: auth[0],
	password: auth[1],
	host: params.hostname,
	port: params.port,
	database: params.pathname.split('/')[1],
	ssl: (process.env.NODE_ENV == "production")
};

const pool = new Pool(config);

let app = express();

app.use(bodyParser.json())

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/index.html")
})



var heroes = [
	"Genji",
	"McCree",
	"Pharah",
	"Reaper",
	"Soldier: 76",
	"Sombra",
	"Tracer",
	"Bastion",
	"Hanzo",
	"Junkrat",
	"Mei",
	"Torbjörn",
	"Widowmaker",
	"D.Va",
	"Orisa",
	"Reinhardt",
	"Roadhog",
	"Winston",
	"Zarya",
	"Ana",
	"Lúcio",
	"Mercy",
	"Symmetra",
	"Zenyatta",
];
var results = [];

app.get("/responses", (req, res) => {
	var formattedResults = {}

	// prefill formattedResults?
	// for (hero of heroes) {
	// 	formattedResults[hero] = []
	// 	for (counterHero of heroes) {
	// 		formattedResults[hero].push({
	// 			heroName: counterHero,
	// 			numberOfPicks: 0
	// 		})
	// 	}
	// }
	// console.log(formattedResults);

	pool.query({
		text: "SELECT * FROM responses"
	}).then(results => {
		// add counts into results, then sort
		for (result of results.rows) {
			if (result.herotocounter in formattedResults) {
				var counteringHeroIndex = formattedResults[result.herotocounter].findIndex(function(counteringHeroStats) {
					return counteringHeroStats.heroName == result.selection;
				})
				if (counteringHeroIndex != -1) {
					formattedResults[result.herotocounter][counteringHeroIndex].numberOfPicks += 1;
				} else {
					formattedResults[result.herotocounter].push({
						heroName: result.selection,
						numberOfPicks: 1
					})
				}
			} else {
				formattedResults[result.herotocounter] = [{
					heroName: result.selection,
					numberOfPicks: 1
				}];
			}
		}
		// sort
		for (var formattedResult in formattedResults) {
			if (formattedResults.hasOwnProperty(formattedResult)) {
				formattedResults[formattedResult].sort(function(a, b) {
					return b.numberOfPicks - a.numberOfPicks
				})
			}
		}
		/*
		formattedresults = {
			"Pharah": [
			{heroName:"McCree", numberOfPicks:1}
			{heroName:"Genji", numberOfPicks:0}
		], "McCree": [...]....
		}

		*/
		//  dump to page
		res.send(formattedResults)

	}).catch(err => {
		console.log(err);
	})

})

app.post("/responses", (req, res) => {
	// console.log(req.body.id);

	// first, check and see if there's a response with the same ID, heroToCounter, as well as combination of heroes A and B
	// if there is, update that response with the new selection
	// if not, insert a response with the ID heroToCounter, heroes A and B, and the selection
	// console.log(req.body.id);

	pool.query({
			text: "SELECT * FROM responses WHERE id = $1::text AND heroToCounter = $2::text",
			values: [req.body.id, req.body.heroToCounter]
		}).then(response => {
			if (response.rows.length == 0) {
				// just go ahead and insert a new response
				// console.log("no responses exist with ID and heroToCounter - inserting new row");
				pool.query({
					text: "INSERT INTO responses (id, heroToCounter, heroOptionA, heroOptionB, selection) VALUES ($1::text, $2::text, $3::text, $4::text, $5::text)",
					values: [req.body.id, req.body.heroToCounter, req.body.heroOptionA, req.body.heroOptionB, req.body.selection]
				}).then(response => {
					console.log("new row inserted");
					res.status(201).send();
				}).catch(err => {
					console.log(err);
				})
			} else {
				// console.log("responses exist with ID and heroToCounter - checking to see if hero options A and B are matched anywhere");
				// check to see if a combination of hero A and hero B exist in the results
				for (row of response.rows) {
					if ((row.herooptiona == req.body.heroOptionA) && (row.herooptionb == req.body.heroOptionB)) {
						// update row with matching hero A and hero B
						// console.log("heroes A and B match - updating selection on row with ID, heroToCounter, heroOptionA and heroOptionB");
						return pool.query({
							text: "UPDATE responses SET selection = $5::text WHERE id = $1::text AND heroToCounter = $2::text AND heroOptionA = $3::text AND heroOptionB = $4::text",
							values: [req.body.id, req.body.heroToCounter, req.body.heroOptionA, req.body.heroOptionB, req.body.selection]
						}).then(response => {
							res.status(200).send();
						}).catch(err => {
							console.log(err);
						})
					} else if ((row.herooptionb == req.body.heroOptionA) && (row.herooptiona == req.body.heroOptionB)) {
						// update row with **reversed** hero A and hero B
						// console.log("reversed heroes A and B match - updating selection on row with ID, heroToCounter, heroOptionA and heroOptionB");
						return pool.query({
							text: "UPDATE responses SET selection = $5::text WHERE id = $1::text AND heroToCounter = $2::text AND heroOptionA = $3::text AND heroOptionB = $4::text",
							values: [req.body.id, req.body.heroToCounter, req.body.heroOptionB, req.body.heroOptionA, req.body.selection]
						}).then(response => {
							res.status(200).send();
						}).catch(err => {
							console.log(err);
						})
					}
				}
				// console.log("didn't find any combinations of hero A and B - inserting new row");
				// no response has the combination of id, hero to counter, hero A and hero B, so create a new row
				// just go ahead and insert a new response
				return pool.query({
					text: "INSERT INTO responses (id, heroToCounter, heroOptionA, heroOptionB, selection) VALUES ($1::text, $2::text, $3::text, $4::text, $5::text)",
					values: [req.body.id, req.body.heroToCounter, req.body.heroOptionA, req.body.heroOptionB, req.body.selection]
				}).then(response => {
					console.log("inserted new row");
					res.status(201).send();
				}).catch(err => {
					console.log(err);
				})
			}
		})
		.catch(err => {
			console.log(err);
		})

	// resultIndex = results.findIndex(function(result) {
	// 	if (result.heroToCounter == req.body.heroToCounter) {
	// 		// heroOptionA and heroOptionB must be the same, or heroOptionB == heroOptionA && heroOptionA == heroOptionB
	// 		if ((result.heroOptionA == req.body.heroOptionA) && (result.heroOptionB == req.body.heroOptionB)) {
	// 			return true;
	// 		} else if ((result.heroOptionB == req.body.heroOptionA) && (result.heroOptionA == req.body.heroOptionB)) {
	// 			return true
	// 		} else {
	// 			return false
	// 		}
	// 	} else {
	// 		return false;
	// 	}
	// })
	// if (resultIndex != -1) {
	// 	// remove old result
	// 	results.splice(resultIndex, 1)
	// }
	// // push new result
	// results.push({
	// 		heroToCounter: req.body.heroToCounter,
	// 		heroOptionA: req.body.heroOptionA,
	// 		heroOptionB: req.body.heroOptionB,
	// 		selection: req.body.selection
	// 	})
	// 	// saving results locally

	// console.log(results);


	// res.status(200).send()
})

let port = process.env.PORT || 1234;

app.listen(port, () => {
	console.log(`Listening on ${port}...`);
})
