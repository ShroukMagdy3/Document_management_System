import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(process.env.DB_NAME! , "root", "", {
  host: "localhost",
  dialect: "mysql",
});

export const checkConnection = async () => {
  sequelize
    .authenticate()
    .then(() => {
      console.log("Connection to DB has been established successfully");
    })
    .catch((error) => {
      console.log("Unable to connect to the database:", error);
    });
};

export const checkSync = ()=>{
  sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced');
}).catch((error)=>{
  console.log("synced error" , error);
});
}

