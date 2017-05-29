# Overwatch Hero Counters

A dumb little project to attempt to crowdsource "countering" heroes for the 24 Overwatch heroes. Each user (identified client-side by browser fingerprint) would vote on which hero, A or B, would be better at "countering" hero C. (Sometimes the question is more like which hero would be "less bad" at countering C.)

The problem with this pretty quickly turns into a scale thing - for each hero, `23 choose 2` matchups need to be answered - 253 each. Multiply that by 24 for each hero, and you discover that a full set of responses for _a single user_ includes 6072 different responses.

That represents a bit of a design struggle, so I think I'm gonna leave this one off here, maybe work on some different stat-tracking Overwatch stuff in the future. Cheers!
