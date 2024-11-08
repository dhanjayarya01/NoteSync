import { View, Text } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NavigationContainer } from '@react-navigation/native'
import Homepage from '../pages/Homepage'
import Showimage from '../pages/Showimage'
import Fullimage from '../pages/Fullimage'


const stack=createNativeStackNavigator()
const Route = () => {
  return (
   <NavigationContainer>
    <stack.Navigator initialRouteName='Homepage'>
    <stack.Screen
    name='Homepage'
    component={Homepage}
    options={{
        headerShown:false
    }}
    />
    <stack.Screen
    name='Showimage'
    component={Showimage}
    options={{
        headerShown:false
    }}
    />
    <stack.Screen
    name='Fullimage'
    component={Fullimage}
    options={{
        headerShown:false
    }}
    />


    </stack.Navigator>

   </NavigationContainer>
  )
}

export default Route