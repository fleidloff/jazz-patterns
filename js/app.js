$("document").ready(function() {
	Tuba.init();

	for (var i = 0; i < Tuba.Scale.keys.length; i++) {
		var key = Tuba.Scale.keys[i];
		$("#key")
			.append("<option value=\"" + key + "\">" + key + "</option>")
	}

	for (var scale in Tuba.Scale.scales) {
		$("#scale")
			.addClass("updatePattern")
			.append("<option value=\"" + scale + "\">" + scale + "</option>");
	}

	for (var difficulty in Tuba.Pattern.Difficulties) {
		$("#difficulty")
			.addClass("updatePattern")
			.append("<option value=\"" + difficulty + "\">" + difficulty + "</option>");
	}

	for (var i = 60; i <= 240; i++) {
		$("#bpm")
			.append("<option value=\"" + i + "\"" + (i === 120 ? "selected" : "") + ">" + i + " bpm</option>");
	}

	function updatePattern(e) {
		var key = $("#key").val(),
			scale = $("#scale").val(),
			difficulty = $("#difficulty").val(),
			pattern = Tuba.Pattern.getPattern(key, scale, difficulty, 2, 4);
			abcPattern = Tuba.Format.format("abc2", Tuba.Pattern.getPatternCached());

		render(abcPattern);
	}

	function randomPattern() {
		$('#key option:selected')
			.removeAttr('selected');
		$($('#key option')[parseInt(Math.random() * $('#key option').length)]).attr('selected', 'selected');


		$('#scale option:selected')
			.removeAttr('selected');
		$($('#scale option')[parseInt(Math.random() * $('#scale option').length)]).attr('selected', 'selected');

		updatePattern();
	}

	$(".updatePattern").change(function(e) {
		// e.preventDefault();
		// todo: remember timeout and only update if no new timeout arose
		updatePattern();
	});
	$("#new").click(function(e) {
		e.preventDefault();
		updatePattern();
	});
	$("#random").click(function(e) {
		e.preventDefault();
		randomPattern();
	});
	$("#nextPatternLeft").click(function(e) {
		e.preventDefault();
		nextPattern(-7);
	});
	$("#nextPatternRight").click(function(e) {
		e.preventDefault();
		nextPattern(7);
	});
	$("#key").change(function() {
		transposeByKey($("#key").val());
	});
	$("#wrench").click(function(e) {
		e.preventDefault();
		$("#settings").toggleClass("hidden");
		$(this).toggleClass("pure-button-active");
	});
	$("#bpm").change(function() {
	});
	handlePresenterClicks();

	updatePattern();
});

var count66 = 0,
	timeout66 = null;

function handlePresenterClicks() {
	$( "body" ).keydown(function(e) {
		if (!e.keyCode) {
			return;
		}

		switch(e.keyCode) {
			case 33: 
				e.preventDefault();
				nextPattern(-7);
				break;
			case 34: 
				e.preventDefault();
				nextPattern(7);
				break;
			case 66: 
				e.preventDefault();
				clearTimeout(timeout66);
				count66++;
				timeout66 = setTimeout(function() {
					switch(count66) {
						case 2:
							$("#new").click(); 
							break;
						case 3: 
							$("#random").click();
							break;
						default: 
					}
					count66 = 0;
				}, 300);
				
				break;
		}
	});
}

function nextPattern(change) {
	if (Tuba.Scale.cache.key === Tuba.Scale.keys[(12 - change) % Tuba.Scale.keys.length]) {
		nextScale();
	} else {
		transpose(change);
	}
}

function nextScale() {
	if ($('#scale option').last().html() === $('#scale option:selected').html()) {
		$('#scale option:selected')
			.removeAttr('selected');
		$('#scale option').first().attr('selected', 'selected');
	} else {
		$('#scale option:selected')
			.removeAttr('selected')
			.next()
			.attr('selected', 'selected');	
	}

	$('#key option:selected').removeAttr('selected');
	$('#key option').first().attr('selected', 'selected');

	$("#new").click();
}

function marshall() {
	// todo: add difficulty to pattern to be able to reconstruct it later when unmarshalling
	var result = Tuba.Pattern.getPatternCached();
	result.difficulty = $("#difficulty").val();

	result = JSON.stringify(result);
	
	result = btoa(result);

	return result;
}

function unmarshall(compressedState) {
	var state = atob(compressedState);

	var pattern = JSON.parse(state);

	Tuba.Scale.updateCache(pattern.key, pattern.scale);
	Tuba.Pattern.pattern = pattern;

	var abcPattern = Tuba.Format.format("abc2", pattern);
	

	$("#key").val(pattern.key);
	$("#scale").val(pattern.scale);
	$("#difficulty").val(pattern.difficulty);

	render(abcPattern);
}

function render(abcPattern) {
	//console.log(abcPattern);
	setTimeout(function() {
		ABCJS.renderAbc('notation', abcPattern, {}, {scale:1.2, paddingbottom: 0, staffwidth: 700});
		//ABCJS.renderMidi('midi', abcPattern.replace("|]", "|z8|]"), {}, {qpm: 120});
	}, 1);
}

function octaveUp() {
	var pattern = Tuba.Pattern.transposeOctave(1),
	abcPattern = Tuba.Format.format("abc2", pattern);

	render(abcPattern);
}

function octaveDown() {
	var pattern = Tuba.Pattern.transposeOctave(-1),
	abcPattern = Tuba.Format.format("abc2", pattern);

	render(abcPattern);
}

function transposeByKey(key) {
	var pattern = Tuba.Pattern.transposeByKey(key),
	abcPattern = Tuba.Format.format("abc2", pattern);

	render(abcPattern);
}

function transpose(interval) {
	pattern = Tuba.Pattern.transposeByInterval(interval),
	abcPattern = Tuba.Format.format("abc2", pattern);

	$("#key").val(pattern.key);
	render(abcPattern);
}
