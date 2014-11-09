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
