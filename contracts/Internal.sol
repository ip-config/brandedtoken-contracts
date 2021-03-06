pragma solidity ^0.4.24;

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

import "./Organized.sol";


/**
 * @notice Contract implements internal actors interfaces.
 *
 * @dev Contract implements internal actors registration interface.
 *      Registration is done by an organization that is specified during
 *      contract construction. De-registration of internal actors (even by
 *      organization) is prohibited.
 */
contract Internal is Organized {


    /* Events */

    event InternalActorRegistered(
        address indexed _organization,
        address _actor
    );


    /* Storage */

    /**
     * Variable is defined private to highlight that even derived contracts
     * are not able to modify the internal actors.
     */
    mapping (address /* internal actor */ => bool) public isInternalActor;


    /* Special Functions */

    constructor(OrganizationInterface _organization)
        public
        Organized(_organization)
    {}


    /* External Functions */

    /**
     * @notice Registers internal actors.
     *
     * @param _internalActors Array of addresses of the internal actors
     *        to register.
     */
    function registerInternalActor(address[] _internalActors)
        external
        onlyWorker
    {
        for (uint256 i = 0; i < _internalActors.length; i++) {

            if (!isInternalActor[_internalActors[i]]) {
                isInternalActor[_internalActors[i]] = true;
                emit InternalActorRegistered(organization, _internalActors[i]);
            }
        }
    }
}
