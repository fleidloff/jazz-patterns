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
