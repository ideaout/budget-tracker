const { Sequelize } = require("sequelize");
const config = require("../config/config");

let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else {
  sequelize = new Sequelize(config.db.database, config.db.username, config.db.password, {
    host: config.db.host,
    port: config.db.port,
    dialect: config.db.dialect,
  });
}

sequelize.authenticate()
  .then(() => console.log("Database connected successfully."))
  .catch((error) => console.error("Unable to connect to the database:", error));

module.exports = sequelize;