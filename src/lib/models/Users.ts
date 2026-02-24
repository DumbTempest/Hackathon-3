import mongoose, { Schema, model, models, Model } from "mongoose";

export interface IUser {
  email: string;
  name: string;
  profilePicture?: string;
  bookmarks: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Email is invalid",
      ],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      validate: {
        validator: (val: string) =>
          /^[a-z0-9_.]+$/.test(val),
        message:
          "Username can only contain lowercase letters, numbers, underscores, and periods",
      },
    },
    profilePicture: {
      type: String,
    },
    bookmarks: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  models.User || model<IUser>("User", UserSchema);

export default User;