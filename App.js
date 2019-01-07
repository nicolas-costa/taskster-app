/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';

import { createStackNavigator, createAppContainer } from 'react-navigation';
import Login from "./pages/Login";
import PendingTasks from "./pages/PendingTasks";


const StackNavigation = createStackNavigator({
  Login: Login,
  TasksMain: PendingTasks
})

export default createAppContainer(StackNavigation);
