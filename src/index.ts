import './loadEnv';
import createApp from "./app.controller";

const start = async () => {
	const app = await createApp();
	const port: string | number = process.env.PORT || 5000;
	app.listen(port, () => {
		console.log(`server is running on ${port}`);
	});
};

start();