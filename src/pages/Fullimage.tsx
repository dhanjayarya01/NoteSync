import React, { useState } from 'react';
import { View, Image, StyleSheet, Dimensions, Text } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler, State, PinchGestureHandler } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');

const Fullimage = ({ route }) => {
  const { images, initialIndex } = route.params;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [previousScale, setPreviousScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [lastTranslateX, setLastTranslateX] = useState(0);
  const [lastTranslateY, setLastTranslateY] = useState(0);

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

  const onPanGestureEvent = (event) => {
    if (scale > 1) {
      setTranslateX(lastTranslateX + event.nativeEvent.translationX);
      setTranslateY(lastTranslateY + event.nativeEvent.translationY);
    }
  };

  const onPanStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      setLastTranslateX(translateX);
      setLastTranslateY(translateY);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PanGestureHandler onGestureEvent={onPanGestureEvent} onHandlerStateChange={onPanStateChange}>
        <PinchGestureHandler onGestureEvent={onPinchGestureEvent} onHandlerStateChange={onPinchStateChange}>
          <View style={styles.container}>
            <Image
              source={{ uri: images[currentIndex].uri }}
              style={[
                styles.fullImage,
                {
                  transform: [
                    { scale: scale },
                    { translateX: translateX },
                    { translateY: translateY },
                  ],
                },
              ]}
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
