import React, { useState } from 'react';
import { View, Image, StyleSheet, Dimensions, Text } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler, State, PinchGestureHandler } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');

const Fullimage = ({ route }) => {
  const { images, initialIndex } = route.params;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);  
  const [previousScale, setPreviousScale] = useState(1);  

  const handleSwipe = (direction) => {
    if (direction === 'left' && currentIndex < images.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    } else if (direction === 'right' && currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
    }
  };

  const onSwipeStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;
      if (translationX < -50) {
        handleSwipe('left');
      } else if (translationX > 50) {
        handleSwipe('right');
      }
    }
  };

  
  const onPinchGestureEvent = (event) => {
    const newScale = previousScale * event.nativeEvent.scale;
    setScale(newScale);  
  };

  const onPinchStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      setPreviousScale(scale);  
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PanGestureHandler onHandlerStateChange={onSwipeStateChange}>
        <PinchGestureHandler
          onGestureEvent={onPinchGestureEvent}
          onHandlerStateChange={onPinchStateChange}>
          <View style={styles.container}>
            <Image
              source={{ uri: images[currentIndex].uri }}
              style={[styles.fullImage, { transform: [{ scale: scale }] }]}  
            />
            <Text style={styles.imageText}>{images[currentIndex].id}</Text>
          </View>
        </PinchGestureHandler>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: width,
    height: height,
    resizeMode: 'contain',
  },
  imageText: {
    position: 'absolute',
    bottom: 30,
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Fullimage;
