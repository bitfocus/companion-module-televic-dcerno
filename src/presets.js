module.exports = {
	setPresets: function () {
		let self = this;
		let presets = [];

		const foregroundColor = self.rgb(255, 255, 255) // White
		const foregroundColorBlack = self.rgb(0, 0, 0) // Black
		const backgroundColorRed = self.rgb(255, 0, 0) // Red
		const backgroundColorWhite = self.rgb(255, 255, 255) // White

		if (self.DATA.length > 0 && self.DATA[0].id != -1) {
			if (self.config.verbose) {
				self.log('info', 'Loading Presets for ' + self.DATA.length + ' mics.');
			}
			
			for (let i = 0; i < self.DATA.length; i++) {
				let uid = self.DATA[i].id;
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

				presets.push({
					category: 'Mics',
					label: uid + ' State',
					bank: {
						style: 'text',
						text: uid + '\\n' + '$(d-cerno:micstatus_' + uid + ')',
						size: '18',
						color: '16777215',
						bgcolor: self.rgb(0, 0, 0)
					},
					actions: [
						{
							action: 'setStatus',
							options: {
								serial: uid,
								status: 3
							}
						}
					],
					feedbacks: [
						{
							type: 'micStatus',
							options: {
								serial: uid,
								state: 1,
							},
							style: {
								color: foregroundColor,
								bgcolor: backgroundColorRed
							}
						}
					]
				});
			}
		}
		else {
			if (self.config.verbose) {
				self.log('info', 'No presets loaded because no mics have been loaded yet.');
			}
		}
	
		return presets;
	}
}
