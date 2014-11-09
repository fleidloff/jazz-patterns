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
