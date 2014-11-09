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
