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
