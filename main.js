//Web3
var Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("https://speedy-nodes-nyc.moralis.io/db8708d3e4564b491d898e3e/eth/mainnet"));

//ExpressJS
const express = require('express');
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

//Error handler for request json
app.use((req, res, next) => {
    bodyParser.json()(req, res, err => {
        if (err) {
            console.error(err.message);
            return res.sendStatus(400); // Bad request
        }
        next();
    });
});


app.get('/health', (req, res) => {
	res.send({"result":"OK", "status": true, "timestamp": Date.now()});
})

//Get balance from ethereum mainnet web3 provider
async function getBalance(address){
	try{
		let result = await web3.eth.getBalance(address);
		if(result != 0){
			result = web3.utils.fromWei(result);
		}
		return result;
	}
	catch(e){
		console.log(e.message);
		return -1;
	}
}

//Checks the incoming address list and then if exist returns the account balances of the addresses 
app.post('/checkBalances', async (req, res) => {
	try{
		if(req.body.addr_array == null || req.body.addr_array.length == 0){ throw new Error("Request empty or undefined"); }
		let addr_array = req.body.addr_array;
		let responseArray = [];

		for (var i = 0; i < addr_array.length; i++) {
			if(Web3.utils.isAddress(addr_array[i])){
				let balance = await getBalance(addr_array[i]);
				responseArray.push({"address": addr_array[i], "addressIsValid": true, "balance": Number(balance)});
			}
			else{
				responseArray.push({"address": addr_array[i], "addressIsValid": false, "balance": -1});
			}
		}
		res.send({"result":responseArray, "status": true, "timestamp": Date.now()});
	}
	catch(e){
		res.send({"result":e.message, "status": false, "timestamp": Date.now()});
	}
})

//Start API at 3000
app.listen(port, () => {
  console.log(`API started at port: ${port}`)
})

