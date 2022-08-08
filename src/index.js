// Televic D-CERNO

var instance_skel = require('../../../instance_skel');

var tcp = require('../../../tcp');

var actions = require('./actions.js');
var feedbacks = require('./feedbacks.js');
var variables = require('./variables.js');
var presets = require('./presets.js');

var debug;
var log;

function instance(system, id, config) {
	let self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	return self;
}

instance.prototype.STX = '\x02';
instance.prototype.ETX = '\x03';

instance.prototype.PACKETID = 0;

instance.prototype.SYSTEM = {
	information: 'Connecting to Central Unit...',
	type: '',
	name: '',
	version: '',
	svr: ''
};

instance.prototype.DATA = [
	{ id: -1, label: '(No Mics Loaded)'}
];

instance.prototype.init = function() {
	let self = this;

	debug = self.debug;
	log = self.log;

	if (self.config.verbose) {
		self.log('info', 'Verbose mode enabled. Log entries will contain detailed information.');
	}

	self.init_tcp();

	self.init_actions();
	self.init_feedbacks();
	self.init_variables();
	self.init_presets();

	self.checkFeedbacks();
	self.checkVariables();
}

instance.prototype.updateConfig = function(config) {
	let self = this;

	self.config = config;

	if (self.config.verbose) {
		self.log('info', 'Verbose mode enabled. Log entries will contain detailed information.');
	}

	self.init_tcp();

	self.init_actions();
	self.init_feedbacks();
	self.init_variables();
	self.init_presets();

	self.checkFeedbacks();
	self.checkVariables();
}

// Return config fields for web config
instance.prototype.config_fields = function () {
	let self = this;

	return [
		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: 'This module will connect to a Televic D-Cerno unit.'
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'IP Address',
			width: 6,
			default: '192.168.0.1',
			regex: self.REGEX_IP
		},
		{
			type: 'checkbox',
			id: 'verbose',
			label: 'Enable Verbose Logging',
			default: false
		}
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	let self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
	}

	debug('destroy', self.id);
}

instance.prototype.init_tcp = function() {
	let self = this;

	let receivebuffer = '';

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	if (self.config.port === undefined) {
		self.config.port = 5011;
	}

	if (self.config.host) {
		self.log('info', `Opening connection to ${self.config.host}:${self.config.port}`);

		self.socket = new tcp(self.config.host, self.config.port);

		self.socket.on('status_change', function (status, message) {
			if (self.config.verbose) {
				self.log('info', 'Status change: ' + message);
			}
		});

		self.socket.on('error', function (err) {
			debug('Network error', err);
			self.handleError(err);
		});

		self.socket.on('connect', function () {
			debug('Connected');
			self.status(self.STATUS_OK);

			let obj = {
				typ: 'CoCon',
				nam: 'CoCon Emulator',
				ver: '0.01',
				inf: "",
				svr: 0,
				tim: ""
			}
			self.sendCommand(self.buildCommand('con', obj));

			let getobj = {
				nam: 'gmicstat',
				uid: 0
			};
			self.sendCommand(self.buildCommand('get', getobj));
		});

		self.socket.on('data', function(chunk) {
			chunk = chunk.toString('utf8');

			let i = 0, line = '', offset = 0;
			receivebuffer += chunk;

			while ( (i = receivebuffer.indexOf(self.ETX, offset)) !== -1) {
				line = receivebuffer.substr(offset, i - offset);
				offset = i + 1;
				self.socket.emit('receiveline', line.toString());
			}

			receivebuffer = receivebuffer.substr(offset);
		});

		self.socket.on('receiveline', function(line) {
			//process each received line for variables and feedback
			debug('Received: ');
			debug(line);

			if (self.config.verbose) {
				self.log('info', 'Received: ' + line);
			}

			try {
				//try to parse the JSON
				let type = line.substr(4, 3); //packet type: evt, rep, etc.
				let obj = self.extractJSON(line)[0];

				self.updateData(type, obj);
			}
			catch(error) {
				//unable to parse it
				debug('Unable to parse incoming JSON from device: ');
				debug(line);

				if (self.config.verbose) {
					self.log('info', 'Unable to parse JSON from device: ' + line);
				}
			}
		});
	}
};

instance.prototype.extractJSON = function(str) {
	var firstOpen, firstClose, candidate;
	firstOpen = str.indexOf('{', firstOpen + 1);
	do {
		firstClose = str.lastIndexOf('}');
		//console.log('firstOpen: ' + firstOpen, 'firstClose: ' + firstClose);
		if(firstClose <= firstOpen) {
			return null;
		}
		do {
			candidate = str.substring(firstOpen, firstClose + 1);
			//console.log('candidate: ' + candidate);
			try {
				var res = JSON.parse(candidate);
				//console.log('...found');
				return [res, firstOpen, firstClose + 1];
			}
			catch(e) {
				//console.log('...failed');
			}
			firstClose = str.substr(0, firstClose).lastIndexOf('}');
		} while(firstClose > firstOpen);
		firstOpen = str.indexOf('{', firstOpen + 1);
	} while(firstOpen != -1);
};

instance.prototype.handleError = function(err) {
	let self = this;

	let error = err.toString();
	let printedError = false;

	Object.keys(err).forEach(function(key) {
		if (key === 'code') {
			if (err[key] === 'ECONNREFUSED') {
				error = 'Unable to communicate with Device. Connection refused. Is this the right IP address? Is it still online?';
				self.log('error', error);
				self.status(self.STATUS_ERROR);
				printedError = true;
				if (self.socket !== undefined) {
					self.socket.destroy();
				}
			}
			else if (err[key] === 'ETIMEDOUT') {
				error = 'Unable to communicate with Device. Connection timed out. Is this the right IP address? Is it still online?';
				self.log('error', error);
				self.status(self.STATUS_ERROR);
				printedError = true;
				if (self.socket !== undefined) {
					self.socket.destroy();
				}
			}
		}
	});

	if (!printedError) {
		self.log('error', `Error: ${error}`);
	}

	self.SYSTEM.information = 'Error - See Log';
	self.checkVariables();
};

instance.prototype.updateData = function(packetType, data) {
	let self = this;

	let rebuild = false;

	//do stuff with the data
	try {
		if (packetType == 'rep') {

			if (data.inf) {
				self.SYSTEM.information = data.inf;
			}
	
			if (data.con) {
				if (data.con.hasOwnProperty('typ')) {
					self.SYSTEM.type = data.con.typ;
				}
	
				if (data.con.hasOwnProperty('nam')) {
					self.SYSTEM.name = data.con.nam;
				}
	
				if (data.con.hasOwnProperty('ver')) {
					self.SYSTEM.version = data.con.ver;
				}
	
				if (data.con.hasOwnProperty('svr')) {
					self.SYSTEM.svr = data.con.svr;
				}
			}
		}

		if (packetType == 'evt') {
			if (data.nam && data.nam == 'micstat') {

				if (self.DATA[0].id == -1) {
					self.DATA = []; //clear out the data array with the initial "no mics loaded" as we are now loading the first mic
				}

				let found = false;

				let dataObj = {
					id: data.uid.toUpperCase(),
					label: data.uid.toUpperCase(),
					stat: data.stat
				}

				for (let i = 0; i < self.DATA.length; i++) {
					if (self.DATA[i].id.toUpperCase() == data.uid.toUpperCase()) {
						self.DATA[i].stat = data.stat;
						found = true;
						break;
					}
				}

				if (!found) {
					self.DATA.push(dataObj);
					rebuild = true;
				}
			}
		}

		if (rebuild) {
			//rebuild lists because a new mic was added to the data array
			self.init_actions();
			self.init_feedbacks();
			self.init_variables();
			self.init_presets();
		}

		self.checkFeedbacks();
		self.checkVariables();	
	}
	catch(error) {
		self.log('error', 'Error parsing incoming data: ' + error);
	}
};

// ##########################
// #### Instance Actions ####
// ##########################
instance.prototype.init_actions = function (system) {
	this.setActions(actions.setActions.bind(this)());
};

// ############################
// #### Instance Feedbacks ####
// ############################
instance.prototype.init_feedbacks = function (system) {
	this.setFeedbackDefinitions(feedbacks.setFeedbacks.bind(this)());
};

// ############################
// #### Instance Variables ####
// ############################
instance.prototype.init_variables = function () {
	this.setVariableDefinitions(variables.setVariables.bind(this)());
};

// Setup Initial Values
instance.prototype.checkVariables = function () {
	variables.checkVariables.bind(this)();
};

// ##########################
// #### Instance Presets ####
// ##########################
instance.prototype.init_presets = function () {
	this.setPresetDefinitions(presets.setPresets.bind(this)());
};

instance.prototype.buildCommand = function(type, json) {
	let self = this;

	let priority = 1;

	let cmd = 
		self.STX //start of transmission
		+ '02' //protocol ID
		+ ':' //delimiter
		+ type //packet type 'con', 'evt' 'set', 'get', etc.
		+ self.PACKETID.toString().padStart(4, '0') //unique packet id, is incremented after every command is built, padded to 4 zeroes
		+ '02' //body format type: ASCII JSON
		+ priority.toString() //QOS byte: priority number between 1-9
		+ 'O' //Transmitter type: O = CoCon
		+ '00000' //Transmitter ID: 5 bytes
		+ 'C' //Receiver type: C = Central Unit
		+ '00000' //Receiver ID: 5 bytes
		+ '0' //Tx Property: Single Frame
		+ '0' //TX Session: Single Frames
		+ '000' //Room ID
		+ '0000' //Packet length
		+ ':' //delimiter
		+ JSON.stringify(json) //Json data to send
		+ self.ETX//end of transmission
	;

	self.PACKETID++; //increment the packet id for next command

	if (self.PACKETID > 9999) {
		self.PACKETID = 0; //reset to zero if greater than 9999
	}

	return cmd;
}

instance.prototype.sendCommand = function(cmd) {
	let self = this;

	debug('Sending:');
	debug(cmd);

	if (self.socket !== undefined && self.socket.connected) {
		if (self.config.verbose) {
			self.log('info', 'Sending: ' + cmd);
		}

		self.socket.send(Buffer.from(cmd));
	}
	else {
		debug('Unable to send: Socket not connected.');

		if (self.config.verbose) {
			self.log('warn', 'Unable to send: Socket not connected.');
		}
	}
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;