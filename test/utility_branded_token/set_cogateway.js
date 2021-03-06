// Copyright 2018 OpenST Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const utils = require('../test_lib/utils'),
  UtilityBrandedTokenUtils = require('./utils'),
  MockCoGateway = artifacts.require('MockCoGateway'),
  AccountProvider = utils.AccountProvider,
  {Event} = require('../test_lib/event_decoder.js');

contract('UtilityBrandedToken::burn', async (accounts) => {
  
  let internalActor,
    tokenHolder1,
    tokenHolder2,
    tokenHolder3,
    worker,
    accountProvider,
    tokenHolder1Balance = 100,
    mockCoGateway,
    testUtilityBrandedToken,
    testUtilityBrandedToken2,
    admin,
    organization;
  
  beforeEach(async function () {
    
    accountProvider = new AccountProvider(accounts);
    tokenHolder1 = accountProvider.get();
    tokenHolder2 = accountProvider.get();
    tokenHolder3 = accountProvider.get();
    
    internalActor = [];
    internalActor.push(tokenHolder1);
    internalActor.push(tokenHolder3);
    
    ({
      testUtilityBrandedToken,
      worker,
      admin,
      organization
    } = await UtilityBrandedTokenUtils.setupUtilityBrandedToken(
      accountProvider, internalActor
    ));
    
    mockCoGateway = await MockCoGateway.new(
      testUtilityBrandedToken.address,
    );
    
    await testUtilityBrandedToken.setBalance(tokenHolder1, tokenHolder1Balance);
    
  });
  
  describe('Negative Tests', async () => {
    
    it('Reverts if non-owner address sets the cogateway', async () => {
      
      let non_organization = accountProvider.get();
      await utils.expectRevert(testUtilityBrandedToken.setCoGateway(
        mockCoGateway.address,
        { from: non_organization }),
        'Only organization or admin can call',
        'Only the organization is allowed to call this method.',
      );
      
    });
  
    it('Reverts if cogateway address is zero', async () => {
      
      await utils.expectRevert(testUtilityBrandedToken.setCoGateway(
        utils.NULL_ADDRESS,
        { from: admin }),
        'Only organization or admin can call',
        'CoGateway address should not be zero.',
      );
    
    });
    
    it('Reverts if coGateway address is already set', async () => {
      
      await testUtilityBrandedToken.setCoGateway(
        mockCoGateway.address,
        { from: admin },
      );
      
      let mockCoGateway2 = await MockCoGateway.new(
        testUtilityBrandedToken.address,
      );
      
      await utils.expectRevert(testUtilityBrandedToken.setCoGateway(
        mockCoGateway2.address,
        { from: admin }),
        'Cogateway address cannot be set again.',
        'CoGateway address already set.',
      );
      
    });
    
    it('Reverts if CoGateway is linked to other utility token', async () => {
      
      let utilityMock = await UtilityBrandedTokenUtils.setupUtilityBrandedToken(
        accountProvider, internalActor
      );
      
      testUtilityBrandedToken2 = utilityMock.testUtilityBrandedToken;
      
      let mockCoGateway2 = await MockCoGateway.new(
        testUtilityBrandedToken2.address,
      );
      
      await utils.expectRevert(testUtilityBrandedToken.setCoGateway(
        mockCoGateway2.address,
        { from: admin }),
        'CoGateway is linked to other utility token',
        'CoGateway.utilityToken is required to be UBT address.',
      );
      
    });
    
  });
  
  describe('Storage', async () => {
    
    it('Validate the cogateway address', async () => {
      
      await testUtilityBrandedToken.setCoGateway(
        mockCoGateway.address,
        { from: admin },
      );
      
      assert.equal(
        await testUtilityBrandedToken.coGateway.call(),
        mockCoGateway.address,
      );
      
    });
  });
  
  describe('Events', async () => {
    
    it('Verify CoGatewaySet event', async () => {
      
      let transactionResponse = await testUtilityBrandedToken.setCoGateway(
        mockCoGateway.address,
        { from: admin },
      );
      
      let events = Event.decodeTransactionResponse(transactionResponse);
      
      assert.strictEqual(
        events.length,
        1,
      );
      
      Event.assertEqual(events[0], {
        name: 'CoGatewaySet',
        args: {
          _coGateway: mockCoGateway.address
        }
      });
      
    });
  });
});
