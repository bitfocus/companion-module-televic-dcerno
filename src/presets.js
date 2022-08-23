module.exports = {
	setPresets: function () {
		let self = this;
		let presets = [];

		const foregroundColor = self.rgb(255, 255, 255) // White
		const foregroundColorBlack = self.rgb(0, 0, 0) // Black
		const backgroundColorRed = self.rgb(255, 0, 0) // Red
		const backgroundColorGreen = self.rgb(0, 255, 0) // Green
		const backgroundColorBlue = self.rgb(0, 0, 255) // Blue
		const backgroundColorWhite = self.rgb(255, 255, 255) // White

		if (self.DATA.length > 0 && self.DATA[0].id != -1) {
			if (self.config.verbose) {
				self.log('info', 'Loading Presets for ' + self.DATA.length + ' mics.');
			}
			
			for (let i = 0; i < self.DATA.length; i++) {
				let uid = self.DATA[i].id;

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
								status: 1,
							},
							style: {
								color: foregroundColor,
								bgcolor: backgroundColorRed
							}
						},
						{
							type: 'micStatus',
							options: {
								serial: uid,
								status: 2,
							},
							style: {
								color: foregroundColor,
								bgcolor: backgroundColorGreen
							}
						},
						{
							type: 'micStatus',
							options: {
								serial: uid,
								status: 0,
							},
							style: {
								color: foregroundColor,
								bgcolor: backgroundColorBlue
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

		presets.push({
			category: 'Recording',
			label: 'Recording State',
			bank: {
				style: 'text',
				text: '$(d-cerno:recstat)',
				size: '18',
				color: '16777215',
				bgcolor: self.rgb(0, 0, 0)
			},
			actions: [
				{
					action: 'recordingMode',
					options: {
						status: 2
					}
				}
			],
			feedbacks: [
				{
					type: 'recStatus',
					options: {
						status: 1,
					},
					style: {
						color: foregroundColor,
						bgcolor: backgroundColorRed
					}
				},
				{
					type: 'recStatus',
					options: {
						status: 2,
					},
					style: {
						color: foregroundColor,
						bgcolor: backgroundColorGreen
					}
				},
				{
					type: 'recStatus',
					options: {
						status: 3,
					},
					style: {
						color: foregroundColor,
						bgcolor: backgroundColorBlue
					}
				}
			]
		});
	
		return presets;
	}
}
