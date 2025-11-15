import {Router} from 'express';
import {ObjectId} from 'mongodb';
import * as helper from '../helpers.js'
import { accountVerify, accountLogged } from '../middleware.js';
import * as users from '../data/users.js';
import { sports } from "../../shared/enums/sports.js";
import { skills } from "../../shared/enums/skills.js";
import statesCities from '../../shared/data/US_States_and_Cities.json' with { type: 'json' };

const router = Router();

router.route('/')
  .get(async (req, res) => {
    try {
      const userList = await users.getAllUsers();
      return res.status(200).json(userList);
    } catch (e) {
      return res.status(500).json({ error: `Failed to get users: ${e}` });
    }
  })

router.route('/signup')
  .post(accountLogged, async (req, res) => {
    const {
      username,
      email,
      phoneNumber,
      firstName,
      lastName,
      birthday,
      password,
      confirmPassword,
      state,
      city,
      preferredSports,
      experience
    } = req.body;

    try {
      helper.validName(firstName, "First");
      helper.validName(lastName, "Last");
      helper.validUsername(username);
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
      return res.status(400).json({error: e});
    }
    
    try {
      const reg = await users.register(
        username,
        email,
        phoneNumber,
        firstName,
        lastName,
        birthday,
        password,
        confirmPassword,
        state,
        city,
        preferredSports,
        experience
      );

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
  .get(async (req, res) => {
    try {
      helper.validText(req.params.id, 'user ID');
      if (!ObjectId.isValid(req.params.id)) throw 'invalid object ID';
    } catch (e) {
      return res.status(400).json({error: e});
    }

    try {
      let blog = await users.getUserById(req.params.id)
      return res.status(200).json(blog);
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
      return res.status(200).json(updatedUser);
    } catch (e) {
      if (e === 'blog not found') {
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
      return res.status(200).json(signin)
    } catch (e) {
      return res.status(500).json({error: `Failed to log in: ${e}`})
    }    
  });




export default router;