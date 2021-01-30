import fs from 'fs/promises'

class Config {

	private static instance: Config;
	private config: object;

	public static getInstance() {
		if (!Config.instance) {
			Config.instance = new Config();
		}
		return Config.instance;
	}

	public constructor() {
		this.config = {};
	}

	public async load() {
		let content = '{}';
		try {
			content = await fs.readFile('./config.json', 'utf8')
		} catch (e) {
			if (e.code != 'ENOENT') { //Allow inexistant file
				throw e;
			}
		}

		this.config = JSON.parse(content);
	}

	public get(key: string) {
		let parts = key.split('.');
		let temp: any = this.config;
		for (let part of parts) {
			if (temp[part]) {
				temp = temp[part];
			}
		}
		return temp;
	}


}

export default Config