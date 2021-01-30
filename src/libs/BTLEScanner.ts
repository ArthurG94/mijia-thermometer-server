import { EventEmitter2 } from 'eventemitter2'
import { exec, ChildProcess } from 'child_process'
import readline from 'readline'
import execAsync from './execAsync';

class BTLEScanner extends EventEmitter2 {

	private timeout: number

	public constructor(timeout: number = 10) {
		super();
		this.timeout = timeout;
		this.start();
	}

	public async start() {

		await execAsync('hciconfig hci0 down')
		await execAsync('hciconfig hci0 up')


		const child = exec(`timeout ${this.timeout} stdbuf -oL hcitool lescan`);

		if (child.stdout) {
			child.stderr?.pipe(process.stderr)
			const rl = readline.createInterface(child.stdout);
			rl.on('line', (line) => {
				//64:E7:D8:95:72:AB (unknown)
				let match = line.match(/((?:[\dA-F][\dA-F]:){5}(?:[\dA-F][\dA-F])) (.*)/)
				if (match) {

					let mac = match[1];
					let name: string | null = match[2];

					if (name == '(unknown)') {
						name = null;
					}

					this.emit('peripheral', mac, name)
				}
			});
			rl.on('close', () => {
				this.emit('end');
				rl.removeAllListeners();
				child.removeAllListeners();
			});
		}

	}

}

export default BTLEScanner;