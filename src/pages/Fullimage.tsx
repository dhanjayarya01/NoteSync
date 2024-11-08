import { View, Text } from 'react-native'
import React from 'react'

const Fullimage = ({ route, navigation }) => {
    const {imageuri}=route.params

    console.log(imageuri)
  return (
    <View>
      <Text>Fullimage</Text>
    </View>
  )
}

export default Fullimage