import {Router} from 'express';
import {ObjectId} from 'mongodb';
import * as helper from '../helpers.js'
import { accountVerify, accountLogged } from '../middleware/middleware_auth.js';
import * as users from '../data/users.js';
import {cacheUserId, cacheUsers } from "../middleware/middleware_cache_user.js"
import sports from "../../shared/enums/sports.js";
import skills  from "../../shared/enums/skills.js";
import statesCities from '../../shared/data/US_States_and_Cities.json' with { type: 'json' };

import client from '../config/redisClient.js';
const router = Router();

router.route('/')
  .get(cacheUsers, async (req, res) => {
    try {
      const userList = await users.getAllUsers();
      await client.set("users", JSON.stringify(userList));
      return res.status(200).json(userList);
    } catch (e) {
      return res.status(500).json({ error: `Failed to get users: ${e}` });
    }
  })

router.route('/auth') 
  .get(async (req, res) => {
    res.set("Cache-Control", "no-store");
    if (req.session.user) {
        return res.status(200).json({
            loggedIn: true,
            user: req.session.user
        });
    }
    res.status(200).json({ loggedIn: false });
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
      advancedSports,
      intermediateSports,
      beginnerSports
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
    
      if (!advancedSports || !Array.isArray(advancedSports) || !intermediateSports || !Array.isArray(intermediateSports) || !beginnerSports || !Array.isArray(beginnerSports)) throw "One sports array was not provided.";
      if((intermediateSports.length + beginnerSports.length + advancedSports.length) === 0) throw "You must select at least one sport.";
    
    

      for (const sport of advancedSports) {
        const newSport = helper.validText(sport)
        if (!sports.includes(newSport)) throw `Invalid sport`;
      }
      for (const sport of intermediateSports) {
        const newSport = helper.validText(sport)
        if (!sports.includes(newSport) ) throw `Invalid sport`;
        if(advancedSports.includes(newSport)) throw 'Sport can not have two categories!';
      }
      for (const sport of beginnerSports) {
        const newSport = helper.validText(sport)
        if (!sports.includes(newSport)) throw `Invalid sport`;
        if(advancedSports.includes(newSport)) throw 'Sport can not have two categories!';
        if(intermediateSports.includes(newSport)) throw 'Sport can not have two categories!';
      }


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
        advancedSports,
        intermediateSports,
        beginnerSports
      );

      await client.set(`user_id:${req.params.id}`, JSON.stringify(reg)); 
      await client.del("users")
      return res.status(200).json(reg);
      

    } catch (e) {
      return res.status(500).json({error: `Failed to create user: ${e}`})
    }
  });

router.route('/logout').post(accountVerify, async (req, res) => {
  req.session.destroy(e => {
    if (e) {
      return res.status(400).json({error: e});
    }
    return res.status(200).json({message: "user has been successfully logged out"});
  });
});

router.route('/filter')
  .post(accountVerify, async (req, res) => {
    const {
      name,
      distance,
      skillLevel,
      sport
    } = req.body;
    try {
      const distances = {close: 15, moderate: 30, far: 100}
      let distanceVal = null;
      if (distance !== "") {
        distanceVal = distances[distance];
      }
      let userList = await users.getUsersByFilters(req.session.user._id.toString(), name, distanceVal, sport, skillLevel)
      res.status(200).json(userList)
    } catch (e) {
      return res.status(500).json({error: `Failed to filter users: ${e}`})
    }
  });

router.route('/:id')
  .get(cacheUserId, async (req, res) => {
    res.set("Cache-Control", "no-store");
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
      advancedSports,
      intermediateSports,
      beginnerSports
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
    
      if (!advancedSports || !Array.isArray(advancedSports) || !intermediateSports || !Array.isArray(intermediateSports) || !beginnerSports || !Array.isArray(beginnerSports)) throw "One sports array was not provided.";
      if((intermediateSports.length + beginnerSports.length + advancedSports.length) === 0) throw "You must select at least one sport.";
    
      
      for (const sport of advancedSports) {
        const newSport = helper.validText(sport)
        if (!sports.includes(newSport)) throw `Invalid sport`;
      }
      for (const sport of intermediateSports) {
        const newSport = helper.validText(sport)
        if (!sports.includes(newSport) ) throw `Invalid sport`;
        if(advancedSports.includes(newSport)) throw 'Sport can not have two categories!';
      }
      for (const sport of beginnerSports) {
        const newSport = helper.validText(sport)
        if (!sports.includes(newSport)) throw `Invalid sport`;
        if(advancedSports.includes(newSport)) throw 'Sport can not have two categories!';
        if(intermediateSports.includes(newSport)) throw 'Sport can not have two categories!';
      }
    
     

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
        advancedSports,
        intermediateSports,
        beginnerSports,
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
      req.session.save();
      await client.del(`user_id:${req.params.id}`);
      await client.del("users")
      return res.status(200).json(deleteUser);
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
      const signin = await users.login(username, password);
      req.session.user = {_id: signin._id, username: signin.username};
      req.session.save();
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