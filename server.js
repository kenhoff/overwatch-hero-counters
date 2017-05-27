const express = require("express");
const bodyParser = require("body-parser");

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


	// add counts into results, then sort
	for (result of results) {
		if (result.heroToCounter in formattedResults) {
			var counteringHeroIndex = formattedResults[result.heroToCounter].findIndex(function(counteringHeroStats) {
				return counteringHeroStats.heroName == result.selection;
			})
			if (counteringHeroIndex != -1) {
				formattedResults[result.heroToCounter][counteringHeroIndex].numberOfPicks += 1;
			} else {
				formattedResults[result.heroToCounter].push({
					heroName: result.selection,
					numberOfPicks: 1
				})
			}
		} else {
			formattedResults[result.heroToCounter] = [{
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
})

app.post("/responses", (req, res) => {
	// console.log(req.body.id);

	resultIndex = results.findIndex(function(result) {
		if (result.heroToCounter == req.body.heroToCounter) {
			// heroOptionA and heroOptionB must be the same, or heroOptionB == heroOptionA && heroOptionA == heroOptionB
			if ((result.heroOptionA == req.body.heroOptionA) && (result.heroOptionB == req.body.heroOptionB)) {
				return true;
			} else if ((result.heroOptionB == req.body.heroOptionA) && (result.heroOptionA == req.body.heroOptionB)) {
				return true
			} else {
				return false
			}
		} else {
			return false;
		}
	})
	if (resultIndex != -1) {
		// remove old result
		results.splice(resultIndex, 1)
	}
	// push new result
	results.push({
			heroToCounter: req.body.heroToCounter,
			heroOptionA: req.body.heroOptionA,
			heroOptionB: req.body.heroOptionB,
			selection: req.body.selection
		})
		// saving results locally

	// console.log(results);


	res.status(200).send()
})

let port = process.env.PORT || 1234;

app.listen(port, () => {
	console.log(`Listening on ${port}...`);
})
