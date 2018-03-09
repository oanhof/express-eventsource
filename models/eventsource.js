'use strict';

module.exports = function(req, res) {

	var counter = 0,
		maxMessages = 10,
		seconds = 3,
		interval = null;

	//prepare response header
	var prepareResponseHeader = function(response) {
		//prepare header
		response.writeHead(200, {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive',
			'Access-Control-Allow-Origin': '*'
	    });

	    //the following 2 lines were added for IE support: 2kb padding, and a retry param
		response.write(':' + (new Array(2049)).join(' ') + '\n');
		response.write('retry: 2000\n');

		//clear interval when the client stops listening
		response.on('close', function() {
			clearInterval(interval);
			console.log('Client stopped listening');
		});
	};

	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	//data object to be returned - currently a random number, but can be anything
	var preparePayload = function(messageId) {
		const currentDate = new Date();
		let futureDate = new Date();
		futureDate.setSeconds(futureDate.getSeconds() + 1);
		return [
				{
				  cameraIdString: 'string',
				  channelId: 0,
				  contents: 'string',
				  date: currentDate.toISOString(),
				  deviceId: '1004',
				  devicePid: 'string',
				  id: getRandomInt(0, 1000000),
				  isWithPic: 'string',
				  value: 0
				},
				{
					cameraIdString: 'string',
					channelId: 0,
					contents: 'string',
					date: futureDate.toISOString(),
					deviceId: '1004',
					devicePid: 'string',
					id: getRandomInt(0, 1000000),
					isWithPic: 'string',
					value: 1
				  }
			];
	};

	//send message back to client
	var sendMessage = function() {
		var data = preparePayload(++counter);

		//after max messages sent, send final message and zero the counter
		if (counter > maxMessages) {
			clearInterval(interval);
			data.final = true;
			data.data = 'the end';
			counter = 0;
			req.pause();
			res.status = 200;
			res.end();
			return;
		}

		//convert message to string
		data = JSON.stringify(data);
		console.log(data);

		//send message back
		res.write('id: ' + counter + '\n');
		res.write('event: data\n');
		res.write('data: ' + data + '\n\n');
	};

	//prepare response header
	prepareResponseHeader(res);
	//send a message containing current time and data (random number) every n seconds
	interval = setInterval(sendMessage, seconds * 1000);
};