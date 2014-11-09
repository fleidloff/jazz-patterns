Tuba.Format = {
	Formats: {},

	format: function(formatName, pattern, options) {
		return this.Formats[formatName].format(pattern, options);
	},

	addFormat: function(format) {
		this.Formats[format.name] = format;
	}
};
