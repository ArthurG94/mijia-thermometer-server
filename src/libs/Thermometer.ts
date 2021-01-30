import { spawn } from 'child_process'
import readline from 'readline'
import execAsync from './execAsync';

interface ThermometerData {
	temperature: number
	humidity: number
	voltage: number
	voltagePercent: number
}

class Thermometer {

	private mac: string

	public constructor(mac: string) {
		this.mac = mac;
	}

	public async read(timeout = 30000): Promise<ThermometerData> {

		return new Promise(async (resolve, reject) => {

			await execAsync('hciconfig hci0 down')
			await execAsync('hciconfig hci0 up')

			let child = spawn('gatttool', ['-b', this.mac, '--char-write-req', '--handle=0x0038', '--value=0100', '--listen']);
			if (child.stdout) {

				let temperature = -1;
				let humidity = -1;
				let voltage = -1;
				let voltagePercent = -1;
				let read = false;

				const rl = readline.createInterface(child.stdout);
				rl.on('line', (line) => {
					line = line.toUpperCase();
					//NOTIFICATION HANDLE = 0X0036 VALUE: 21 0A 2F 1F 0C
					let match = line.match(/NOTIFICATION HANDLE \= 0X0036 VALUE\: ((?:[\dA-F][\dA-F] ){4}(?:[\dA-F][\dA-F]))/)
					if (match) {

						let bytes = match[1].split(' ').map(byte => parseInt(byte, 16));
						let buffer = Buffer.from(bytes);

						temperature = buffer.readUInt16LE() / 100;
						humidity = buffer.readUInt8(2);
						voltage = buffer.readUInt16LE(3) / 1000;
						voltagePercent = (voltage / 3.2) * 100;
						read = true;
						child.kill();
					}
				});
				rl.on('close', () => {
					rl.removeAllListeners();
					child.removeAllListeners();

					if (read) {
						resolve({
							temperature,
							humidity,
							voltage,
							voltagePercent
						});
					} else {
						reject(new Error('timeout'));
					}
				});

				setTimeout(()=>{
					child.kill();
				},timeout)
			}
		});
	}
}

export default Thermometer