const Voting = artifacts.require("Voting");
const {BN, expectRevert, expectEvent} = require('@openzeppelin/test-helpers');
const {expect} = require('chai');




contract("MyVotingInstance", accounts => {
    const _owner = accounts[0];
    const _voter = accounts[1];
    const _normalPeople = accounts[2];
    const proposal = 'proposal0';
    let MyVotingInstance;


    beforeEach(async function() {
        MyVotingInstance = await Voting.new({from: _owner});
    });

    it("The contract should exist", async() => {
    });

    it("Should add a Voter", async() => {
        await MyVotingInstance.addVoter(_voter);
        structVoter = await MyVotingInstance.getVoter(_voter, {from: _voter});
        expect(structVoter[0]).to.equal(true);
    });

    it("A Voter is Registered", async() => {
        const result = await MyVotingInstance.addVoter(_voter);
        await expectEvent(result, 'VoterRegistered');
    });

    it("Only the Owner should add a Voter", async() => {
        await expectRevert(MyVotingInstance.addVoter(_voter,{from: _voter}),"Ownable: caller is not the owner");
        await expectRevert(MyVotingInstance.addVoter(_voter,{from: _normalPeople}),"Ownable: caller is not the owner");
    });

    it("A Voter can't be add multiple times", async() => {
        await MyVotingInstance.addVoter(_voter)       
        await expectRevert(MyVotingInstance.addVoter(_voter,{from: _owner}),"Already registered");
    });

    it("A Voter is registered only when WorkFlowStatus = RegisteringVoters", async() => {


    });




});


