/**
 * Mongoose User model.
 * Defines the schema for a user, including:
 * - email: unique, required string
 * - passwordHash: required string (hashed password)
 *
 */
import { Schema, model } from 'mongoose';
const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }
});

/**
 * The User model for MongoDB.
 * @type {import('mongoose').Model}
 */
export default model('User', UserSchema);
