import { exec } from 'child_process'


export default (command: string) => {
	return new Promise((resolve, reject) => {

		exec(command, (err, stdout) => {
			err ? reject(err) : resolve(stdout);
		})

	})
}