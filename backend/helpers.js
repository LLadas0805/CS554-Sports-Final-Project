import NodeGeocoder from 'node-geocoder';

const geocoder = NodeGeocoder({
  provider: 'openstreetmap'
});

function validName(str, type) {

    if (str === undefined || str === null) throw `${type} name must be provided`;

    if (typeof str !== 'string') throw `${type} name must be a valid string`;
    

    const trimmed = str.trim();
    if (trimmed.length < 5 || trimmed.length > 25) throw `${type} name must be between 5 and 25 characters long`;
    
    if (!/^[\p{L}'.\-]+$/u.test(trimmed)) throw `${type} name can only contain letters and certain special characters (hyphens, apostrophe, period)`;

    return trimmed;
}

function validTeam(str) {

    if (str === undefined || str === null) throw `Team name must be provided`;

    if (typeof str !== 'string') throw `Team name must be a valid string`;
    

    const trimmed = str.trim();
    if (trimmed.length < 3 || trimmed.length > 25) throw `Team name must be between 3 and 25 characters long`;
    
    if (!/^[\p{L}0-9'.\-\s]+$/u.test(trimmed)) throw `Team name can only contain letters, numbers and certain special characters (hyphens, apostrophe, period)`;

    return trimmed;
}

function validNumber(phoneNumber) {
    let trimPhone = validText(phoneNumber);
    if (!/^\d{3}-\d{3}-\d{4}$/.test(trimPhone)) throw `${trimPhone} needs to follow the format of ###-###-####`
    
    return trimPhone;
    
}

function validUsername(str) {

    if (str === undefined || str === null) throw `Username must be provided`;

    if (typeof str !== 'string') throw `Username must be a valid string`;
    

    const trimmed = str.trim();
    if (trimmed.length < 5) throw `Username must be at least 5 characters long`;
    if (!/^(?=.*[A-Za-z])[A-Za-z0-9]+$/.test(trimmed)) throw `Username needs to contain letters and can also include numbers`;

    return trimmed;
}

function validEmail(email) {
    let trimEmail = validText(email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimEmail)) throw `${trimEmail} needs to follow a valid email format`
            
    if (trimEmail.length > 254) throw `${trimEmail} cannot exceed 254 characters`
            
    return trimEmail;
}

function validPassword(password) {
    if (password === undefined || password === null) throw 'Password must be provided';
    if (typeof password !== 'string') throw 'Password must be a valid string';

    const trimmed = password.trim();

    if (trimmed.length < 8) throw 'Password must be at least 8 characters long';
    if (/\s/.test(trimmed)) throw 'Password cannot contain spaces';
    if (!/[a-z]/.test(trimmed)) throw 'Password must contain at least one lowercase letter';
    if (!/[A-Z]/.test(trimmed)) throw 'Password must contain at least one uppercase letter';
    if (!/[0-9]/.test(trimmed)) throw 'Password must contain at least one number';
    if (!/[^A-Za-z0-9]/.test(trimmed)) throw 'Password must contain at least one special character';

    return trimmed;
}

function validText(text, type) {
    if (!text) throw `You must provide a ${type}`;
    if (typeof text !== 'string') throw `${type} must be a string`;
    if (text.trim().length === 0) throw `${type} cannot be an empty string or just spaces`;
    text = text.trim();

    return text;
}

function matchingPassword(password, confirmPassword) {
    if (confirmPassword === undefined || password === null) throw 'Confirmed assword must be provided';
    if (typeof confirmPassword !== 'string') throw 'Confirmed password must be a valid string';

    const trimmed = password.trim();

    if (password !== trimmed) throw 'Passwords do not match'
    
    return password;
}

function validDate(date) {
    const trimDate = validText(date, "date")
  
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(trimDate)) "Invalid date format! Must be YYYY-MM-DD";

    const newDate = new Date(trimDate);
    return newDate;
}

function calculateAge(bday) {
  const birthday = new Date(bday);
  const today = new Date();

  let age = today.getFullYear() - birthday.getFullYear();
  const monthDiff = today.getMonth() - birthday.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
    age--;
  }

  return age;
}

function validBday(bday) {
  const date = validDate(bday)

  const age = calculateAge(bday);

  if (age < 18) throw "User must be at least 18 years old.";

  return dob; 
}

async function getCoords(city, state) {
  const res = await geocoder.geocode(`${city}, ${state}, USA`);

  if (!res || res.length === 0) throw "Could not find coordinates for location";

  return {
    lat: res[0].latitude,
    lon: res[0].longitude
  };
}

export {validName, validPassword, validEmail, getCoords, validUsername, validTeam, validText, calculateAge, validBday, validNumber, matchingPassword};