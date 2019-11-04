# Faircharger
Faircharger ist ein Blockchain-Projekt.

## App
Folder that contains a Angular App for the user frontend

## Charger
Folder that contains a Node.js express server representing the charge stick

## Contracts
The chain contracts.


## Charge process
1. Open app
2. Enter charger code (Blockchain account?)
3. Get price from charger (GET)
4. User accept/decline
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
