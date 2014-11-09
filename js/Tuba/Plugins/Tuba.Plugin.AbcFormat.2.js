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
