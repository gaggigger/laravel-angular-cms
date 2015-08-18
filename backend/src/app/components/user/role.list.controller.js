/*
 * This file is part of EMCOO TEAM PROJECT.
 *
 *  (c) EMCOO TEAM
 *  (c) DevMark <mark@emcoo.com>
 *
 *  For the full copyright and license information, please view http://emcoo.com/
 *
 *
 */
(function () {
    'use strict';

    angular.module('userModule').controller('RoleListController', RoleListController);

    function RoleListController(userService, roleService, $location, toaster, $translate, $q, angularMomentConfig, permissionService) {
        var vm = this;

        //==========================================
        // Load Data
        //==========================================
        permissionService.get().then(function (result) {
            vm.permissions = result;
        });

        //================================================
        // Table & Filter
        //================================================
        vm.tableLoading = false;
        vm.paginationAction = '';
        vm.rowCollection = [];
        vm.itemsByPage = 15;

        vm.filter = {
            limit: vm.itemsByPage,
            page: parseInt($location.search().page) || 1,
            search: $location.search().search || ''
        };


        vm.resetFilter = function () {
            var deferred = $q.defer();
            vm.filter.search = null;

            deferred.resolve();
            return deferred.promise;
        };

        vm.filterAction = function () {
            var deferred = $q.defer();


            deferred.resolve();
            return deferred.promise;
        };
        vm.resetFilter();

        vm.callServer = function callServer(tableState) {
            var params = angular.copy(vm.filter);

            var pagination = tableState.pagination;
            if (vm.paginationAction === 'next') {
                params.page = pagination.next;
            } else if (vm.paginationAction === 'prev') {
                params.page = pagination.prev;
            }

            vm.tableLoading = true;
            roleService.get(params, {cache: false}).then(function (result) {
                tableState.pagination.next = result.meta.pagination.next_page || null;
                tableState.pagination.prev = result.meta.pagination.prev_page || null;
                //update products list
                vm.rowCollection = result;
                vm.tableLoading = false;
            });
        };


        //================================================
        //Event
        //================================================
        vm.add = function () {
            vm.rowCollection.push({id: '', 'name': '', permissions: []});
        };
        vm.save = function (row) {

            var index = vm.rowCollection.indexOf(row);
            if (index === -1) {
                return;
            }
            var data = angular.copy(row);


            if (data.id !== '') {
                console.log('sd');
                roleService.update(data.id, data).then(function () {
                    // show notifications
                    toaster.pop('success', '', $translate.instant('role.edit_success_msg'));
                }, function () {
                    // show notifications
                    toaster.pop('error', '', $translate.instant('role.edit_error_msg'));

                });
            } else {
                roleService.store(data).then(function () {
                    // remove the row data
                    // vm.rowCollection.splice(index, 1);

                    // show notifications
                    toaster.pop('success', '', $translate.instant('role.create_success_msg'));
                }, function () {
                    // show notifications
                    toaster.pop('error', '', $translate.instant('role.create_error_msg'));

                });
            }
        };

        vm.remove = function removeItem(row) {
            var index = vm.rowCollection.indexOf(row);
            if (index !== -1 && row.id !== '') {
                roleService.destroy(row.id).then(function () {
                        // remove the row data
                        vm.rowCollection.splice(index, 1);

                        // show notifications
                        toaster.pop('success', '', $translate.instant('role.delete_success_msg'));
                    },
                    function () {
                        // show notifications
                        toaster.pop('error', '', $translate.instant('role.delete_error_msg'));

                    });
            }
        };

        vm.bulkRemove = function () {
            var removePromises = [];
            _.each(vm.rowCollection, function (row, index) {
                if (row.isSelected === true && row.id !== '') {
                    removePromises.push(userService.destroy(row.id));
                }
            });
            $q.all(removePromises).then(function () {
                var newRowCollection = [];
                for (var i = 0; i < vm.rowCollection.length; i++) {
                    if (!(vm.rowCollection[i].isSelected === true && vm.rowCollection[i].id !== '')) {
                        newRowCollection.push(vm.rowCollection[i]);
                    }
                }
                vm.rowCollection = newRowCollection;

                // show notifications
                toaster.pop('success', '', $translate.instant('role.delete_success_msg'));
            }, function () {
                // show notifications
                toaster.pop('error', '', $translate.instant('role.delete_error_msg'));
            });
        };

    }


})();
