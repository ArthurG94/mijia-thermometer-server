import express from 'express'
import Scanner from './libs/ThermometerScanner'
import Config from './libs/Config'
import Thermometer from './libs/Thermometer';

(async () => {

	const config = Config.getInstance();
	await config.load();

	const app = express();

	app.get('/scan/:timeout?', async (req, res) => {

		try {
			const timeout = (req.params.timeout ? parseInt(req.params.timeout) : 7);
			console.log(timeout);
			if (isFinite(timeout) && !isNaN(timeout)) {
				const scanner = new Scanner(timeout);

				let thermometers: string[] = [];

				scanner.on('thermometer', async (mac, name) => {
					thermometers.push(mac);
				});

				scanner.on('end', async (mac, name) => {
					res.send({
						err: null,
						data: thermometers
					});
				});

			} else {
				res.send({
					err: 'Wrong timeout',
					data: null
				});
			}
		} catch (e) {
			res.send({
				err: e.message,
				data: null
			});
		}
	});

	app.get('/read/:mac', async (req, res) => {

		try {
			const mac = req.params.mac;
			const thermometer = new Thermometer(mac);
			const data = await thermometer.read();
			res.send({
				err: null,
				data: {
					mac,
					...data
				}
			});

		} catch (e) {
			res.send({
				err: e.message,
				data: null
			})
		}

	});

	app.get('/read-alias/:alias', async (req, res) => {

		try {
			const aliasName = req.params.alias;
			const alias = config.get('alias');
			let mac = '';

			for (let aliasMac in alias) {
				if (alias[aliasMac] == aliasName) {
					mac = aliasMac;
					break;
				}
			}

			if (!mac) {
				res.send({
					err: 'Alias not found',
					data: null
				})
			} else {

				const thermometer = new Thermometer(mac);
				const data = await thermometer.read();
				res.send({
					err: null,
					data: {
						alias: aliasName,
						mac,
						...data
					}
				});
			}

		} catch (e) {
			res.send({
				err: e.message,
				data: null
			})
		}

	});


	const port = config.get('webServer.port');
	app.listen(port, () => {
		console.log(`Server listen on port ${port}`);
	})

})();
