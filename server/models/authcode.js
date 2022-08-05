/**
 * @file Defines a Mongoose schema for storing authorization/authentication codes to connect
 *  users to external services.
 * @author LibreTexts <info@libretexts.org>
 */

import mongoose from 'mongoose';

const AuthCodeSchema = new mongoose.Schema({
  /**
   * The auth code generated by the system.
   */
  code: {
    type: String,
    required: true,
    index: true,
  },
  /**
   * UUID of the user the code was issued for.
   */
  user: {
    type: String,
    required: true,
  },
  /**
   * Identifier of the external service consuming results from the API.
   */
  apiClientID: {
    type: String,
    required: true,
  },
  /**
   * Datetime the auth code was issued.
   */
  issued: {
    type: Date,
    required: true,
  },
  /**
   * Seconds after which the auth code is no longer valid. The 'expires' property
   * instructs MongoDB to delete the record after 1 hour, if not done so by the system.
   */
  expiresIn: {
    type: Number,
    required: true,
    expires: 3600, // delete record after 1 hour if code unused
  },
});

const AuthCode = mongoose.model('AuthCode', AuthCodeSchema);

export default AuthCode;
