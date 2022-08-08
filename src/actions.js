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

		return actions
	}
}