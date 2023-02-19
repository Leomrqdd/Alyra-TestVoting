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









//     const _name = "ALYRA"
//     const _symbol = "ALY"
//     const _initialSupply = new BN(10000); 
//     const _owner = accounts[0];
//     const _decimals = new BN(18);
//     const _recipient = accounts[1];
//     const _spender = accounts[2];
//     let MyTokenInstance;

//     beforeEach(async function() {
//         MyTokenInstance = await MyToken.new(_initialSupply, {from: _owner});
//     });

//     it("has a name", async() => {
//          expect(await MyTokenInstance.name()).to.equal(_name);   
//         })
    
//     it("has a symbol", async() => {
//         expect(await MyTokenInstance.symbol()).to.equal(_symbol);   
//         })
//     it("has 18 decimals", async() => {
//         expect(await (MyTokenInstance.decimals())).to.be.bignumber.equal(_decimals);   
//         })
//      it("check first balance of the owner", async() => {
//         expect(await MyTokenInstance.balanceOf(_owner)).to.be.bignumber.equal(_initialSupply);
//         });
    
//         it("check balance after transfer", async () => {
//         let amount = new BN(100);
//         let balanceOwnerBeforeTransfer = await MyTokenInstance.balanceOf(_owner);
//         let balanceRecipientBeforeTransfer = await MyTokenInstance.balanceOf(_recipient)
         
//         expect(balanceRecipientBeforeTransfer).to.be.bignumber.equal(new BN(0));
            
//         await MyTokenInstance.transfer(_recipient, new BN(100), {from: _owner});
         
//         let balanceOwnerAfterTransfer = await MyTokenInstance.balanceOf(_owner);
//         let balanceRecipientAfterTransfer = await MyTokenInstance.balanceOf(_recipient)
         
//         expect(balanceOwnerAfterTransfer).to.be.bignumber.equal(balanceOwnerBeforeTransfer.sub(amount));
//         expect(balanceRecipientAfterTransfer).to.be.bignumber.equal(balanceRecipientBeforeTransfer.add(amount));   
//           }); 
        
//         it("check approval", async () => {
//             let approvalBefore= await MyTokenInstance.allowance(_owner,_spender);                
//             expect(approvalBefore).to.be.bignumber.equal(new BN(0));   
//             await MyTokenInstance.approve(_spender,1000);
//             let approvalAfter= await MyTokenInstance.allowance(_owner,_spender);               
//             expect(approvalAfter).to.be.bignumber.equal(new BN(1000));   
//         });
        
//         it("check transferFrom", async () => {
//             let balanceSpenderBefore= await MyTokenInstance.balanceOf(_spender); 
//             expect(balanceSpenderBefore).to.be.bignumber.equal(new BN(0));
//             await MyTokenInstance.approve(_spender,1000);
//             await MyTokenInstance.transferFrom(_owner,_spender,1000, {from: _spender});
//             let balanceSpenderAfter= await MyTokenInstance.balanceOf(_spender);                
//             expect(balanceSpenderAfter).to.be.bignumber.equal(new BN(1000));   
//         });
        
        

// });
