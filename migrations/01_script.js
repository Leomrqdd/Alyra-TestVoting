const Voting= artifacts.require("Voting");
module.exports= async (deployer) => {
    await deployer.deploy(Voting,5);
    let instance = await Voting.deployed();
}

