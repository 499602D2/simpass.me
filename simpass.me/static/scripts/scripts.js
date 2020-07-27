var cryptoRandomString = require('crypto-random-string');
var entropy = require('string-entropy');
var animationQueue = [];

var chimpuSpins = 1;
document.addEventListener('DOMContentLoaded', () => {
	// spin the chimpu :)
	$("#chimpu").mouseenter(function(event) {
		spinchimpu();
	});

	// verify length input
	$('#lengthSelect').on('input', verifyInput);

	// run forever
	window.refreshIntervalId = window.setInterval(passGen, [250]);

	// copy button clicks
	document.getElementById("copyButton").addEventListener("click", event => {
		onCopy();
	});

	// output field clicks
	document.getElementById("generatorOutput").addEventListener("click", event => {
		onCopy();
	});

	// spin chimpu
	spinchimpu();
});

function onCopy() {
	$('#generatorOutput').focus();
	$('#generatorOutput').select();
	document.execCommand("copy");

	calcEntropy();
	copyNotify();
	spinchimpu();
}

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

function spinchimpu() {
	var chimpu = document.getElementById('chimpu');
	chimpu.style.transition = '0.6s';
	chimpu.style.transform = `rotate(${chimpuSpins*360}deg)` ;
	chimpuSpins += 1;
}

function readableSequence(len, type, splitChar, customSet) {
	var length = (Number(len) || 12);
	var type = (type || 'base64');
	var splitChar = (splitChar || '-');

	var n = 0;
	var generated = '';
	for (var i=0; i < length; i) {
		// if enough margin, generate 4 characters at once: else, just one
		if (length - i > 3) {

			// if customSet is defined, use that
			if (customSet) {
				var generated = generated.concat(cryptoRandomString({length: 4, characters: customSet}));
			} else {
				// else, use type
				var generated = generated.concat(cryptoRandomString({length: 4, type: type}));
			}

			i += 4;
			n += 4;

		} else {
			// if customSet is defined, use that
			if (customSet) {
				var generated = generated.concat(cryptoRandomString({length: 1, characters: customSet}));
			} else {
				// else, use type
				var generated = generated.concat(cryptoRandomString({length: 1, type: type}));
			}

			i += 1;
			n += 1;
		}

		// if three chars, add a splitChar, set n=0 and i += 1
		if (n == 4) {
			if (i+1 <= length) { var generated = generated.concat(splitChar); }
			i += 1;
			n = 0;
		}
	}

	return generated;
}

// on generate button press, generate a password and show the copy-button
async function passGen(event) {
	if (document.hasFocus()) {
		// get length and type from document
		var len = document.getElementById('lengthSelect').value;
		var type = document.getElementById('complexitySelect').value;
		var readable = document.getElementById('readableSelect').value;

		// get length, complexity and readable boolean
		var length = (Number(len) || 12);
		var type = (type || 'base64');
		var readable = (readable || 'true');

		// available types
		var validTypes = [
			'readable', 'base64', 'symbols', 'hex',
			'url-safe', 'numeric', 'distinguishable'
		];

		// check validity: if false, use b64
		if (validTypes.includes(type) == false) {
			type = 'base64';
		}

		// if readable, generate in pairs of 4
		var generated = '';
		if (readable == 'true') {
			if (type == 'symbols') {
				var symbolic_set = '!"#$%&\'()*+,-.0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~';
				var generated = readableSequence(length, null, '/', symbolic_set);
			} else {
				var generated = readableSequence(length, type, '-');
			}
		} else {
			if (type == 'symbols') {
				var symbolic_set = '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
				var generated = cryptoRandomString({length: length, characters: symbolic_set});
			} else {
				var generated = cryptoRandomString({length: length, type: type});
			}
		}

		$('#generatorOutput').val(generated);
	} else {
		$('#generatorOutput').val('waiting...');
		$('#entropyVal').text(entropy('waiting...'));
	}
}