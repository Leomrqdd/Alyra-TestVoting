const Voting = artifacts.require("Voting");
const {BN, expectRevert, expectEvent} = require('@openzeppelin/test-helpers');
const {expect} = require('chai');




contract("MyVotingInstance", accounts => {

    const _owner = accounts[0];
    console.log("the owner is " + _owner);
    const _voter = accounts[1];
    console.log("the voter is " + _voter);
    const _normalPeople = accounts[2];
    console.log("the normal people is " + _normalPeople);
    let MyVotingInstance;


    describe("Testing the add Voter function", () => {
        
        beforeEach(async function() {
            MyVotingInstance = await Voting.new({from: _owner});
        });

        it("Should add a Voter", async() => {
            await MyVotingInstance.addVoter(_voter);
            const storedData = await MyVotingInstance.getVoter(_voter, {from: _voter});
            expect(storedData.isRegistered).to.equal(true);
        });

        it("A voter should be added when the workflowStatus = Registering Voters", async() => {
            const storedData = await MyVotingInstance.workflowStatus.call();
            expect(storedData).to.be.bignumber.equal(new BN(0));
            await MyVotingInstance.addVoter(_voter);
            const storedData_2 = await MyVotingInstance.getVoter(_voter, {from: _voter});
            expect(storedData_2.isRegistered).to.equal(true);
        });

        it("Only the Owner should add a Voter", async() => {
            await expectRevert(MyVotingInstance.addVoter(_voter,{from: _voter}),"Ownable: caller is not the owner");
            await expectRevert(MyVotingInstance.addVoter(_voter,{from: _normalPeople}),"Ownable: caller is not the owner");
        });

        it("A Voter can't be add multiple times", async() => {
            await MyVotingInstance.addVoter(_voter)       
            await expectRevert(MyVotingInstance.addVoter(_voter),"Already registered");
        });

        
        it("A Voter Event should be emitted", async() => {
            const storedData = await MyVotingInstance.addVoter(_voter);
            await expectEvent(storedData, 'VoterRegistered',this._voter);
        });

        it("It should return the correct information about the Voter", async() => {
            await MyVotingInstance.addVoter(_voter);
            const storedData = await MyVotingInstance.getVoter(_voter, {from: _voter});
            expect(storedData.isRegistered).to.equal(true);
            expect(storedData.hasVoted).to.equal(false);
            expect(storedData.votedProposalId).to.be.bignumber.equal(new BN(0));
        });



    });

    describe("Testing the add Proposal function", () => { 

        beforeEach(async function() {
            MyVotingInstance = await Voting.new({from: _owner});
            await MyVotingInstance.addVoter(_voter);
            await MyVotingInstance.startProposalsRegistering()

        });
        
        it("Should add the first Proposal", async() => {
            await MyVotingInstance.addProposal("proposal1", {from: _voter});
            const storedData = await  MyVotingInstance.getOneProposal(1,{from: _voter});
            expect(storedData.description).to.equal("proposal1");
        });

        it("A Proposal should be added when the workflowStatus = ProposalsRegistrationStarted", async() => {
            const storedData = await MyVotingInstance.workflowStatus.call();
            expect(storedData).to.be.bignumber.equal(new BN(1));
            await MyVotingInstance.addProposal("proposal1", {from: _voter});
            const storedData_2 = await  MyVotingInstance.getOneProposal(1,{from: _voter});
            expect(storedData_2.description).to.equal("proposal1");

        });
        
        it("Only a Voter should add a Proposal", async() => {
            await expectRevert(MyVotingInstance.addProposal("proposal1",{from: _owner}),"You're not a voter");
            await expectRevert(MyVotingInstance.addProposal("proposal1",{from: _normalPeople}),"You're not a voter");
        });

        
        it("A empty Proposal can't be added", async() => {
            await expectRevert(MyVotingInstance.addProposal("", {from: _voter}), 'Vous ne pouvez pas ne rien proposer');
        });



        it("A Proposal Event should be emitted", async() => {
            const storedData = await MyVotingInstance.addProposal("proposal1", {from: _voter});
            await expectEvent(storedData, 'ProposalRegistered',1);
        });

        it("It should return the correct information about the first Proposal", async() => {
            await MyVotingInstance.addProposal("proposal1", {from: _voter});
            const storedData = await  MyVotingInstance.getOneProposal(1,{from: _voter});
            expect(storedData.description).to.equal("proposal1");
            expect(storedData.voteCount).to.be.bignumber.equal(new BN(0));

        });

    });

    describe("Testing the Voting function", () => { 

        beforeEach(async function() {
            MyVotingInstance = await Voting.new({from: _owner});
            await MyVotingInstance.addVoter(_voter);
            await MyVotingInstance.startProposalsRegistering();
            await MyVotingInstance.addProposal("proposal1", {from: _voter});
            await MyVotingInstance.endProposalsRegistering();
            await MyVotingInstance.startVotingSession();
        });

        it("Should vote for the first Proposal", async() => {
            await MyVotingInstance.setVote(1, {from: _voter});
            const storedData = await  MyVotingInstance.getVoter(_voter,{from: _voter});
            expect(storedData.hasVoted).to.equal(true);
            expect(storedData.votedProposalId).to.be.bignumber.equal(new BN(1));
            const storedData_2 = await  MyVotingInstance.getOneProposal(1,{from: _voter});
            expect(storedData_2.voteCount).to.be.bignumber.equal(new BN(1));

        });

        it("A Voter should be able to vote when the workflowStatus = VotingSessionStarted", async() => {
            const storedData = await MyVotingInstance.workflowStatus.call();
            expect(storedData).to.be.bignumber.equal(new BN(3));
            await MyVotingInstance.setVote(1, {from: _voter});
            const storedData_2 = await  MyVotingInstance.getVoter(_voter,{from: _voter});
            expect(storedData_2.hasVoted).to.equal(true);

        });

        it("Only a Voter should be able to vote", async() => {
            await expectRevert(MyVotingInstance.setVote(1, {from: _owner}),"You're not a voter");
            await expectRevert(MyVotingInstance.setVote(1, {from: _normalPeople}),"You're not a voter");
        });

        it("a Voter should be able to vote only once", async() => {
            await MyVotingInstance.setVote(1, {from: _voter});
            await expectRevert(MyVotingInstance.setVote(1, {from: _voter}),"You have already voted");
        });

        it("a Voter can only vote for a existing proposal", async() => {
            await expectRevert(MyVotingInstance.setVote(2, {from: _voter}),"Proposal not found");
        });


        it("A Vote Event should be emitted", async() => {
            const storedData = await MyVotingInstance.setVote(1, {from: _voter});
            await expectEvent(storedData, 'Voted',this._voter,1);
        });
   
    });

    describe("Testing the tallyVotes function", () => { 

        beforeEach(async function() {
            MyVotingInstance = await Voting.new({from: _owner});
            await MyVotingInstance.addVoter(_voter);
            await MyVotingInstance.startProposalsRegistering()
            await MyVotingInstance.addProposal("proposal1", {from: _voter});
            await MyVotingInstance.addProposal("proposal2", {from: _voter});
            await MyVotingInstance.endProposalsRegistering();
            await MyVotingInstance.startVotingSession();
            await MyVotingInstance.setVote(1, {from: _voter});
            await MyVotingInstance.endVotingSession();
        });

        it("Should set the correct WinningProposal", async() => {
            await MyVotingInstance.tallyVotes();
            expect(await MyVotingInstance.winningProposalID.call()).to.be.bignumber.equal(new BN(1))

        });

        it("Should set the correct Status", async() => {
            await MyVotingInstance.tallyVotes();
            expect(await MyVotingInstance.workflowStatus.call()).to.be.bignumber.equal(new BN(5))

        });

        it("The vote count should be triggered when the workflowStatus = endVotingSession", async() => {
            const storedData = await MyVotingInstance.workflowStatus.call();
            expect(storedData).to.be.bignumber.equal(new BN(4));
            await MyVotingInstance.tallyVotes();
            expect(await MyVotingInstance.winningProposalID.call()).to.be.bignumber.equal(new BN(1))
        });

        it("Only the Owner should be able to count votes", async() => {
            await expectRevert(MyVotingInstance.tallyVotes({from: _voter}),"Ownable: caller is not the owner");
            await expectRevert(MyVotingInstance.tallyVotes({from: _normalPeople}),"Ownable: caller is not the owner");
        });
        
        it("A WorkflowStatusChange Event should be emitted", async() => {
            const storedData = await MyVotingInstance.tallyVotes();
            await expectEvent(storedData, 'WorkflowStatusChange',4,5);
        });


    });

    describe("Testing the Workflow logic a bit more for each state of the Voting session", () => { 

        beforeEach(async function() {
            MyVotingInstance = await Voting.new({from: _owner});
            await MyVotingInstance.addVoter(_voter);
        });

        it("A Voter should not be registered when it is not the time of the Registration", async() => {
            await MyVotingInstance.startProposalsRegistering()
            expectRevert(MyVotingInstance.addVoter(_voter),'Voters registration is not open yet')
            await MyVotingInstance.endProposalsRegistering()
            expectRevert(MyVotingInstance.addVoter(_voter),'Voters registration is not open yet')
            await MyVotingInstance.startVotingSession()
            expectRevert(MyVotingInstance.addVoter(_voter),'Voters registration is not open yet')
            await MyVotingInstance.endVotingSession()
            expectRevert(MyVotingInstance.addVoter(_voter),'Voters registration is not open yet')
            await MyVotingInstance.tallyVotes()
            expectRevert(MyVotingInstance.addVoter(_voter),'Voters registration is not open yet')
        });

        it("A Proposal should not be added when it is not the time of the ProposalRegistration", async() => {
            expectRevert(MyVotingInstance.addProposal("proposal1", {from: _voter}),'Proposals are not allowed yet');
            await MyVotingInstance.startProposalsRegistering()
            await MyVotingInstance.endProposalsRegistering()
            expectRevert(MyVotingInstance.addProposal("proposal1", {from: _voter}),'Proposals are not allowed yet');
            await MyVotingInstance.startVotingSession()
            expectRevert(MyVotingInstance.addProposal("proposal1", {from: _voter}),'Proposals are not allowed yet');
            await MyVotingInstance.endVotingSession()
            expectRevert(MyVotingInstance.addProposal("proposal1", {from: _voter}),'Proposals are not allowed yet');
            await MyVotingInstance.tallyVotes()
            expectRevert(MyVotingInstance.addProposal("proposal1", {from: _voter}),'Proposals are not allowed yet');
        });

        it("A Voter should not be able to vote if it is not the time of the VotingSession", async() => {
            expectRevert(MyVotingInstance.setVote(1, {from: _voter}),"Voting session havent started yet");
            await MyVotingInstance.startProposalsRegistering()
            expectRevert(MyVotingInstance.setVote(1, {from: _voter}),"Voting session havent started yet");
            await MyVotingInstance.endProposalsRegistering()
            expectRevert(MyVotingInstance.setVote(1, {from: _voter}),"Voting session havent started yet");
            await MyVotingInstance.startVotingSession();
            await MyVotingInstance.endVotingSession();
            expectRevert(MyVotingInstance.setVote(1, {from: _voter}),"Voting session havent started yet");
            await MyVotingInstance.tallyVotes()
            expectRevert(MyVotingInstance.setVote(1, {from: _voter}),"Voting session havent started yet");
        });

        it("The Owner should not be able to count the Votes if it is not the time", async() => {
            expectRevert(MyVotingInstance.tallyVotes(),"Current status is not voting session ended");
            await MyVotingInstance.startProposalsRegistering()
            expectRevert(MyVotingInstance.tallyVotes(),"Current status is not voting session ended");
            await MyVotingInstance.endProposalsRegistering()
            expectRevert(MyVotingInstance.tallyVotes(),"Current status is not voting session ended");
            await MyVotingInstance.startVotingSession();
            expectRevert(MyVotingInstance.tallyVotes(),"Current status is not voting session ended");
            await MyVotingInstance.endVotingSession();
            await MyVotingInstance.tallyVotes()
            expectRevert(MyVotingInstance.tallyVotes(),"Current status is not voting session ended");
        });


    });


    describe("Testing the function startProposalsRegistering", () => { 

        beforeEach(async function() {
            MyVotingInstance = await Voting.new({from: _owner});
            await MyVotingInstance.addVoter(_voter);
        });


        it("Should start the Registration of Proposals and write the GENESIS one", async() => {
            await MyVotingInstance.startProposalsRegistering();
            const storedData = await MyVotingInstance.workflowStatus.call()
            expect(storedData).to.be.bignumber.equal(new BN(1));
            const storedData_2 = await MyVotingInstance.getOneProposal(0,{from:_voter});
            expect(storedData_2.description).to.be.equal("GENESIS");
            expect(storedData_2.voteCount).to.be.bignumber.equal(new BN(0));
        });

        it("The startProposalsRegistering function should be triggered when the workflowStatus = RegisteringVoters", async() => {
            const storedData = await MyVotingInstance.workflowStatus.call();
            expect(storedData).to.be.bignumber.equal(new BN(0));
            await MyVotingInstance.startProposalsRegistering();
            const storedData_2 = await MyVotingInstance.workflowStatus.call()
            expect(storedData_2).to.be.bignumber.equal(new BN(1));
        });

        it("Only the Owner should be able to start the Registration of Proposals", async() => {
            await expectRevert(MyVotingInstance.startProposalsRegistering({from: _voter}),"Ownable: caller is not the owner");
            await expectRevert(MyVotingInstance.startProposalsRegistering({from: _normalPeople}),"Ownable: caller is not the owner");
        });
        
        it("A WorkflowStatusChange Event should be emitted", async() => {
            const storedData = await MyVotingInstance.startProposalsRegistering();
            await expectEvent(storedData, 'WorkflowStatusChange',0,1);
        });


    });

    
    describe("Testing the function endProposalsRegistering", () => { 

        beforeEach(async function() {
            MyVotingInstance = await Voting.new({from: _owner});
            await MyVotingInstance.addVoter(_voter);
            await MyVotingInstance.startProposalsRegistering();


        });

        
        it("Should end the Registration of Proposals", async() => {
            await MyVotingInstance.endProposalsRegistering();
            const storedData = await MyVotingInstance.workflowStatus.call()
            expect(storedData).to.be.bignumber.equal(new BN(2));
        });

        it("The endProposalsRegistering function should be triggered when the workflowStatus = ProposalsRegistrationStarted", async() => {
            const storedData = await MyVotingInstance.workflowStatus.call();
            expect(storedData).to.be.bignumber.equal(new BN(1));
            await MyVotingInstance.endProposalsRegistering();
            const storedData_2 = await MyVotingInstance.workflowStatus.call()
            expect(storedData_2).to.be.bignumber.equal(new BN(2));
        });

        it("Only the Owner should be able to end the registration of Proposals", async() => {
            await expectRevert(MyVotingInstance.endProposalsRegistering({from: _voter}),"Ownable: caller is not the owner");
            await expectRevert(MyVotingInstance.endProposalsRegistering({from: _normalPeople}),"Ownable: caller is not the owner");
        });
        
        it("A WorkflowStatusChange Event should be emitted", async() => {
            const storedData = await MyVotingInstance.endProposalsRegistering();
            await expectEvent(storedData, 'WorkflowStatusChange',1,2);
        });

    });

            
    describe("Testing the function startVotingSession", () => { 

        beforeEach(async function() {
            MyVotingInstance = await Voting.new({from: _owner});
            await MyVotingInstance.addVoter(_voter);
            await MyVotingInstance.startProposalsRegistering();
            await MyVotingInstance.endProposalsRegistering();


        });

                
        it("Should start the Voting Session", async() => {
            await MyVotingInstance.startVotingSession();
            const storedData = await MyVotingInstance.workflowStatus.call()
            expect(storedData).to.be.bignumber.equal(new BN(3));
        });

        it("The startVotingSession function should be triggered when the workflowStatus = ProposalsRegistrationEnded", async() => {
            const storedData = await MyVotingInstance.workflowStatus.call();
            expect(storedData).to.be.bignumber.equal(new BN(2));
            await MyVotingInstance.startVotingSession();
            const storedData_2 = await MyVotingInstance.workflowStatus.call()
            expect(storedData_2).to.be.bignumber.equal(new BN(3));
        });

        it("Only the Owner should be able to start the Voting Session", async() => {
            await expectRevert(MyVotingInstance.startVotingSession({from: _voter}),"Ownable: caller is not the owner");
            await expectRevert(MyVotingInstance.startVotingSession({from: _normalPeople}),"Ownable: caller is not the owner");
        });
        
        it("A WorkflowStatusChange Event should be emitted", async() => {
            const storedData = await MyVotingInstance.startVotingSession();
            await expectEvent(storedData, 'WorkflowStatusChange',2,3);
        });



    });


    describe("Testing the function endVotingSession", () => { 

        beforeEach(async function() {
            MyVotingInstance = await Voting.new({from: _owner});
            await MyVotingInstance.addVoter(_voter);
            await MyVotingInstance.startProposalsRegistering();
            await MyVotingInstance.endProposalsRegistering();
            await MyVotingInstance.startVotingSession();

        });

                
        it("Should end the Voting Session", async() => {
            await MyVotingInstance.endVotingSession();
            const storedData = await MyVotingInstance.workflowStatus.call()
            expect(storedData).to.be.bignumber.equal(new BN(4));
        });

        it("The endVotingSession function should be triggered when the workflowStatus = VotingSessionStarted", async() => {
            const storedData = await MyVotingInstance.workflowStatus.call();
            expect(storedData).to.be.bignumber.equal(new BN(3));
            await MyVotingInstance.endVotingSession();
            const storedData_2 = await MyVotingInstance.workflowStatus.call()
            expect(storedData_2).to.be.bignumber.equal(new BN(4));
        });

        it("Only the Owner should be to able to end the Voting Session", async() => {
            await expectRevert(MyVotingInstance.endVotingSession({from: _voter}),"Ownable: caller is not the owner");
            await expectRevert(MyVotingInstance.endVotingSession({from: _normalPeople}),"Ownable: caller is not the owner");
        });
        
        it("A WorkflowStatusChange Event should be emitted", async() => {
            const storedData = await MyVotingInstance.endVotingSession();
            await expectEvent(storedData, 'WorkflowStatusChange',3,4);
        });



    });


    describe("More tests to learn", () => { 

        beforeEach(async function() {
            MyVotingInstance = await Voting.new({from: _owner});
        });

                
        it("Should add multiple proposals and return the number 4", async() => {
            await MyVotingInstance.addVoter(_voter);
            await MyVotingInstance.startProposalsRegistering()
            await MyVotingInstance.addProposal("proposal1", {from: _voter});
            await MyVotingInstance.addProposal("proposal2", {from: _voter});
            await MyVotingInstance.addProposal("proposal3", {from: _voter});
            await MyVotingInstance.addProposal("proposal4", {from: _voter});
            await MyVotingInstance.addProposal("proposal5", {from: _voter});
            const storedData = await  MyVotingInstance.getOneProposal(4,{from: _voter});
            expect(storedData.description).to.equal("proposal4");
        });

                        
        it("Should add multiple voters and return the number 2", async() => {
            await MyVotingInstance.addVoter(_voter);
            await MyVotingInstance.addVoter(_owner);
            await MyVotingInstance.addVoter(_normalPeople);
            const storedData = await  MyVotingInstance.getVoter(_owner,{from: _voter});
            expect(storedData.isRegistered).to.equal(true);
        });


        it("Should not be able to get a proposal which is not written", async() => {
            await MyVotingInstance.addVoter(_voter);
            await MyVotingInstance.startProposalsRegistering()
            await MyVotingInstance.addProposal("proposal1", {from: _voter});
            await MyVotingInstance.addProposal("proposal2", {from: _voter});
            await MyVotingInstance.addProposal("proposal3", {from: _voter});
            await expectRevert.unspecified(MyVotingInstance.getOneProposal(4,{from: _voter}));
        });





    });









});


