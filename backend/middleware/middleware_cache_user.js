import * as helper from '../helpers.js'
import {ObjectId} from 'mongodb';
import client from '../config/redisClient.js';

export async function cacheUserId(req, res, next) {
    res.set("Cache-Control", "no-store");
    try {
        helper.validText(req.params.id, 'user ID');
        if (!ObjectId.isValid(req.params.id)) throw 'invalid object ID';
    } catch (e) {
        return res.status(400).json({error: e});
    }

    const cachedUser = await client.get(`user_id:${req.params.id}`);
    if (cachedUser) {
      try {
        const user = JSON.parse(cachedUser);
        return res.status(200).json(user);
      } catch (e) {
        return res.status(500).json({ error: `Failed to get user`});
      }
    }

    next(); 
}

export async function cacheUsers(req, res, next) {
  let exists = await client.exists("users");
  if (exists) {
    try {
      const userListString = await client.get("users");
      const userList = JSON.parse(userListString)
      return res.status(200).json(userList);
    } catch (e) {
      return res.status(500).json({ error: `Failed to get users`});
    }
  }
  next(); 
}