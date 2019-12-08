# Faircharger
Faircharger is a Blockchain-Project. The detailed instruction of how to build this project can be found below. 

## Contributers
- 8019500
- 4622546
- 5704145

## App
Folder that contains a Angular App for the user frontend

## Charger
Folder that contains a Node.js express server representing the charge stick

## Contracts
The chain contracts.

## Documentation
The documentation can be found in the word file (Faircharger Dokumentation) as docx or in the md file (DokuRAWText). The presentation is available at: 
https://docs.google.com/presentation/d/1s190_PMatfdsTigAdeWC92Oup96Eg28kZNc9uR0plmM/edit?usp=sharing

## Charge process
1. Open app
2. Enter charger code (Blockchain account)
3. Get price from charger (GET-Request)
4. User accept/decline the price 
5. Payment channel with price, parallel get requests on the charge stick to get SOC
6. End of charge, show coins...


## Real process
1. The driver logs into the app with his account.
2. The charger owner enters his public account information into the charge stick.
3. The driver connects his car to the charge stick.
4. The driver enters the code of the charger's server using the app.
5. The app will send public account information to the charge stick and retrieve public account information and price. (REST)
6. When accepting, the app will open a payment channel to the charge stick's account.
7. The charge stick will start the charging process when the payment channel is open and the first payment arrived (Back-Checking using sender).
8. The app will continue sending while the car confirms receiving the power. 

## Mappings
account -> balance

## Run project

1. clone repo
2. open in vs code
3. enable Remote-Container extension
4. start Docker
5. reopen folder in container
6. execute './run.sh' root level
7. execure 'npm start' root level
8. navigare into 'charger' and execure 'npm i', 'npm run build' and 'npm start'
9. navigare into 'app' and execure 'npm i', 'npm run build' and 'npm start'
10. open in browser with MetaMask: http://localhost:4200/
11. connect MetaMask
12. Follow instruction on website

The services are availiable at:
- angular       localhost:4200
- server        localhost:8080
- block-chain   localhost:7545
