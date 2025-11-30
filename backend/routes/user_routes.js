import {Router} from 'express';
import {ObjectId} from 'mongodb';
import * as helper from '../helpers.js'
import { accountVerify, accountLogged } from '../middleware/middleware_auth.js';
import * as users from '../data/users.js';
import {cacheUserId, cacheUsers } from "../middleware/middleware_cache_user.js"
import sports from "../../shared/enums/sports.js";
import skills  from "../../shared/enums/skills.js";
import statesCities from '../../shared/data/US_States_and_Cities.json' with { type: 'json' };

import redis from 'redis';
const client = redis.createClient();
client.connect().then(() => {});
const router = Router();

router.route('/')
  .get(cacheUsers, async (req, res) => {
    try {
      const userList = await users.getAllUsers();
      await client.set("users", JSON.stringify(teamList));
      return res.status(200).json(userList);
    } catch (e) {
      return res.status(500).json({ error: `Failed to get users: ${e}` });
    }
  })

router.route('/signup')
  .post(accountLogged, async (req, res) => {
    const {
      username,
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      confirmPassword,
      state,
      city,
      birthday,
      preferredSports,
      experience
    } = req.body;

    try {
      helper.validUsername(username);
      helper.validName(firstName, "First");
      helper.validName(lastName, "Last");
      const newPassword = helper.validPassword(password);
      helper.matchingPassword(newPassword, confirmPassword);
      helper.validEmail(email);
      helper.validNumber(phoneNumber)
      const newState = helper.validText(state, "state")
      if (!statesCities[newState]) throw 'Invalid state'
      const newCity = helper.validText(city, "city")
      if (!statesCities[newState].includes(newCity)) throw `Invalid city for ${newState}`
      helper.validBday(birthday)
    
      if (!preferredSports || !Array.isArray(preferredSports) || preferredSports.length === 0) throw "Preferred sports must be a non-empty array";
      
      

      for (const sport of preferredSports) {
        const newSport = helper.validText(sport)
        if (!sports.includes(newSport)) throw `Invalid sport`;
      }
      
      const newExperience = helper.validText(experience, "skill level")
      if (!skills.includes(newExperience)) throw 'Skill level not listed'

    } catch (e) {
      console.log("Error spotted!!!: " + e);
      return res.status(400).json({error: e});
    }
    
    try {
      console.log("Creating user...");
      const reg = await users.register(
        username,
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
        confirmPassword,
        state,
        city,
        birthday,
        preferredSports,
        experience
      );

      await client.set(`user_id:${req.params.id}`, JSON.stringify(reg)); 
      await client.del("users")
      return res.status(200).json(reg);
      

    } catch (e) {
      return res.status(500).json({error: `Failed to create user: ${e}`})
    }
  });

router.route('/logout').get(accountVerify, async (req, res) => {
  req.session.destroy(e => {
    if (e) {
      return res.status(400).json({error: e});
    }
    return res.status(200).json({message: "user has been successfully logged out"});
  });
});

router.route('/:id')
  .get(cacheUserId, async (req, res) => {
    try {
      helper.validText(req.params.id, 'user ID');
      if (!ObjectId.isValid(req.params.id)) throw 'invalid object ID';
    } catch (e) {
      return res.status(400).json({error: e});
    }

    try {
      let user = await users.getUserById(req.params.id)
      await client.set(`user_id:${req.params.id}`, JSON.stringify(user)); 
      await client.del("users")
      return res.status(200).json(user);
    } catch (e) {
      if (e === 'No user with that id') {
        return res.status(404).json({error: `Failed to get user: ${e}`})
      } else {
        return res.status(500).json({error: `Failed to get user: ${e}`})
      }
    }
  })
  .put(accountVerify, async(req, res) => {
    const {
      username,
      email,
      phoneNumber,
      firstName,
      lastName,
      birthday,
      state,
      city,
      preferredSports,
      experience
    } = req.body;

    try {
      helper.validName(firstName, "First");
      helper.validName(lastName, "Last");
      helper.validUsername(username);
      helper.validEmail(email);
      helper.validNumber(phoneNumber)
      const newState = helper.validText(state, "state")
      if (!statesCities[newState]) throw 'Invalid state'
      const newCity = helper.validText(city, "city")
      if (!statesCities[newState].includes(newCity)) throw `Invalid city for ${newState}`
      helper.validBday(birthday)
    
      if (!preferredSports || !Array.isArray(preferredSports) || preferredSports.length === 0) throw "Preferred sports must be a non-empty array";
    
      for (const sport of preferredSports) {
        const newSport = helper.validText(sport)
        if (!sports.includes(newSport)) throw `Invalid sport`;
      }
    
      const newExperience = helper.validText(experience, "skill level")
      if (!skills.includes(newExperience)) throw 'Skill level not listed'

    } catch (e) {
      return res.status(400).json({error: e});
    }

    try {
      let updatedUser = await users.updateUser(
        req.params.id, 
        username,
        email,
        phoneNumber,
        firstName,
        lastName,
        birthday,
        state,
        city,
        preferredSports,
        experience,
        req.session.user);
      await client.set(`user_id:${req.params.id}`, JSON.stringify(updatedUser)); 
      await client.del("users")
      return res.status(200).json(updatedUser);
    } catch (e) {
      if (e === 'user not found') {
        res.status(404).json({error: `Failed to update user: ${e}`})
      } else if (e === 'User did not create this account and cannot update it') {
        res.status(401).json({error: `Failed to update user: ${e}`})
      } else {
        res.status(500).json({error: `Failed to update user: ${e}`})
      }
    }
    
  })
  .delete(accountVerify, async(req, res) => {
    try {
      helper.validText(req.params.id, 'user ID');
      if (!ObjectId.isValid(req.params.id)) throw 'invalid object ID';
    } catch (e) {
      return res.status(400).json({error: e});
    }
    try {
      let deleteUser = await users.deleteUser(req.params.id, req.session.user);
      req.session.destroy(e => {
        if (e) {
          return res.status(400).json({error: e});
        }
      });
      await client.del(`user_id:${req.params.id}`);
      await client.del("users")
      return res.json(deleteUser);
    } catch (e) {
      if (e === 'user not found') {
        res.status(404).json({error: `Failed to delete user: ${e}`})
      } else {
        res.status(500).json({error: `Failed to delete user: ${e}`})
      }
    }
  });

router.route('/login')
  .post(accountLogged, async (req, res) => {
    
    console.log(req.session.user);
    const {
      username,
      password,
    } = req.body

    try {

      helper.validUsername(username);
      helper.validPassword(password);
    
    } catch (e) {
      return res.status(400).json({error: e});
    }

    try {
      const signin = await users.login(username, password);
      req.session.user = {_id: signin._id, username: signin.username};
      console.log(req.session.user);
      return res.status(200).json(signin)
    } catch (e) {
      return res.status(500).json({error: `Failed to log in: ${e}`})
    }    
  });

router.route('/requests/:userId/:teamId')
    .post(accountVerify, async(req, res) => {
        try {
            helper.validText(req.params.teamId, 'team ID');
            if (!ObjectId.isValid(req.params.teamId)) throw 'invalid object ID';

            helper.validText(req.params.userId, 'user ID');
            if (!ObjectId.isValid(req.params.userId)) throw 'invalid object ID';   
        } catch (e) {
            return res.status(400).json({error: e});
        }
        try {
            const result = await users.sendTeamInvite(req.params.userId, req.params.teamId);
            res.status(200).json(result);
        } catch (e) {
            res.status(500).json({error: `Failed to invite user to team: ${e}`})
        }
    })
    .delete(accountVerify, async(req, res) => {
        try {
            helper.validText(req.params.teamId, 'team ID');
            if (!ObjectId.isValid(req.params.teamId)) throw 'invalid object ID';

            helper.validText(req.params.memberId, 'member ID');
            if (!ObjectId.isValid(req.params.memberId)) throw 'invalid object ID';   
        } catch (e) {
            return res.status(400).json({error: e});
        }
        try {
            const result = await users.removeTeamInvite(req.params.userId, req.params.teamId);
            res.status(200).json(result);
        } catch (e) {
            res.status(500).json({error: `Failed to remove invite: ${e}`})
        }
    });



export default router;