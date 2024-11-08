import React, { useEffect } from 'react';
import { View, Text, KeyboardAvoidingView, SafeAreaView, StyleSheet, useColorScheme } from 'react-native';
import Homepage from './pages/Homepage';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const App = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  useEffect(() => {
    
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    // Request Camera permission
    const cameraStatus = await request(PERMISSIONS.ANDROID.CAMERA);  // Android
    const iosCameraStatus = await request(PERMISSIONS.IOS.CAMERA);   // iOS

    console.log('Camera permission:', cameraStatus);
    console.log('iOS Camera permission:', iosCameraStatus);

    // Request Storage permission (Read/Write)
    const storageStatus = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);  // Android
    const iosStorageStatus = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);           // iOS

    console.log('Storage permission:', storageStatus);
    console.log('iOS Storage permission:', iosStorageStatus);
    
    // Optionally, check permission status after requesting
    const cameraCheck = await check(PERMISSIONS.ANDROID.CAMERA);
    const storageCheck = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);

    console.log('Camera status:', cameraCheck);
    console.log('Storage status:', storageCheck);
  };

  return (
    <SafeAreaView style={[styles.container]}>
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <View style={[styles.header, isDarkMode ? styles.darkHeader : styles.lightHeader]}>
          <Text style={[styles.title, isDarkMode ? styles.darkTitle : styles.lightTitle]}>NOTE SYNC</Text>
        </View>
        <Homepage />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  lightHeader: {
    backgroundColor: 'blue',
  },
  darkHeader: {
    backgroundColor: 'black',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  lightTitle: {
    color: '#ffffff',
  },
  darkTitle: {
    color: 'white',
  },
});
