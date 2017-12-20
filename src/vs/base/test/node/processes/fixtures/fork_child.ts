/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import processes = require('vs/base/node/processes');

const sender = processes.createQueuedSender(process);

process.on('message', msg => {
	processes.isChildOfProcess(Number(msg)).then(isChild => {
		if (isChild) {
			sender.send('ok');
		} else {
			sender.send('not ok');
		}
	}).catch(error => sender.send(error.toString()));
});

sender.send('ready');