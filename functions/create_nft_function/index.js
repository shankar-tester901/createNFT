const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const pinataApiKey = "210347bdb";
const pinataSecretApiKey = "acf5f09c52ac48cfbc5f854f821b37e";
const express = require('express');
const fileUpload = require('express-fileupload');
require("dotenv").config();
const API_URL = process.env.API_URL;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const alchemyWeb3 = createAlchemyWeb3(API_URL);
const contract = require("./TorNFT.json");
const METAMASK_PUBLIC_KEY = process.env.METAMASK_PUBLIC_KEY;
const METAMASK_PRIVATE_KEY = process.env.METAMASK_PRIVATE_KEY;


app = new express();
app.use(express.json());
app.use(fileUpload());

//https://blog.logrocket.com/how-to-create-nfts-with-javascript/

const contractAddress = "0xbc188c7ce0a7d053C1486c";
const nftContract = new alchemyWeb3.eth.Contract(contract.abi, contractAddress);



app.post('/uploadFile', async (req, res) => {
    await req.files.data.mv(`${__dirname}/uploads/${req.files.data.name}`);
    
    let message = await pinFileToIPFS(pinataApiKey, pinataSecretApiKey, __dirname + '/uploads/' + req.files.data.name);
    console.log('message from pinFile is  -- ++ ' + message);

    const nonce = await alchemyWeb3.eth.getTransactionCount(
        METAMASK_PUBLIC_KEY,
        "latest"
    );

    console.log('nonce is  ' + nonce);

    const tx = {
        from: METAMASK_PUBLIC_KEY, // your metamask public key
        to: contractAddress, // the smart contract address we want to interact with
        nonce: nonce, // nonce with the no of transactions from our account
        gas: 2000000, // fee estimate to complete the transaction
        data: nftContract.methods
            .createNFT("0x0d28235B6191a66A3410cc865", message)
            .encodeABI(), // call the createNFT function from  OsunRiverNFT.sol file
    };

    const signPromise = await alchemyWeb3.eth.accounts.signTransaction(
        tx,
        METAMASK_PRIVATE_KEY
    );

    await alchemyWeb3.eth.sendSignedTransaction(
        signPromise.rawTransaction,
        function (err, hash) {
            if (!err) {
                console.log("Check Alchemy's Mempool for  ----    " + hash);
                res.setHeader('Content-Type', 'application/json');
                let responseMessage = '<b>Congratulations! </b> <br>Your newly minted NFT is located in the Blockchain at  - https://ropsten.etherscan.io/tx/' + hash + ' </b> Let us see if it is indeed uploaded to Blockchain.';
        
                res.status(200).send({
                    "status": "successfully minted your NFT ",
                    "message": responseMessage + ' <br><br> Do the following in <b> Chrome browser </b> only. Wait for the page to load fully .. You should see the Click to See link at the bottom <br> - Press on Click to See More. <br> - Click on Decode Input Data <br> - Open the url shown for the string attribute in the Input Data table . <br> - Open the url shown for the image attribute  <br> <br> Congrats! You have successfully minted your own NFT.'
                });
            }
            else {
                console.log("Something went wrong when submitting your transaction:", err);
                res.status(200).send({
                    "status": "error minting your NFT ",
                    "message": responseMessage + ' <br><br> Error minting your NFT. Pls try again later<br><br>'
                });
            }
        })
    
    
})







 const pinFileToIPFS = async(pinataApiKey, pinataSecretApiKey, filepath) => {

    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    const json_url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    let data = new FormData();

    data.append('file', fs.createReadStream(filepath));

     let response1 =   await axios.post(url,
        data,
        {
            maxContentLength: 'Infinity', //this is needed to prevent axios from erroring out with large files
            headers: {
                'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                'pinata_api_key': pinataApiKey,
                'pinata_secret_api_key': pinataSecretApiKey
            }
        }
    );
	let response2 = response1.data;

        const imageUrl = 'https://ipfs.io/ipfs/'+response2.IpfsHash;
        console.log('view image at ' +imageUrl);
        var data2 = JSON.stringify({"name":"My first NFT","description":"Catalyst makes getting an NFT easy","image":imageUrl});

    let response3 =  await axios.post(json_url,data2,
            {
                maxContentLength: 'Infinity', //this is needed to prevent axios from erroring out with large files
                headers: {
                    'Content-Type': `application/json`,
                    'pinata_api_key': pinataApiKey,
                    'pinata_secret_api_key': pinataSecretApiKey
                }
            });
			
	let response4 = response3.data;

    const jsonUrlHere = 'https://ipfs.io/ipfs/'+response4.IpfsHash;
	console.log('view json at  ' +jsonUrlHere);
	return jsonUrlHere;


};





module.exports = app;
