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
