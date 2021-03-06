/**
 * Copyright 2015 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */
(function () {
  'use strict';

  angular
    .module('horizon.app.core.openstack-service-api')
    .factory('horizon.app.core.openstack-service-api.neutron', neutronAPI);

  neutronAPI.$inject = [
    'horizon.framework.util.http.service',
    'horizon.framework.widgets.toast.service'
  ];

  /**
   * @ngdoc service
   * @name neutronAPI
   * @param {Object} apiService
   * @param {Object} toastService
   * @description Provides access to Neutron APIs.
   * @returns {Object} The service
   */
  function neutronAPI(apiService, toastService) {
    var service = {
      createNetwork: createNetwork,
      createSubnet: createSubnet,
      createTrunk: createTrunk,
      createNetworkQoSPolicy: createNetworkQoSPolicy,
      deletePolicy: deletePolicy,
      deleteTrunk: deleteTrunk,
      getAgents: getAgents,
      getDefaultQuotaSets: getDefaultQuotaSets,
      getExtensions: getExtensions,
      getNetworks: getNetworks,
      getPorts: getPorts,
      getQosPolicy: getQosPolicy,
      getQoSPolicies: getQoSPolicies,
      getSubnets: getSubnets,
      getTrunk: getTrunk,
      getTrunks: getTrunks,
      updateProjectQuota: updateProjectQuota,
      updateTrunk: updateTrunk
    };

    return service;

    /////////////

    // NOTE(bence romsics): Technically we replace ISO 8061 time stamps with
    // date objects. We do this because the date objects will stringify to human
    // readable datetimes in local time (ie. in the browser's time zone) when
    // displayed.
    function convertDatesHumanReadable(apidict) {
      apidict.created_at = new Date(apidict.created_at);
      apidict.updated_at = new Date(apidict.updated_at);
    }

    // Neutron Services

    /**
     * @name getAgents
     * @description Get the list of Neutron agents.
     *
     * @returns {Object} An object with property "items." Each item is an agent.
     */
    function getAgents() {
      return apiService.get('/api/neutron/agents/')
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve the agents.'));
        });
    }

    // Networks

    /**
     * @name getNetworks
     * @description
     * Get a list of networks for a tenant.
     *
     * @returns {Object} An object with property "items". Each item is a network.
     */
    function getNetworks() {
      return apiService.get('/api/neutron/networks/')
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve the networks.'));
        });
    }

    /**
     * @name createNetwork
     * @description
     * Create a new network.
     * @returns {Object} The new network object on success.
     *
     * @param {Object} newNetwork
     * The network to create.  Required.
     *
     * Example new network object
     * {
     *    "name": "myNewNetwork",
     *    "admin_state_up": true,
     *    "shared": true,
     *    "tenant_id": "4fd44f30292945e481c7b8a0c8908869
     * }
     *
     * Description of properties on the network object
     *
     * @property {string} newNetwork.name
     * The name of the new network. Optional.
     *
     * @property {boolean} newNetwork.admin_state_up
     * The administrative state of the network, which is up (true) or
     * down (false). Optional.
     *
     * @property {boolean} newNetwork.shared
     * Indicates whether this network is shared across all tenants.
     * By default, only adminstative users can change this value. Optional.
     *
     * @property {string} newNetwork.tenant_id
     * The UUID of the tenant that will own the network.  This tenant can
     * be different from the tenant that makes the create network request.
     * However, only administative users can specify a tenant ID other than
     * their own.  You cannot change this value through authorization
     * policies.  Optional.
     *
     */
    function createNetwork(newNetwork) {
      return apiService.post('/api/neutron/networks/', newNetwork)
        .error(function () {
          toastService.add('error', gettext('Unable to create the network.'));
        });
    }

    // Subnets

    /**
     * @name getSubnets
     * @description
     * Get a list of subnets for a network.
     *
     * The listing result is an object with property "items". Each item is
     * a subnet.
     *
     * @param {string} networkId
     * The network id to retrieve subnets for. Required.
     * @returns {Object} The result of the API call
     */
    function getSubnets(networkId) {
      return apiService.get('/api/neutron/subnets/', networkId)
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve the subnets.'));
        });
    }

    /**
     * @name createSubnet
     * @description
     * Create a Subnet for given Network.
     * @returns {Object} The JSON representation of Subnet on success.
     *
     * @param {Object} newSubnet
     * The subnet to create.
     *
     * Example new subnet object
     * {
     *    "network_id": "d32019d3-bc6e-4319-9c1d-6722fc136a22",
     *    "ip_version": 4,
     *    "cidr": "192.168.199.0/24",
     *    "name": "mySubnet",
     *    "tenant_id": "4fd44f30292945e481c7b8a0c8908869,
     *    "allocation_pools": [
     *       {
     *          "start": "192.168.199.2",
     *          "end": "192.168.199.254"
     *       }
     *    ],
     *    "gateway_ip": "192.168.199.1",
     *    "id": "abce",
     *    "enable_dhcp": true,
     * }
     *
     * Description of properties on the subnet object
     * @property {string} newSubnet.network_id
     * The id of the attached network. Required.
     *
     * @property {number} newSubnet.ip_version
     * The IP version, which is 4 or 6. Required.
     *
     * @property {string} newSubnet.cidr
     * The CIDR. Required.
     *
     * @property {string} newSubnet.name
     * The name of the new subnet. Optional.
     *
     * @property {string} newSubnet.tenant_id
     * The ID of the tenant who owns the network.  Only administrative users
     * can specify a tenant ID other than their own. Optional.
     *
     * @property {string|Array} newSubnet.allocation_pools
     * The start and end addresses for the allocation pools.  Optional.
     *
     * @property {string} newSubnet.gateway_ip
     * The gateway IP address.  Optional.
     *
     * @property {string} newSubnet.id
     * The ID of the subnet. Optional.
     *
     * @property {boolean} newSubnet.enable_dhcp
     * Set to true if DHCP is enabled and false if DHCP is disabled. Optional.
     *
     */
    function createSubnet(newSubnet) {
      return apiService.post('/api/neutron/subnets/', newSubnet)
        .error(function () {
          toastService.add('error', gettext('Unable to create the subnet.'));
        });
    }

    // Ports

    /**
     * @name getPorts
     * @description
     * Get a list of ports for a network.
     *
     * The listing result is an object with property "items". Each item is
     * a port.
     *
     * @param {string} params - The parameters
     * @param {string} params.status
     * The port status. Value is ACTIVE or DOWN.
     *
     * @param {string} params.display_name
     * The port name.
     *
     * @param {boolean} params.admin_state
     * The administrative state of the router, which is up (true) or down (false).
     *
     * @param {string} params.network_id
     * The UUID of the attached network.
     *
     * @param {string} params.tenant_id
     * The UUID of the tenant who owns the network.
     * Only administrative users can specify a tenant UUID other than their own.
     * You cannot change this value through authorization policies.
     *
     * @param {string} params.device_owner
     * The UUID of the entity that uses this port. For example, a DHCP agent.
     *
     * @param {string} params.mac_address
     * The MAC address of the port.
     *
     * @param {string} params.port_id
     * The UUID of the port.
     *
     * @param {Array} params.security_groups
     * The UUIDs of any attached security groups.
     *
     * @param {string} params.device_id
     * The UUID of the device that uses this port. For example, a virtual server.
     *
     * @returns {Object} The result of the API call
     */
    function getPorts(params) {
      var config = params ? { 'params' : params} : {};
      return apiService.get('/api/neutron/ports/', config)
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve the ports.'));
        });
    }

    // Extensions

    /**
     * @name getExtensions
     * @description
     * Returns a list of enabled extensions.
     *
     * The listing result is an object with property "items". Each item is
     * an extension.
     * @example
     * The following is an example of response:
     *
     *  {
     *    "items": [
     *      {
     *        "updated": "2012-07-29T10:00:00-00:00",
     *        "name": "Quota management support",
     *        "links": [],
     *        "alias": "quotas",
     *        "description": "Expose functions for quotas management per tenant"
     *      }
     *    ]
     *  }
     * @returns {Object} The result of the API call
     */
    function getExtensions() {
      return apiService.get('/api/neutron/extensions/')
        .error(function() {
          toastService.add('error', gettext('Unable to retrieve the extensions.'));
        });
    }

    // Default Quota Sets

    /**
     * @name getDefaultQuotaSets
     * @description
     * Get default quotasets
     *
     * The listing result is an object with property "items." Each item is
     * a quota.
     *
     */
    function getDefaultQuotaSets() {
      return apiService.get('/api/neutron/quota-sets/defaults/')
        .error(function() {
          toastService.add('error', gettext('Unable to retrieve the default quotas.'));
        });
    }

    // Quotas Extension

    /**
     * @name updateProjectQuota
     * @description
     * Update a single project quota data.
     * @param {application/json} quota
     * A JSON object with the attributes to set to new quota values.
     * @param {string} projectId
     * Specifies the id of the project that'll have the quota data updated.
     */
    function updateProjectQuota(quota, projectId) {
      var url = '/api/neutron/quotas-sets/' + projectId;
      return apiService.patch(url, quota)
        .error(function() {
          toastService.add('error', gettext('Unable to update project quota data.'));
        });
    }

    // QoS policies

    /**
     * @name horizon.app.core.openstack-service-api.neutron.getQosPolicy
     * @description get a single qos policy by ID.
     * @param {string} id
     * Specifies the id of the policy to request.
     * @returns {Object} The result of the API call
     */
    function getQosPolicy(id, suppressError) {
      var promise = apiService.get('/api/neutron/qos_policies/' + id + '/')
        .success(function(policy) {
          convertDatesHumanReadable(policy);
        });
      promise = suppressError ? promise : promise.error(function () {
        var msg = gettext('Unable to retrieve the policy with ID %(id)s');
        toastService.add('error', interpolate(msg, {id: id}, true));
      });
      return promise;
    }

    /**
     * @name horizon.app.core.openstack-service-api.neutron.getQoSPolicies
     * @description get a list of qos policies.
     *
     * The listing result is an object with property "items". Each item is
     * a QoS policy.
     */
    function getQoSPolicies(params) {
      var config = params ? {'params' : params} : {};
      return apiService.get('/api/neutron/qos_policies/', config)
        .success(function(policies) {
          policies.items.forEach(function(policy) {
            convertDatesHumanReadable(policy);
          });
        })
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve the qos policies.'));
        });
    }

     /**
     * @name createNetworkQoSPolicy
     * @description
     * Create a new network qos policy.
     * @returns {Object} The new network qos policy object on success.
     *
     * @param {Object} newQosPolicy
     * The network qos policy to create.  Required.
     *
     * Example new qos policy object
     * {
     *    "name": "myNewNetworkQoSPolicy",
     *    "description": "new network qos policy",
     *    "shared": true,
     * }
     *
     * Description of properties on the qos policy object
     *
     * @property {string} newQosPolicy.name
     * The name of the new network qos policy. Required.
     *
     * @property {string} newQosPolicy.description
     * The description of the qos policy. Optional.
     *
     * @property {boolean} newQosPolicy.shared
     * Indicates whether this network qos policy is shared across all other projects.
     * By default, it is unchecked (false). Optional.
     *
     */
    function createNetworkQoSPolicy(newQosPolicy) {
      return apiService.post('/api/neutron/qos_policies/', newQosPolicy)
        .error(function () {
          toastService.add('error', gettext('Unable to create the QoS Policy.'));
        });
    }

    /**
     * @name deletePolicy
     * @description
     * Delete a single neutron qos policy.
     * @param {string} policyId
     * Specifies the id of the policy to be deleted.
     */
    function deletePolicy(policyId, suppressError) {
      var promise = apiService.delete('/api/neutron/qos_policies/' + policyId + '/');
      promise = suppressError ? promise : promise.error(function() {
        var msg = gettext('Unable to delete qos policy %(id)s');
        toastService.add('error', interpolate(msg, { id: policyId }, true));
      });
      return promise;
    }
    // Trunks

    /**
     * @name getTrunk
     * @description
     * Get a single trunk by ID
     *
     * @param {string} id
     * Specifies the id of the trunk to request.
     *
     * @param {boolean} suppressError (optional)
     * Suppress the error toast. Default to showing it.
     *
     * @returns {Object} The result of the API call
     */
    function getTrunk(id, suppressError) {
      var promise = apiService.get('/api/neutron/trunks/' + id + '/')
        .success(function(trunk) {
          convertDatesHumanReadable(trunk);
        });
      promise = suppressError ? promise : promise.error(function () {
        var msg = gettext('Unable to retrieve the trunk with id: %(id)s');
        toastService.add('error', interpolate(msg, {id: id}, true));
      });
      return promise;
    }

    /**
     * @name getTrunks
     * @description
     * Get a list of trunks for a tenant.
     *
     * @returns {Object} An object with property "items". Each item is a trunk.
     */
    function getTrunks(params) {
      var config = params ? {'params' : params} : {};
      return apiService.get('/api/neutron/trunks/', config)
        .success(function(trunks) {
          trunks.items.forEach(function(trunk) {
            convertDatesHumanReadable(trunk);
          });
        })
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve the trunks.'));
        });
    }

    /**
     * @name createTrunk
     * @description
     * Create a neutron trunk.
     */
    function createTrunk(newTrunk) {
      return apiService.post('/api/neutron/trunks/', newTrunk)
        .error(function () {
          toastService.add('error', gettext('Unable to create the trunk.'));
        });
    }

    /**
     * @name deleteTrunk
     * @description
     * Delete a single neutron trunk.
     *
     * @param {string} trunkId
     * UUID of a trunk to be deleted.
     *
     * @param {boolean} suppressError (optional)
     * Suppress the error toast. Default to showing it.
     */
    function deleteTrunk(trunkId, suppressError) {
      var promise = apiService.delete('/api/neutron/trunks/' + trunkId + '/');
      promise = suppressError ? promise : promise.error(function() {
        var msg = gettext('Unable to delete trunk: %(id)s');
        toastService.add('error', interpolate(msg, { id: trunkId }, true));
      });
      return promise;
    }

    /**
     * @name updateTrunk
     * @description
     * Update an existing trunk.
     */
    function updateTrunk(oldTrunk, newTrunk) {
      return apiService.patch('/api/neutron/trunks/' + oldTrunk.id + '/', [oldTrunk, newTrunk])
      .error(function() {
        toastService.add('error', gettext('Unable to update the trunk.'));
      });
    }

  }
}());
