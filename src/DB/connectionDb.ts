import { Sequelize } from "sequelize";
import mongoose from "mongoose";

type GlobalWithCache = typeof globalThis & {
  __sequelize?: Sequelize;
  __sequelizeSynced?: boolean;
  __mongoConnected?: boolean;
  __sequelizeConnected?: boolean;
};

const g = globalThis as GlobalWithCache;

if (!g.__sequelize) {
  if (!process.env.DB_URL) {
    throw new Error('Missing DB_URL environment variable. Please set DB_URL in config/.env or environment.');
  }
  g.__sequelize = new Sequelize(process.env.DB_URL, {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
  });
}

export const sequelize = g.__sequelize as Sequelize;

export const checkConnection = async () => {
  try {
    await sequelize.authenticate();
    g.__sequelizeConnected = true;
    console.log('Connection to DB has been established successfully');
  } catch (error) {
    g.__sequelizeConnected = false;
    console.log('Unable to connect to the database:', error);
    throw error;
  }
};

export const checkMongo = async () => {
  try {
    if (!process.env.DB_MONGO) {
      throw new Error('DB_MONGO environment variable is not set');
    }
    if (g.__mongoConnected) {
      console.log('Mongo already connected (reused connection)');
      return;
    }
    await mongoose.connect(process.env.DB_MONGO);
    g.__mongoConnected = true;
    console.log('connection to mongo is success');
  } catch (err) {
    console.log('error in connection to mongo:', err);
    throw err;
  }
};

export const checkSync = async () => {
  try {
    if (g.__sequelizeSynced) {
      console.log("Sequelize already synced (skipping)");
      return;
    }
    await sequelize.sync({ force: false });
    g.__sequelizeSynced = true;
    console.log("Database synced");
  } catch (error) {
    console.log("synced error", error);
  }
};

export const isSequelizeConnected = (): boolean => {
  return Boolean(g.__sequelizeConnected);
};

