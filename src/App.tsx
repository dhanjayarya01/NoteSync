import React from 'react';
import { View, Text, KeyboardAvoidingView, SafeAreaView, StyleSheet, useColorScheme } from 'react-native';
import Homepage from './pages/Homepage';

const App = () => {
  const colorScheme = useColorScheme(); 
  const isDarkMode = colorScheme === 'dark';

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
