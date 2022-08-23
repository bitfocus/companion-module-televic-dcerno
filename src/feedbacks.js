module.exports = {
	// ##########################
	// #### Define Feedbacks ####
	// ##########################
	setFeedbacks: function () {
		let self = this;
		let feedbacks = {};

		const foregroundColor = self.rgb(255, 255, 255) // White
		const backgroundColorRed = self.rgb(255, 0, 0) // Red
		const backgroundColorGreen = self.rgb(0, 255, 0) // Green
		const backgroundColorOrange = self.rgb(255, 102, 0) // Orange

		feedbacks.micStatus = {
			type: 'boolean',
			label: 'Show Mic Status On Button',
			description: 'Indicate if Mic is in X Status',
			style: {
				color: foregroundColor,
				bgcolor: backgroundColorRed,
			},
			options: [
				{
					type: 'dropdown',
					label: 'Serial Number',
					id: 'serial',
					default: self.DATA[0].id,
					choices: self.DATA
				},
				{
					type: 'dropdown',
					label: 'Indicate in X Status',
					id: 'status',
					default: 0,
					choices: [
						{ id: 0, label: 'Off'},
						{ id: 1, label: 'On'},
						{ id: 2, label: 'Pending'}
					]
				}
			],
			callback: function (feedback, bank) {
				let opt = feedback.options;

				let micObj = self.DATA.find((obj) => obj.id == opt.serial);

				if (micObj && micObj.id !== -1) {
					if (micObj.stat.toString() == opt.status.toString()) {
						return true;
					}
				}

				return false
			}
		}

		feedbacks.recStatus = {
			type: 'boolean',
			label: 'Show Recording Status On Button',
			description: 'Indicate if Recording is in X Status',
			style: {
				color: foregroundColor,
				bgcolor: backgroundColorRed,
			},
			options: [
				{
					type: 'dropdown',
					label: 'Indicate in X Status',
					id: 'status',
					default: 0,
					choices: [
						{ id: 1, label: 'Stopped'},
						{ id: 2, label: 'Recording'},
						{ id: 3, label: 'Paused'}
					]
				}
			],
			callback: function (feedback, bank) {
				let opt = feedback.options;

				if (self.SYSTEM.recstat.toString() == opt.status.toString()) {
					return true;
				}

				return false
			}
		}

		return feedbacks
	}
}
