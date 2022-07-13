module.exports = {
	// ##########################
	// #### Define Variables ####
	// ##########################
	setVariables: function () {
		let self = this;
		let variables = [];

		variables.push({ name: 'information', label: 'System Status' });
		variables.push({ name: 'type', label: 'System Type' });
		variables.push({ name: 'name', label: 'System Name' });
		variables.push({ name: 'version', label: 'System Version' });
		variables.push({ name: 'svr', label: 'System SVR' });

		if (self.DATA.length > 0 && self.DATA[0].id != -1) {
			for (let i = 0; i < self.DATA.length; i++) {
				variables.push({ name: 'micstatus_' + self.DATA[i].id, label: 'Mic Status ' + self.DATA[i].id });
			}
		}
		else {
			if (self.config.verbose) {
				self.log('info', 'No Mic Status variables loaded because no mics have been loaded yet.');
			}
		}

		return variables
	},

	// #########################
	// #### Check Variables ####
	// #########################
	checkVariables: function () {
		let self = this;

		try {
			self.setVariable('information', self.SYSTEM.information);
			self.setVariable('type', self.SYSTEM.type);
			self.setVariable('name', self.SYSTEM.name);
			self.setVariable('version', self.SYSTEM.version);
			self.setVariable('svr', self.SYSTEM.svr);

			if (self.DATA.length > 0 && self.DATA[0].id != -1) {
				for (let i = 0; i < self.DATA.length; i++) {
					let state = '';

					switch(self.DATA[i].stat) {
						case 0:
							state = 'Off';
							break;
						case 1:
							state = 'On';
							break;
						case 2:
							state = 'Pending';
							break;
					}

					self.setVariable('micstatus_' + self.DATA[i].id, state);
				}
			}
		}
		catch(error) {
			self.log('error', 'Error setting Variables from Device: ' + String(error));
		}
	}
}