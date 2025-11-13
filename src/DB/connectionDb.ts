import { Sequelize } from "sequelize";
import mongoose from "mongoose";


export const sequelize = new Sequelize(process.env.DB_URL!, {
  host: process.env.DB_HOST!,
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

export const checkMongo = async ()=>{
  await mongoose.connect(process.env.DB_MONGO!).then(()=>{
    console.log("connection to mongo is success");
  }).catch((err)=>{
    console.log("error in connection to DB");
    
  })
}


export const checkSync = ()=>{
  sequelize.sync({ force: false }).then(() => {
  console.log('Database synced');
}).catch((error)=>{
  console.log("synced error" , error);
});
}

