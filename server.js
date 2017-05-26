const express = require("express");

let app = express();

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/index.html")
})

let port = process.env.PORT || 1234;

app.listen(port, () => {
	console.log(`Listening on ${port}...`);
})
