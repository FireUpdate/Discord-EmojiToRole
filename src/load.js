/**
 * Fixes possible errors in emoji strings by matching them to a pattern.
 * @param {String} emojiDiscriminator The string from the config file.
 * @returns {*} A proper emojiDiscriminator or null.
 */
function cleanEmojiDiscriminator(emojiDiscriminator){
	var regEx = /[A-Za-z0-9_]+:[0-9]+/;
	var cleaned = regEx.exec(emojiDiscriminator);
	if(cleaned)	return cleaned[0];
	return emojiDiscriminator;
}

/**
 * Fetches all messages that need to be tracked into the cache. Makes sure each message is having the proper reactions attached.
 * @param {*} client The bot client.
 * @param {*} config The config file.
 */
module.exports = function(client, config){
	client
		.on("ready", () => {
			//Bot ready
			console.log("Fetching messages");
			console.log("Note: If the next message does not say \"ASYNC IIFE working!\", you have to update to Node 7.6.0 or later.");
			(async () => {
				var debug_count_messagesFetched = 0;
				console.log("ASYNC IIFE working!");
				for(var bundle of config){
					var message = await client.channels.get(bundle.channel).fetchMessage(bundle.message);
					if(!message) continue;
					debug_count_messagesFetched += 1;
					for(var reaction of bundle.reactions){
						reaction.emoji = cleanEmojiDiscriminator(reaction.emoji);
						var messageReaction = message.reactions.get(reaction.emoji);
						if(!messageReaction){
							await message.react(reaction.emoji);
							//No fetch necessary since no prior existing reactions.
						}
						else{
							if(!messageReaction.me){
								//Fetch each reaction into cache to keep track of them
								messageReaction.fetchUsers();
								await message.react(reaction.emoji);
							}
						}
					}
				}
				console.log(`Done fetching ${debug_count_messagesFetched} message(s).`);
			})();
		});
};