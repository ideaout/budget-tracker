const app = require('./app');
const config = require('./config/config');

const PORT = config.server.port || 5001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
