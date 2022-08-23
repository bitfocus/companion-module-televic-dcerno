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

		variables.push({ name: 'lsvol', label: 'Loudspeaker Volume' });
		variables.push({ name: 'hpvol', label: 'Headphone Volume' });

		variables.push({ name: 'mmo', label: 'Microphone Mode' });
		variables.push({ name: 'mio', label: 'Microphone Options' });
		variables.push({ name: 'mat', label: 'Activation Type' });

		variables.push({ name: 'mam', label: 'Max Open Microphones' });

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

		variables.push({ name: 'recstat', label: 'Recording State' });

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
			self.setVariable('svr', self.SYSTEM.svr.toString());

			self.setVariable('lsvol', self.SYSTEM.lsvol);
			self.setVariable('hpvol', self.SYSTEM.hpvol);

			let mmo_var = '';
			switch(self.SYSTEM.mmo) {
				case 0:
					mmo_var = 'Operator';
					break;
				case 1:
					mmo_var = 'Direct Speak';
					break;
				case 2:
					mmo_var = 'Group Request';
					break;
			}
			self.setVariable('mmo', mmo_var);

			let mio_var = self.SYSTEM.mio;
			switch(self.SYSTEM.mio) {
				case 0:
					mio_var = 'None';
					break;
				case 1:
					mio_var = 'Request Allowed';
					break;
				case 2:
					mio_var = 'Cancel Request Allowed';
					break;
				case 3:
					mio_var = 'Request Allowed, Cancel Request Allowed';
					break;
				case 4:
					mio_var = 'Use Override';
					break;
			}
			self.setVariable('mio', mio_var);

			let mat_var = self.SYSTEM.mat;
			switch(self.SYSTEM.mat) {
				case 0:
					mat_var = 'None';
					break;
				case 1:
					mat_var = 'Toggle';
					break;
				case 2:
					mat_var = 'Push';
					break;
				case 4:
					mat_var = 'Vox';
					break;
			}
			self.setVariable('mat', mat_var);

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

			self.setVariable('mam', self.SYSTEM.mam);

			let recstate = '';
			switch(self.SYSTEM.recstat) {
				case 1:
					recstate = 'Stopped';
					break;
				case 2:
					recstate = 'Recording';
					break;
				case 3:
					recstate = 'Paused';
					break;
			}
			self.setVariable('recstat', recstate);
			
		}
		catch(error) {
			self.log('error', 'Error setting Variables from Device: ' + String(error));
		}
	}
}