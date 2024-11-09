import React, { useEffect } from 'react';
import { View, Text, KeyboardAvoidingView, SafeAreaView, StyleSheet, useColorScheme } from 'react-native';
import Homepage from './pages/Homepage';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Route from './route/route';




const App = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  useEffect(() => {
    
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    
    const storageStatus = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);  
    const cameraStatus = await request(PERMISSIONS.ANDROID.CAMERA); 
    console.log('Camera permission:', cameraStatus);
    const iosCameraStatus = await request(PERMISSIONS.IOS.CAMERA);   
    const iosStorageStatus = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);           
    console.log('iOS Camera permission:', iosCameraStatus);
    console.log('Storage permission:', storageStatus);
    // console.log('iOS Storage permission:', iosStorageStatus);
    
    
    // const cameraCheck = await check(PERMISSIONS.ANDROID.CAMERA);
    // const storageCheck = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);

    // console.log('Camera status:', cameraCheck);
    // console.log('Storage status:', storageCheck);
  };

  return (
    <SafeAreaView style={[styles.container]}>
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <Route/>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
});
