var cryptoRandomString = require('crypto-random-string');

var monkySpins = 1;
document.addEventListener('DOMContentLoaded', () => {
	// spin the monky :)
	$("#monky").mouseenter(function(event) {
		spinMonky();
	});

	// run forever
	var intervalID = window.setInterval(passGen, [250]);

	// listen for copy-button clicks
	$("#copyButton").click(function() {
		$('#generatorOutput').focus();
		$('#generatorOutput').select();
		document.execCommand('copy');
		spinMonky();
		copyNotify();
	});

	$("#generatorOutput").click(function() {
		$('#generatorOutput').focus();
		$('#generatorOutput').select();
		document.execCommand('copy');
		spinMonky();
		copyNotify();
	});

	// spin the monky!
	spinMonky();

	// set popovers
	$(function () {
		$('[data-toggle="popover"]').popover()
	})

	// enable dismiss
	$('.popover-dismiss').popover({
		trigger: 'focus'
	})
});

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function copyNotify() {
	var elements = document.getElementsByClassName('copyNotifyText')
	for(var i=0; i < elements.length; i++) {
		elements[i].style.opacity = '1';
		elements[i].style.transition = 'opacity 300ms ease-out';
		elements[i].style.visibility = 'visible';
	}

	await sleep(2500);

	for(var i=0; i < elements.length; i++) {
		elements[i].style.opacity = '0';
		elements[i].style.transition = 'opacity 750ms ease-out';
		await sleep(750);
		elements[i].style.visibility = 'hidden';
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
		if (type == 'readable') {
			for (var i=0; i < length; i += 4) {
				var generated = generated.concat(cryptoRandomString({length: 4, type: 'base64'}));
				if (i+4 < length) { var generated = generated.concat('-'); }
			}
		} else if (type == 'symbols' || type == 'symbols readable') {
			if (type == 'symbols') {
				var symbolic_set = '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
				var generated = cryptoRandomString({length: length, characters: symbolic_set});
			} else {
				var symbolic_set = '!"#$%&\'()*+,-.0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~';
				for (var i=0; i < length; i += 4) {
					var generated = generated.concat(cryptoRandomString({length: 4, characters: symbolic_set}));
					if (i+4 < length) { var generated = generated.concat('/'); }
				}
			}
		} else {
			var generated = cryptoRandomString({length: length, type: type});
		}

		$('#generatorOutput').val(generated);
	} else {
		$('#generatorOutput').val('waiting...');
	}
}






