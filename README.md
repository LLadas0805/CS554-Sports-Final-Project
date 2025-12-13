# CS554 Final Project Sports

This file is meant for people to properly run this website once downloaded locally from the repository.

## Running Setup
### Running Using Node
- If you want to host the website locally open two terminals in the project's directory and enter cd backend and cd frontend respectively. Perform an npm install for both of these directories to make sure the packages are properly downloaded
- This website uses a .env to store the uri and url for mongo and docker so if you do not have a .env make sure to place the following inside one:

MONGODB_URI=mongodb://localhost:27017/sportsdb
REDIS_URL=redis://localhost:6379

- This website also uses redis which was being run with as a docker container before running make sure this is set up
- Finally you can enter npm start in both the backend and frontend directory and the website will begin to run

### Running Using Docker
- If you want to run the website using docker, first, make sure you have docker installed, then you can type the following in the project's root directory "docker compose up --build" which will build the project into multiple containers with all the environmental variables set up and packages installed. 

## Seeding Data Into Project
- If you want premade data such as users, teams, and games when starting the website from scratch you can run a seed file from the backend directory using "node seed.js". Comment out the deletion of documents if you do not want a clean reset after every seed.

