module.exports = {
	// ##########################
	// #### Instance Actions ####
	// ##########################
	setActions: function () {
		let self = this;
		let actions = {};

		actions.setStatus = {
			label: 'Set Microphone Status',
			options:
			[
				{
					type: 'dropdown',
					label: 'Serial Number',
					id: 'serial',
					default: self.DATA[0].id,
					choices: self.DATA
				},
				{
					type: 'dropdown',
					label: 'Status',
					id: 'status',
					default: 0,
					choices: [ 
						{ id: 0, label: 'Off'},
						{ id: 1, label: 'On'},
						{ id: 2, label: 'Request'},
						{ id: 3, label: 'Toggle'},
					]
				}
			],
			callback: function(action, bank) {
				let options = action.options;
				if (options.serial == -1) {
					self.log('warn', 'Unable to set Mic Status: No Mics Loaded.');
				}
				else {
					let obj = {
						nam: 'smicstat',
						uid: options.serial,
						stat: options.status.toString()
					};
					self.sendCommand(self.buildCommand('set', obj));
				}
			}
		};

		actions.setAll = {
			label: 'Turn Off All Microphones (Except Chairmen)',
			callback: function(action, bank) {
				if (options.serial == -1) {
					self.log('warn', 'Unable to set Mic Status: No Mics Loaded.');
				}
				else {
					let obj = {
						nam: 'smicstat',
						uid: 0,
						stat: 0
					};
					self.sendCommand(self.buildCommand('set', obj));
				}
			}
		};

		actions.recordingMode = {
			label: 'Start/Stop/Pause Recording',
			options: [
				{
					type: 'dropdown',
					label: 'Mode',
					id: 'mode',
					default: 2,
					choices: [ 
						{ id: 1, label: 'Stop'},
						{ id: 2, label: 'Record'},
						{ id: 3, label: 'Pause'}
					]
				}
			],
			callback: function(action, bank) {
				let obj = {
					nam: 'srecstat',
					stat: action.options.mode.toString()
				};
				self.sendCommand(self.buildCommand('set', obj));
			}
		};

		actions.conferenceMode = {
			label: 'Set Conference Mode',
			options: [
				{
					type: 'dropdown',
					label: 'Microphone Mode',
					id: 'mmo',
					default: 1,
					choices: [ 
						{ id: 0, label: 'Operator'},
						{ id: 1, label: 'Direct Speak'},
						{ id: 2, label: 'Group Request'}
					]
				},
				{
					type: 'dropdown',
					label: 'Activation Type',
					id: 'mat',
					default: 1,
					choices: [ 
						{ id: 0, label: 'None'},
						{ id: 1, label: 'Toggle'},
						{ id: 2, label: 'Push'},
						{ id: 4, label: 'Vox'},
					]
				}
			],
			callback: function(action, bank) {
				let obj = {
					nam: 'smmo',
					mmo: action.options.mmo,
					mio: 0,
					mat: action.options.mat
				};
				self.sendCommand(self.buildCommand('set', obj));
			}
		};

		actions.setLoudspeakerVolume = {
			label: 'Set Loudspeaker Volume',
			options: [
				{
					type: 'number',
					label: 'Volume',
					id: 'vol',
					tooltip: 'Sets the volume level (0-24)',
					min: 0,
					max: 24,
					default: 10,
					step: 1,
					required: true,
					range: true
				}
			],
			callback: function(action, bank) {
				let obj = {
					nam: 'slsvol',
					vol: action.options.vol
				};
				self.sendCommand(self.buildCommand('set', obj));
			}
		};

		actions.setLoudspeakerVolumeUp = {
			label: 'Loudspeaker Volume Up',
			callback: function(action, bank) {
				let volume = parseInt(self.SYSTEM.lsvol) + 1;
				if (volume > 24) {
					volume = 24;
				}
				
				let obj = {
					nam: 'slsvol',
					vol: volume
				};
				self.sendCommand(self.buildCommand('set', obj));
			}
		};

		actions.setLoudspeakerVolumeDown = {
			label: 'Loudspeaker Volume Down',
			callback: function(action, bank) {
				let volume = parseInt(self.SYSTEM.lsvol) - 1;
				if (volume < 0) {
					volume = 0;
				}
				
				let obj = {
					nam: 'slsvol',
					vol: volume
				};
				self.sendCommand(self.buildCommand('set', obj));
			}
		};

		actions.setHeadphoneVolume = {
			label: 'Set Headphone Volume',
			options: [
				{
					type: 'number',
					label: 'Volume',
					id: 'vol',
					tooltip: 'Sets the volume level (0-24)',
					min: 0,
					max: 24,
					default: 10,
					step: 1,
					required: true,
					range: true
				}
			],
			callback: function(action, bank) {
				let obj = {
					nam: 'shpvol',
					vol: action.options.vol
				};
				self.sendCommand(self.buildCommand('set', obj));
			}
		};

		actions.setHeadphoneVolumeUp = {
			label: 'Headphone Volume Up',
			callback: function(action, bank) {
				let volume = parseInt(self.SYSTEM.hpvol) + 1;
				if (volume > 24) {
					volume = 24;
				}
				
				let obj = {
					nam: 'shpvol',
					vol: volume
				};
				self.sendCommand(self.buildCommand('set', obj));
			}
		};

		actions.setHeadphoneVolumeDown = {
			label: 'Headphone Volume Down',
			callback: function(action, bank) {
				let volume = parseInt(self.SYSTEM.hpvol) - 1;
				if (volume < 0) {
					volume = 0;
				}
				
				let obj = {
					nam: 'shpvol',
					vol: volume
				};
				self.sendCommand(self.buildCommand('set', obj));
			}
		};

		actions.setMaxOpenMicrophones = {
			label: 'Set Max Open Microphones',
			options: [
				{
					type: 'number',
					label: 'Max Number',
					id: 'max',
					tooltip: 'Sets the max number (0-8)',
					min: 0,
					max: 8,
					default: 5,
					step: 1,
					required: true,
					range: true
				}
			],
			callback: function(action, bank) {
				let obj = {
					nam: 'smam',
					mam: action.options.max
				};
				self.sendCommand(self.buildCommand('set', obj));
			}
		};

		return actions
	}
}