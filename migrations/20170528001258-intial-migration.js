require("dotenv").config();

'use strict';

var Client = require('pg').Client

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
	dbm = options.dbmigrate;
	type = dbm.dataType;
	seed = seedLink;
};

const client = new Client(process.env.DATABASE_URL);

exports.up = function(db, callback) {

    // create heroes table
    // dump hero data into heroes table
    // create responses table

	client.connect();
	client.query({
		text: 'CREATE TABLE responses (id text, heroToCounter text, heroOptionA text, heroOptionB text, selection text)',
	}).then((result) => {
		callback();
		client.end()
	}).catch(err => {
		console.log(err);
		client.end()
	})
};

exports.down = function(db, callback) {
	client.connect();
	client.query('DROP TABLE responses').then((result) => {
		callback();
		client.end()
	}).catch(err => {
		console.log(err);
		client.end()
	})
};

exports._meta = {
	"version": 1
};
