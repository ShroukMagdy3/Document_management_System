import User, { IUser, IUserModel } from '../DB/models/users.model';
import { JwtPayload } from 'jsonwebtoken';
import { HydratedDocument } from 'mongoose';
import { Model } from 'sequelize';

// merging => override 
declare module 'express-serve-static-core'{
    interface Request{
        user:InstanceType<typeof User>,
        decode:JwtPayload
    }
}