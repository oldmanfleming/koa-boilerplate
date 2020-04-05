import app from './app';

const port: string | number = process.env.PORT || 3000;
app.listen(port);
console.info(`listening on http://localhost:${port}...`);
