import BTLEScanner from './BTLEScanner'

class ThermometerScanner extends BTLEScanner {

	public constructor(timeout: number) {
		super(timeout);

		this.on('peripheral', (mac, name) => {
			if (name == 'LYWSD03MMC') {
				this.emit('thermometer', mac, name);
			}
		})

	}

}

export default ThermometerScanner;