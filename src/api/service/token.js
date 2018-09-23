const jwt = require('jsonwebtoken');
const secret = 'SLDLKKDS323ssdd@#@@gfseaside';

module.exports = class extends think.Service {
  async getUser(token) {
    if (!token) {
      return null;
    }

    const result = await this.parse(token);
    if (think.isEmpty(result) || result.id <= 0) {
      return null;
    }

    return result;
  }

  async getUserId(token) {
    if (!token) {
      return 0;
    }

    const result = await this.parse(token);
    if (think.isEmpty(result) || result.id <= 0) {
      return 0;
    }

    return result.id;
  }

  async create(userInfo) {
    const token = jwt.sign(JSON.stringify(userInfo), secret);
    return token;
  }

  async parse(token) {
    if (token) {
      try {
        return jwt.verify(token, secret);
      } catch (err) {
        return null;
      }
    }
    return null;
  }

  async verify(token) {
    const result = await this.parse(token);
    if (think.isEmpty(result)) {
      return false;
    }

    return true;
  }
};
