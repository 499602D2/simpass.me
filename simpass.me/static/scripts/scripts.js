var cryptoRandomString = require('crypto-random-string');
var entropy = require('string-entropy')
var animationQueue = [];

var monkySpins = 1;
document.addEventListener('DOMContentLoaded', () => {
	// spin the monky :)
	$("#monky").mouseenter(function(event) {
		spinMonky();
	});

	// verify length input
	$('#lengthSelect').on('input', verifyInput);

	// run forever
	window.refreshIntervalId = window.setInterval(passGen, [250]);

	// listen for copy-button clicks
	$("#copyButton").click(function() {
		$('#generatorOutput').focus();
		$('#generatorOutput').select();
		document.execCommand('copy');
		spinMonky();
		copyNotify();
		calcEntropy();
	});

	$("#generatorOutput").click(function() {
		$('#generatorOutput').focus();
		$('#generatorOutput').select();
		document.execCommand('copy');
		spinMonky();
		copyNotify();
		calcEntropy();
	});

	// spin the monky!
	spinMonky();
});

function verifyInput() {
	if ($('#lengthSelect').val() < 0) {
		$('#lengthSelect').val(Math.abs($('#lengthSelect').val()));
	}

	// if length is huge, run less often
	if ($('#lengthSelect').val() >= 2048) {
		clearInterval(window.refreshIntervalId);
		window.refreshIntervalId = window.setInterval(passGen, [550]);
	}
	else if ($('#lengthSelect').val() >= 512) {
		clearInterval(window.refreshIntervalId);
		window.refreshIntervalId = window.setInterval(passGen, [350]);
	} else if ($('#lengthSelect').val() < 512) {
		clearInterval(window.refreshIntervalId);
		window.refreshIntervalId = window.setInterval(passGen, [250]);
	}
}

function calcEntropy() {
	$('#entropyVal').text(entropy($('#generatorOutput').val()));
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function copyNotify() {
	// add the upcoming animation to the queue
	animationQueue.unshift('fadeIn');

	var elements = document.getElementsByClassName('copyNotifyText')
	for(var i=0; i < elements.length; i++) {
		elements[i].style.opacity = '1';
		elements[i].style.transition = 'opacity 300ms ease-out';
		elements[i].style.visibility = 'visible';
	}

	// after 300 ms transition done -> pop
	await sleep(300)
	animationQueue.pop()

	await sleep(2200);

	// if animation queue is empty, fade out
	if (animationQueue.length == 0) {
		elements[0].style.opacity = '0';
		elements[1].style.opacity = '0';
		elements[0].style.visibility = 'hidden';
		elements[1].style.visibility = 'hidden';
		elements[0].style.transition = 'visibility 750ms, opacity 750ms';
		elements[1].style.transition = 'visibility 750ms, opacity 750ms';
	}
}

function copyToClipboard() {
	// select text
	var copyText = document.getElementById('generatorOutput');

	console.log('copyText:', copyText);

	copyText.select();
	copyText.setSelectionRange(0, 99999);

	// Copy the text inside the text field
	document.execCommand("copy");
}

function spinMonky() {
	var monky = document.getElementById('monky');
	monky.style.transition = '0.6s';
	monky.style.transform = `rotate(${monkySpins*360}deg)` ;
	monkySpins += 1;
}

function getRandomInt(min, max) {
	// Create byte array and fill with 1 random number
	var byteArray = new Uint8Array(1);
	window.crypto.getRandomValues(byteArray);

	for (var i=0; i < 1; i -= 1) {
		if (byteArray[0] < min) {
			console.log(byteArray[0], '<', min);
			var byteArray = new Uint8Array(1);
			window.crypto.getRandomValues(byteArray);
		} else if (byteArray[0] > max) {
			console.log(byteArray[0], '>', max);
			var byteArray = new Uint8Array(1);
			window.crypto.getRandomValues(byteArray);
		} else {
			console.log('i=1');
			i = 1;
		}
	}

	return byteArray[0];
}

// on generate button press, generate a password and show the copy-button
async function passGen(event) {
	if (document.hasFocus()) {
		// get length and type from document
		var len = document.getElementById('lengthSelect').value;
		var type = document.getElementById('complexitySelect').value;

		// get length and complexity
		var length = (Number(len) || 12);
		var type = (type || 'base64');

		// available types
		var validTypes = [
			'readable', 'base64', 'symbols', 'symbols readable',
			'hex', 'url-safe', 'numeric', 'distinguishable'
		];

		// check validity
		if (validTypes.includes(type) == false) {
			type = 'base64';
		}

		// if readable, generate in pairs of 4
		var generated = '';
		var n = 0;
		if (type == 'readable') {
			for (var i=0; i < length; i += 1) {
				var generated = generated.concat(cryptoRandomString({length: 1, type: 'base64'}));
				if (n == 3) {
					if (i+1 < length) { var generated = generated.concat('-'); }
					i += 1;
					n = 0;
				} else { n += 1; }
			}
		} else if (type == 'symbols' || type == 'symbols readable') {
			if (type == 'symbols') {
				var symbolic_set = '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
				var generated = cryptoRandomString({length: length, characters: symbolic_set});
			} else {
				var symbolic_set = '!"#$%&\'()*+,-.0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~';
				for (var i=0; i < length; i += 1) {
					var generated = generated.concat(cryptoRandomString({length: 1, characters: symbolic_set}));
					if (n == 3) {
						if (i+1 < length) { var generated = generated.concat('/'); }
							i += 1;
							n = 0;
					} else { n += 1; }
				}
			}
		} else {
			var generated = cryptoRandomString({length: length, type: type});
		}

		$('#generatorOutput').val(generated);
	} else {
		$('#generatorOutput').val('waiting...');
		$('#entropyVal').text(entropy('waiting...'));
	}
}