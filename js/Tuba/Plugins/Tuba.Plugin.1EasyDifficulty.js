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
