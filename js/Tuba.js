var Tuba = {
    Plugins: [],

    init: function() {
        this.runPlugins();
    },

    runPlugins: function() {
        for(var i = 0; i < this.Plugins.length; i++) {
            this.Plugins[i].run();
        }
    },

    addPlugin: function(plugin) {
        this.Plugins.push(plugin);
    },

    nothing: function() {}
};

Array.prototype.remByVal = function(val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === val) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
}
Tuba.Format = {
	Formats: {},

	format: function(formatName, pattern, options) {
		return this.Formats[formatName].format(pattern, options);
	},

	addFormat: function(format) {
		this.Formats[format.name] = format;
	}
};
Tuba.Pattern = {
	BREAK_NOTE: "F",

	lengths: {
		"1": 4,
		"1/2": 2,
		"1/4": 1,
		"1/8": .5,
		"1/16": .25,
		"1/32": .125
	},

	lengthsArray: ["1", "1/2", "1/4", "1/8", "1/16", "1/32"],

	Difficulties: {},

	pattern: {
		notes: []
	},

	adjustOctave: function (oldOctave, noteValue, key) {
		var octave = oldOctave;

		if (Tuba.Scale.keys.indexOf(noteValue) < Tuba.Scale.keys.indexOf(key)) {
			octave += 1;
		}
		if (Tuba.Scale.keys.indexOf(key) >= Tuba.Scale.keys.indexOf(this.BREAK_NOTE)) {
			octave -= 1;
		}

		while ((Tuba.Scale.keys.indexOf(noteValue) > Tuba.Scale.keys.indexOf("D") && octave > 1) || (octave > 2)) {
			octave -= 1;
		}

		while (octave < 0) {
			octave += 1;
		}

		return octave;

	},

	createNote: function(noteValue, length, rest, octave, note, key) {
		return {
			note: note,
			noteValue: noteValue,
			length: length,
			rest: rest,
			octave: this.adjustOctave(octave, noteValue, key),
			initialOctave: octave
		};
	},

	createPattern: function(key, scaleName, difficultyName, maxBars, maxBeatsPerBar) {
		var notes = Tuba.Scale.getNotes(key, scaleName),
			importantNotes = Tuba.Scale.getImportantNotes(key, scaleName),
			difficulty = this.Difficulties[difficultyName],
			bar = 1.
			beat = 1,
			nextNote = null,
			octave = 0,

			result = {
				notes: [],
				key: key,
				scale: scaleName,
				maxBars: maxBars,
				maxBeatsPerBar: maxBeatsPerBar
			}

		while (bar <= maxBars) {
			if (octave !== 0) {
				nextNote.note += notes.length * octave;
			}
			nextNote = difficulty.getNextNote(bar, beat, nextNote);
			octave = nextNote.octave ? nextNote.octave : 0;
			while (nextNote.note < 0) {
				nextNote.note += notes.length;
				octave -= 1;
			}
			while (nextNote.note >= notes.length) {
				nextNote.note -= notes.length;
				octave += 1;
			}

			while (this.lengths[nextNote.length] + beat > (maxBeatsPerBar + 1)) {
				nextNote.length = this.lengthsArray[this.lengthsArray.indexOf(nextNote.length) + 1];
			}
			nextNote.noteValue = notes[nextNote.note % notes.length];

			var newNote = this.createNote(nextNote.noteValue, nextNote.length, nextNote.rest, octave, nextNote.note, result.key);
			result.notes.push(newNote);
			beat += this.lengths[nextNote.length];

			if (beat >= (maxBeatsPerBar + 1)) {
				bar += 1;
				beat -= maxBeatsPerBar;
			}
		}

		return result;
	},

	transposeByKey: function(key) {
		var keyDiffernce = (Tuba.Scale.keys.indexOf(key) - Tuba.Scale.keys.indexOf(this.pattern.key) + Tuba.Scale.keys.length) % Tuba.Scale.keys.length;

		return this.transposeByInterval(keyDiffernce);
	},

	getTransposedKey: function(key, interval) {
		var currentKeyIndex = Tuba.Scale.keys.indexOf(key),
			newKeyIndex = currentKeyIndex + interval + Tuba.Scale.keys.length;
			newKey = Tuba.Scale.keys[newKeyIndex % Tuba.Scale.keys.length];

		return newKey;
	},

	transposeByInterval: function(interval) {
		var newKey = this.getTransposedKey(this.pattern.key, interval),
			pattern = this.pattern;

		var	result = {
				notes: pattern.notes,
				key: newKey,
				scale: pattern.scale,
				maxBars: pattern.maxBars,
				maxBeatsPerBar: pattern.maxBeatsPerBar
			};

		for (var i = 0; i < result.notes.length; i++) {
			var note = this.clone(result.notes[i]);

			note.octave = note.initialOctave;

			Tuba.Scale.updateCache(newKey, result.scale);

			// todo: note + interval can be negative which is bad
			note = this.createNote(this.getTransposedKey(note.noteValue, interval), note.length, note.rest, note.octave, (note.note + interval), newKey);

			result.notes[i] = note;
		}

		this.pattern = result;

		return this.getPatternCached();
	},

	transposeOctave: function(octaveChange) {
		var	result = {
			notes: this.pattern.notes,
			key: this.pattern.key,
			scale: this.pattern.scale,
			maxBars: this.pattern.maxBars,
			maxBeatsPerBar: this.pattern.maxBeatsPerBar
		};

		for (var i = 0; i < result.notes.length; i++) {
			var note = this.clone(result.notes[i]);
			note.octave += octaveChange;
			note = this.createNote(note.noteValue, note.length, note.rest, note.octave, note.note, result.key);
			result.notes[i] = note;
		}

		this.pattern = result;
		return this.getPatternCached();
	},

	getPattern: function(key, scaleName, difficultyName, maxBars, maxBeatsPerBar) {
		this.pattern = this.createPattern(key, scaleName, difficultyName, maxBars, maxBeatsPerBar);

		return this.getPatternCached();
	},

	getPatternCached: function() {
		return this.clone(this.pattern);
	},

	clone: function(object) {
		var copy = {};
		$.extend(copy,object);

		return copy;
	},

	addDifficulty: function(difficulty) {
		for(var prop in this.StandardDifficulty) {
			if (!difficulty.hasOwnProperty(prop)) {
				difficulty[prop] = this.StandardDifficulty[prop]
			}
		}

		this.Difficulties[difficulty.name] = difficulty;
	},

	StandardDifficulty: {
		name: "default difficulty",

		lengths: ["1/2", "1/4", "1/8"],

		changes: [-3, -2, -1, 1, 2, 3],

		restProbability: 0.8,

        getLength: function() {
            var index = Math.floor(Math.random() * this.lengths.length);

            return this.lengths[index];
        },

        getNoteChange: function() {
            var index = Math.floor(Math.random() * this.changes.length);

                return this.changes[index];
        },

        getImportantNote: function() {
            var importantNotes = Tuba.Scale.getImportantNotesCached(),
                notes = Tuba.Scale.getNotesCached(),
                index = Math.floor(Math.random() * importantNotes.length);

                return notes.indexOf(importantNotes[index]) + (index > 1 ? 0 : Tuba.Scale.getNotesCached().length);
        },

        isImportantNote: function(note) {
            var tmp = note;
            while(tmp < 0) {
                tmp += Tuba.Scale.getNotesCached().length;
            }
            var noteValue = Tuba.Scale.getNotesCached()[tmp % Tuba.Scale.getNotesCached().length];

            if (Tuba.Scale.getImportantNotesCached().indexOf(noteValue) > -1) {
                return true;
            }

            return false;
        },

        isOnBeat: function(beat) {
            return parseInt(beat) === beat;
        },

        isOffBeat: function(beat) {
            return !this.isOnBeat(beat);
        },

        getNextNote: function(bar, beat, lastNote) {
            var lastNoteChange = this.getNoteChange();

            var result = {
                rest: beat > 1 && Math.random() > (1-this.restProbability),
                length: this.isOffBeat(beat) ? lastNote.length : this.getLength(),
                octave: 0,
                note: !lastNote ? this.getImportantNote() : lastNote.note + lastNoteChange// +/- n
            };

            if (!this.isImportantNote(result.note) && (beat === 1 || beat === 3 || (bar === 2 && beat >= 4))) {
                result.note += lastNoteChange > 0 ? -1 : 1;
            }

            return result;
        }
	}
};
Tuba.Scale = {
	keys: 		["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"],
	intervals: 	["1", "b2", "2", "b3", "3", "4", "b5", "5", "b6", "6", "b7", "7"],
	scales: {},

	cache: {
		notes: [],
		importantNotes: [],
		key: "",
		scaleName: ""
	},

	updateCache: function(key, scaleName) {
		if (key === this.cache.key && scaleName === this.cache.scaleName) {
			return;
		}
		this.cache.key = key;
		this.cache.scaleName = scaleName;
		this.cache.notes = [];
		this.cache.importantNotes = [];
		var notesIndex = this.scales[scaleName].notes,
			keyShift = this.keys.indexOf(key),
			noteIndex,
			note;

		for (var i = 0; i < notesIndex.length; i++) {
			noteIndex = this.intervals.indexOf(notesIndex[i]);
			note = this.keys[(noteIndex + keyShift) % this.keys.length];
			this.cache.notes.push(note);

			if (this.scales[scaleName].importantNotes.indexOf(notesIndex[i]) > -1) {
				this.cache.importantNotes.push(note);
			}
		}
	},

	getNotes: function(key, scaleName) {
		this.updateCache(key, scaleName);

		return this.getNotesCached();
	},

	getNotesCached: function() {
		return this.cache.notes;	
	},

	getImportantNotes: function(key, scaleName) {
		this.updateCache(key, scaleName);

		return this.getImportantNotesCached();
	},

	getImportantNotesCached: function() {
		return this.cache.importantNotes;	
	},

	// todo: add scales sorted?
	addScale: function(scale) {
		this.scales[scale.name] = scale;
	}	
};
Tuba.addPlugin({
    difficulty: {
        name: "Level 1 - Easy",

        lengths: ["1/2", "1/4", "1/8"],

        changes: [-2, -1, 1, 2],

        restProbability: 0.2,

        numberOfEigths: 0,

        _getNextNote: Tuba.Pattern.StandardDifficulty.getNextNote,

        getNextNote: function(bar, beat, lastNote) {
            if (!lastNote) {
                this.numberOfEigths = 0;
            }

            var result = this._getNextNote(bar, beat, lastNote);

            if (result.length === "1/8") {
                if (this.numberOfEigths++ >= 4) {
                    result.length = "1/4";
                }
            }

            // no eigths rests in easy mode!
            if (result.length === "1/8") {
                result.rest = false;
            }

            return result;
        }
    },

    run: function() {
        Tuba.Pattern.addDifficulty(this.difficulty);
    }
});
Tuba.addPlugin({
    difficulty: {
        name: "Level 2 - Medium",

        lengths: ["1/4", "1/8"],

        changes: [-3, -2, -2, -1, -1, 0, 1, 1, 2, 2, 3],

        restProbability: 0.25,

        _getNextNote: Tuba.Pattern.StandardDifficulty.getNextNote,

        getNextNote: function(bar, beat, lastNote) {
            var result = this._getNextNote(bar, beat, lastNote);

            if (result.length === "1/8") {
                result.rest = false;
            }

            return result;
        }
    },

    run: function() {
        Tuba.Pattern.addDifficulty(this.difficulty);
    }
});
Tuba.addPlugin({
    difficulty: {
        name: "Level 3 - Hard",

        restProbability: 0,

        lengths: ["1/8"]
    },

    run: function() {
        Tuba.Pattern.addDifficulty(this.difficulty);
    }
});
Tuba.addPlugin({
    abc: {

        name: "abc2",

        synonymsFlat: {
            "C#": "_D",
            "Eb": "_E",
            "F#": "_G",
            "Ab": "_A",
            "Bb": "_B"
        },

        synonymsSharp: {
            "C#": "^C",
            "Eb": "^D",
            "F#": "^F",
            "Ab": "^G",
            "Bb": "^A"
        },

        lengths: {
            "1": "8",
            "1/2": "4",
            "1/4": "2",
            "1/8": "",
            "1/16": "/",
            "1/32": "/4"
        },

        applySynonym: function(word, flatOrSharp) {
            var synonym = "";
            if ("flat" === flatOrSharp) {
                synonym = this.synonymsFlat[word];
            } else if ("sharp" === flatOrSharp) {
                synonym = this.synonymsSharp[word];
            }

            return synonym ? synonym : word;
        },

        hasSharpAccidentals: function(key) {
            return ["C", "C#", "D", "E", "F#", "G", "A", "B"].indexOf(key) > -1;
        },

        getNoteName: function(note, key) {
            var noteValue = "";

            if (this.hasSharpAccidentals(key)) {
                noteValue = this.applySynonym(note.noteValue, "sharp")
            } else {
                noteValue = this.applySynonym(note.noteValue, "flat");
            }

            noteValue = this.removeRedundantAccidentals(noteValue);

            if (noteValue !== "z") {
                switch(note.octave) {
                    case -1: noteValue += ","; break;
                    case -2: noteValue += ",,"; break;
                    case 1: noteValue = noteValue.toLowerCase(); break;
                    case 2: noteValue = noteValue.toLowerCase() + "'"; break;
                    case 3: noteValue = noteValue.toLowerCase() + "''"; break;
                }
            }

            return noteValue;
        },

        flatOrSharpNotes : [],

        removeRedundantAccidentals: function(noteName) {
            if (this.flatOrSharpNotes.indexOf(noteName) > -1) {
                this.flatOrSharpNotes.remByVal(noteName);
                noteName = "=" + noteName;
            }

            if (noteName.indexOf("_") > -1 || noteName.indexOf("^") > -1) {
                var reducedNoteName = noteName.replace("_", "").replace("^", "");
                if (this.flatOrSharpNotes.indexOf(reducedNoteName) > -1) {
                    noteName = reducedNoteName;
                } else {
                    this.flatOrSharpNotes.push(reducedNoteName);
                }

            }

            return noteName;
        },

        addMetaData: function(pattern) {
            return "M: " + pattern.maxBeatsPerBar + "/4" + "\n";
                //"T: " + Tuba.Scale.cache.key + " " + Tuba.Scale.cache.scaleName + "\n";
        },

        format: function(pattern) {
            var patternFormatted = {
                result: "",
                bar: 1,
                beat: 1,
                halfBarCrossed: false,
                storedNotes: [],
                maxBeatsPerBar: pattern.maxBeatsPerBar,
                key: pattern.key
            };

            this.flatOrSharpNotes = [];

            patternFormatted.result = this.addMetaData(pattern);

            for (var i = 0; i < pattern.notes.length; i++) {
                var note = Tuba.Pattern.clone(pattern.notes[i]);

                patternFormatted = this.formatNote(note, patternFormatted);
            }

            patternFormatted.result += "]";

            return patternFormatted.result;
        },

        updateRest: function(note) {
            if (note.rest) {
                note.noteValue = "z";
            }

            return note;
        },

        updateHalfBarCrossed: function(pattern) {
           if (!pattern.halfBarCrossed && pattern.beat >= (pattern.maxBeatsPerBar / 2) + 1) {
                pattern.result += " ";
                pattern.halfBarCrossed = true;
            }

            return pattern;
        },

        addSpaceBeforeOnBeatSixteenth: function(note, pattern) {
                if ((note.length === "1/16" || pattern.result[pattern.result.length - 1] === "/") && parseInt(pattern.beat) === pattern.beat) {
                    pattern.result += " ";
                }
        },

        formatNote: function(note, pattern) {
            this.updateRest(note);

            this.updateHalfBarCrossed(pattern);

            this.addSpaceBeforeOnBeatSixteenth(note, pattern);

            // todo: split notes when crossing bars

            while (!pattern.halfBarCrossed && (pattern.beat + Tuba.Pattern.lengths[note.length]) > (pattern.maxBeatsPerBar / 2) + 1) {
                if (pattern.result[pattern.result.length - 1] === "-") {
                    pattern.result += ">";
                } else {
                    note.length = Tuba.Pattern.lengthsArray[Tuba.Pattern.lengthsArray.indexOf(note.length) + 1];
                    pattern.storedNotes.push(Tuba.Pattern.clone(note));
                }
            }
            // todo: this is probably a bug!
            if (pattern.result[pattern.result.length - 1] !== ">" || pattern.storedNotes.length === 0) {
                pattern = this.addNote(note, pattern);
            } else {
                pattern.beat += Tuba.Pattern.lengths[note.length];
            }
            if (pattern.storedNotes.length > 0) {
                pattern.result += " ";
                pattern.storedNotes.reverse();
                while (pattern.storedNotes.length > 0) {
                    pattern.result += "-";
                    note = pattern.storedNotes.pop();
                    pattern = this.formatNote(note, pattern);
                }
            }

            pattern = this.updatePattern(pattern);

            return pattern;
        },

        updatePattern: function(pattern) {
            if (pattern.beat >= (pattern.maxBeatsPerBar + 1)) {
                pattern.bar += 1;
                pattern.beat -= pattern.maxBeatsPerBar;
                pattern.halfBarCrossed = false;
                pattern.result += "|";

                this.flatOrSharpNotes = [];
            }

            return pattern;
        },

        addNote: function(note, pattern) {
            var noteName = this.getNoteName(note, pattern.key),
                noteLength = this.lengths[note.length];

            pattern.result += noteName + noteLength;
            pattern.beat += Tuba.Pattern.lengths[note.length];

            return pattern;
        }
    },

    run: function() {
        Tuba.Format.addFormat(this.abc);
    }
});
Tuba.addPlugin({
    scales: [
    	{
    		name: "Major",
    		notes: ["1", "2", "3", "4", "5", "6", "7"],
    		importantNotes: ["1", "3", "5"]
    	},
    	{
    		name: "Minor",
    		notes: ["1", "2", "b3", "4", "5", "b6", "b7"],
    		importantNotes: ["1", "b3", "5"]
    	},
    	{
    		name: "Harmonic-Minor",
    		notes: ["1", "2", "b3", "4", "5", "b6", "7"],
    		importantNotes: ["1", "b3", "5"]
    	},
    	{
    		name: "Melodic-Minor",
    		notes: ["1", "2", "b3", "4", "5", "6", "7"],
    		importantNotes: ["1", "b3", "5"]
    	},
    	{
    		name: "Blues",
    		notes: ["1", "b3", "4", "b5", "5", "b7"],
    		importantNotes: ["1", "b3", "5"]
    	},
    	{
    		name: "Ionian",
    		notes: ["1", "2", "3", "4", "5", "6", "7"],
    		importantNotes: ["1", "3", "5"]
    	},
    	{
    		name: "Dorian",
    		notes: ["1", "2", "b3", "4", "5", "6", "b7"],
    		importantNotes: ["1", "b3", "5"]
    	},
    	{
    		name: "Phrygian",
    		notes: ["1", "b2", "b3", "4", "5", "b6", "b7"],
    		importantNotes: ["1", "b3", "5"]
    	},
    	{
    		name: "Lydian",
    		notes: ["1", "2", "3", "b5", "5", "6", "7"],
    		importantNotes: ["1", "3", "5"]
    	},
    	{
    		name: "Mixolydian",
    		notes: ["1", "2", "3", "4", "5", "6", "b7"],
    		importantNotes: ["1", "3", "5"]
    	},
    	{
    		name: "Aeolian",
    		notes: ["1", "2", "b3", "4", "5", "b6", "b7"],
    		importantNotes: ["1", "b3", "5"]
    	},
    	{
    		name: "Locrian",
    		notes: ["1", "b2", "b3", "4", "b5", "b6", "b7"],
    		importantNotes: ["1", "b3", "b5"]
    	},
        {
            name: "Chromatic",
            notes: ["1", "b2", "2", "b3", "3", "4", "b5", "5", "b6", "6", "b7", "7"],
            importantNotes: ["1", "3", "5"]
        }
    ],

    run: function() {
    	for (var i = 0; i < this.scales.length; i++) {
    		Tuba.Scale.addScale(this.scales[i]);
    	}
    }
});
Tuba.nothing({
    name: "mp3",

    sounds: null,
    playTimeout: null,
    nrOfSounds: 0,
    instrument: "acoustic_grand_piano",
    clickSound: "mp3/woodblock-mp3/C5.mp3",
    bpm: 120,
    click: true,
    pattern: null,

    loadSounds: function(folder) {
        var noteNames = ["A", "Ab", "B", "Bb", "C", "D", "Db", "E", "Eb", "F", "G", "Gb"];
        var notes = {};

        for(var i = 0; i < noteNames.length; i++) {
            for (var n = 2; n <= 5; n++) {
                var index = noteNames[i] + n;

                var sound = new buzz.sound(folder + index + ".mp3");
                this.nrOfSounds++;

                sound.bind("loadeddata", function(e) {
                    this.nrOfSounds--;
                    if (this.nrOfSounds === 0) {
                        //console.log("loaded all sounds!");
                        $("#playStop").removeClass("loading");
                    }
                }.bind(this));

                if (noteNames[i] === "Db") {
                    notes["C#" + n] = sound;
                } else if (noteNames[i] === "Gb") {
                    notes["F#" + n] = sound;
                } else {
                    notes[index] = sound;
                }
            }
        }

        notes["click"] = new buzz.sound(this.clickSound);

        return notes;
    },

    playPattern: function() {
        // todo: enable stop while counting clicks
        var notes = this.pattern.notes,
            duration1Beat = Tuba.Pattern.lengths["1/4"] * 60 / this.bpm * 1000;
        var i = 0;
        if (this.click) {
            for (i = 1; i <= 4; i++) {
                setTimeout(function() {
                    this.sounds["click"].stop();
                    this.sounds["click"].play();
                }.bind(this), i * duration1Beat);   
            }   
        }

        setTimeout(function() {
            this.sounds["click"].stop();
            this.playNote(0, notes, this.sounds, this.bpm, this.stopPattern);
        }.bind(this), i * duration1Beat)
        
        $("#play").addClass("pure-button-active");
    },

    stopPattern: function() {
        clearTimeout(this.playTimeout);
        buzz.all().stop();
        $("#play").removeClass("pure-button-active");
    },

    playNote: function(index, notes, sounds, bpm, callback) {
        var note = notes[index],
            soundIndex = note.noteValue + (note.octave + 3);

        if (note.rest === false) {
            sounds[soundIndex].stop();
            sounds[soundIndex].unmute();
            sounds[soundIndex].play();
        }

        var duration = Tuba.Pattern.lengths[note.length] * 60 / bpm * 1000;
        clearTimeout(this.playTimeout);
        if (index < (notes.length -1)) {
            this.playTimeout = setTimeout(function() {
                sounds[soundIndex].mute();
                this.playNote(index + 1, notes, sounds, bpm, callback);
            }.bind(this), duration);
        } else {
            this.playTimeout = setTimeout(callback, duration);
        }
    },

    setBpm: function(bpm) {
        this.bpm = bpm;
    },

    init: function() {
        this.nrOfSounds = 0;
        clearTimeout(this.playTimeout);
        
        this.sounds = this.loadSounds("mp3/" + this.instrument + "-mp3/");
        buzz.all().load();
    },

    format: function(pattern, options) {
        this.pattern = pattern;
        this.setBpm(options.bpm);

        return this;
        //return Tuba.Pattern.clone(this);
    },

    run: function() {
        //Tuba.mp3 = this;
        this.init();
        Tuba.Format.addFormat(this);
    }
});

//Tuba.mp3 = Tuba.Format.format("mp3", Tuba.Pattern.getPatternCached(), {bpm: $("#bpm").val()});
Tuba.addPlugin({
    difficulty: {
        name: "Show Scale",

        getLength: function() {
            var nrOfNotes = Tuba.Scale.getNotesCached().length;

            if (nrOfNotes < 5) {
                return "1/2";
            } else if (nrOfNotes < 9) {
                return "1/4";
            } else {
                return "1/8";
            }
        },

        getStartNote: function() {
            return Tuba.Scale.getNotesCached().length;
        },

        getNextNote: function(bar, beat, lastNote) {
            var result = {
                rest: !lastNote || lastNote.note < (Tuba.Scale.getNotesCached().length*2) ? false : true,
                length: this.getLength(),
                octave: 0,
                note: !lastNote ? this.getStartNote() : lastNote.note + 1
            };

            return result;
        }
    },

    run: function() {
    	Tuba.Pattern.addDifficulty(this.difficulty);
    }
});
