import { BOOLEAN, DataTypes, Model } from "sequelize";
import { sequelize } from "../connectionDb";
import { boolean } from "zod";

export enum RoleEnum {
  user = "user",
  admin = "admin",
}

export interface IUser {
  id?: number;
  userName: string;
  email: string;
  password: string;
  nid: string;
  phone?: string | undefined;
  role?: RoleEnum | undefined;
  otp: string;
  confirmed?: boolean | undefined;
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}
export interface IUserModel extends Model<IUser>, IUser {}

const User = sequelize.define<IUserModel>(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: "must have valid email address",
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^(?=.*[A-Z])(?=.*\d).{8,}$/,
      },
    },
    nid: {
      type: DataTypes.STRING(14),
      unique: true,
      allowNull: false,
      validate: {
        isNumeric: {
          msg: "National ID must contain only numbers",
        },
        len: {
          args: [14, 14],
          msg: "National ID must be exactly 14 digits",
        },
      },
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: true,
      validate: {
        is: {
          args: /^[0-9]{10,15}$/,
          msg: "Phone number must be between 10 and 15 digits",
        },
      },
    },
    role: {
      type: DataTypes.ENUM(...Object.values(RoleEnum)),
      defaultValue: RoleEnum.user,
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    confirmed: {
      type: BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "User",
  }
);

export default User;
