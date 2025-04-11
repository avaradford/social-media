const FalCoin = artifacts.require("FalCoin");
const PostManager = artifacts.require("PostManager");

module.exports = function(deployer) {
    // Deploy FalCoin with an initial supply of 1,000,000 tokens
    deployer.deploy(FalCoin, 1000000);

    // Deploy the PostManager contract
    deployer.deploy(PostManager);
};