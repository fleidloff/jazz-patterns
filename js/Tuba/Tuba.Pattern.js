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
