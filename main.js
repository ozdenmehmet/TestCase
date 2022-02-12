const axios = require('axios');

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
//Promise creator 
function fetcher(address, ethPrice){
	return new Promise(async (resolve, reject) => {
		if(Web3.utils.isAddress(address)){
			let balance =  await getBalance(address);
			let totalAccountValue = ethPrice.data.ethereum.usd * Number(balance);
			resolve({"address": address, "addressIsValid": true, "balances": [{"balance_ETH": Number(balance)}], "totalAccountValue_USD": totalAccountValue});
			return;
		}
		else{
			resolve({"address": address, "addressIsValid": false, "balances": [{"balance_ETH": -1}],  "totalAccountValue_USD": -1});
		}
	});
}

//Checks the incoming address list and then if exist returns the account balances of the addresses 
app.post('/checkBalances', async (req, res) => {
	try{
		let addr_array = req.body.addr_array;
		if(addr_array == null || addr_array.length == 0){ throw new Error("Request empty or undefined"); }

		//Fetch eth current price from coingecko
		let ethPrice = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum%2C&vs_currencies=usd');

		//promise array creation
		let promiseArray = addr_array.map(address => fetcher(address, ethPrice));

		//run all promises
		Promise.all(promiseArray)
			.then(results => { res.send(results); })
			.catch(error => { res.send({"result":error.message, "status": false, "timestamp": Date.now()});	});
		}
	catch(e){
		res.send({"result":e.message, "status": false, "timestamp": Date.now()});
	}
	
	
})

//Start API at 3000
app.listen(port, () => {
  console.log(`API started at port: ${port}`)
})

