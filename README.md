# SKIPLI CODING CHALLENGE 2

### Tech stack
Front-end: ReactJS</br>
Back-end: NodeJS + ExpressJS</br>
Database: Firebase Realtime Database</br>
SMS Service: Vonage</br>

### How to run
#### Front-end
Define the required variables in `/front-end/.env` file</br>
```
REACT_APP_API_URL=
```
Install the required libraries: `cd front-end && npm install` </br>
Run instance: `cd front-end && npm start` => Run on PORT `3000`
#### Back-end
Define the required variables in `/back-end/.env` file</br>
```
FIREBASE_CONFIG=
VONAGE_API_KEY=
VONAGE_API_SECRET=
VONAGE_FROM_TEL=
```
Install the required libraries: `cd back-end && npm install` </br>
Run instance: `cd back-end && node index.js` => Run on PORT `3001`

### Structure
#### Front-end
`/components`: Include the sub-folders of each page (as a component) in the project. If styling is required, there would be another `.scss` file included inside the folder</br>
`/assets`: Include the assets for the project, specificially the image for Profile</br>
##### Pages
Routing between the pages are handled by `react-router-dom` library</br>
- `/`: Home page, for `Requesting Access code` and `Login`</br>
- `/search`: For searching the Github profiles by login name</br>
- `/profile`: Show the list of liked profiles

#### Back-end
##### Endpoints
- `POST /CreateNewAccessCode`: to create a new access code for the account with `phoneNumber` passed as parameter (or create new account). The account is updated into the database, and the flow for `Sending SMS` would be executed
- `POST /ValidateAccessCode`: to validate the access code inputted by the user and authorized
- `GET /searchGithubUsers`: to call Github API for retrieving the list of users, by `q` (as query), `page` (as current page number) and `query_per_page` (as number of items per page) provided
- `GET /findGithubUserProfile`: to get the full detail of a selected Github profile, with `id` passed as parameter
- `POST /likeGithubUser`: to handle the `like` or `dislike` a selected Github profile, for the current user
- `GET /getUserProfile`: to get the list of liked Github profiles of the user, by the `phone_number` provided
- `GET /findMultipleGithubUserProfile`: self-defined API endpoint for retrieving a list of Github IDs, call the Github API to get the profile details of all IDs in the provided list

##### Structure
All execution is handled in the `index.js` file

### Demo images
Home page, inputing phone number
![Home page, inputing phone number](https://firebasestorage.googleapis.com/v0/b/skipli-code-challenge2.appspot.com/o/Screen%20Shot%202023-02-04%20at%2023.48.37.png?alt=media&token=5d8e1e28-3c33-4479-a932-1a64253bb624)

Access code sent
![Access code sent](https://firebasestorage.googleapis.com/v0/b/skipli-code-challenge2.appspot.com/o/Screen%20Shot%202023-02-04%20at%2023.44.24.png?alt=media&token=7292b5e8-548d-4405-a167-82e869c8c300)

Instance created on Firebase Realtime Database
![Instance created on Firebase Realtime Database](https://firebasestorage.googleapis.com/v0/b/skipli-code-challenge2.appspot.com/o/Screen%20Shot%202023-02-04%20at%2023.44.42.png?alt=media&token=f1091cf7-9844-4e91-8800-07f0082795fa)

SMS sent
![SMS sent](https://firebasestorage.googleapis.com/v0/b/skipli-code-challenge2.appspot.com/o/Screen%20Shot%202023-02-04%20at%2023.44.58.png?alt=media&token=987a6b88-bad0-4758-abec-65ac896ea61d)

Wrong access code
![Wrong access code](https://firebasestorage.googleapis.com/v0/b/skipli-code-challenge2.appspot.com/o/Screen%20Shot%202023-02-04%20at%2023.45.26.png?alt=media&token=5a92c279-ecaa-4d21-846d-ab53811ef1a2)

Search screen
![Search screen](https://firebasestorage.googleapis.com/v0/b/skipli-code-challenge2.appspot.com/o/Screen%20Shot%202023-02-04%20at%2023.45.54.png?alt=media&token=79402c74-5ef1-4c82-b5da-30ed1e7a7be3)

Search screen - pagination
![Search screen - pagination](https://firebasestorage.googleapis.com/v0/b/skipli-code-challenge2.appspot.com/o/Screen%20Shot%202023-02-04%20at%2023.46.14.png?alt=media&token=c6bd6bc1-22e7-44c5-8d7e-1923e71131fa)

Search screen - liked Github profile
![Search screen - liked Github profile](https://firebasestorage.googleapis.com/v0/b/skipli-code-challenge2.appspot.com/o/Screen%20Shot%202023-02-04%20at%2023.46.42.png?alt=media&token=5260c806-8b15-489d-bc19-74c538dc5714)

Profile screen
![Profile screen](https://firebasestorage.googleapis.com/v0/b/skipli-code-challenge2.appspot.com/o/Screen%20Shot%202023-02-04%20at%2023.47.41.png?alt=media&token=6dfe4944-35b4-4eef-9bab-d9455e024ff7)

Firebase - Liked Github profiles
![Firebase - Liked Github profiles](https://firebasestorage.googleapis.com/v0/b/skipli-code-challenge2.appspot.com/o/Screen%20Shot%202023-02-04%20at%2023.54.14.png?alt=media&token=9b5a891c-d696-451e-9e35-c3d5c67f794f)
