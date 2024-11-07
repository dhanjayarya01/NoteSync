import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ImageBackground, Modal, TextInput, Button, useColorScheme, Dimensions } from 'react-native';
import RNFS from 'react-native-fs';  // Importing react-native-fs to handle file system

const Homepage = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const screenWidth = Dimensions.get('window').width;
  const itemWidth = screenWidth / 3 - 20;

  
  const loadPlaylists = async () => {
    try {
      const folderPath = RNFS.ExternalDirectoryPath + '/Notesync';
      const folderContents = await RNFS.readDir(folderPath);
      const directories = folderContents.filter(item => item.isDirectory());
      const playlists = directories.map((dir) => ({
        id: dir.path, 
        name: dir.name, 
      }));

      setPlaylists(playlists);
    } catch (error) {
      console.error('Error loading playlists:', error);
    }
  };

  useEffect(() => {
    loadPlaylists(); 
  }, []);

  const renderPlaylistItem = ({ item }) => (
    <TouchableOpacity style={[styles.playlistContainer, { width: itemWidth }]}>
      <ImageBackground 
        source={require('../public/file.png')} 
        style={styles.playlistImage} 
        imageStyle={{ borderRadius: 10 }}
      >
        <View style={styles.imgbox}></View>
      </ImageBackground>
      <View style={styles.textContainer}>
        <Text style={[styles.playlistText, { color: isDarkMode ? '#ffffff' : '#333333' }]}>
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  
  const createPlaylistFolder = async (playlistName) => {
    try {
      const folderPath = RNFS.ExternalDirectoryPath + '/Notesync/' + playlistName;

      // Check if the folder already exists
      const folderExists = await RNFS.exists(folderPath);
      
      if (!folderExists) {
        // Create the folder
        await RNFS.mkdir(folderPath);
        console.log('Folder created for playlist:', folderPath);
      } else {
        console.log('Folder already exists:', folderPath);
      }
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const addNewPlaylist = () => {
    if (newPlaylistName.trim()) {
      
      const newPlaylist = { id: Date.now().toString(), name: newPlaylistName };
      setPlaylists([...playlists, newPlaylist]);
      createPlaylistFolder(newPlaylistName);
      setNewPlaylistName('');
      setModalVisible(false);
    }
  };

  return (
    <View style={[styles.container, isDarkMode ? styles.darkBackground : styles.lightBackground]}>
      <FlatList
        data={playlists}
        renderItem={renderPlaylistItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.playlistGrid}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.bottomButtons}>
        <TouchableOpacity style={[isDarkMode ? styles.darkButton : styles.lightButton]}>
          <Text style={[isDarkMode ? styles.darkText : styles.lightText]}>EDIT LIST</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[isDarkMode ? styles.darkButton : styles.lightButton]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={[isDarkMode ? styles.darkText : styles.lightText]}>ADD NEW</Text>
        </TouchableOpacity>
      </View>

     
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Playlist Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Playlist Name"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
            />
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
              <Button title="OK" onPress={addNewPlaylist} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Homepage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  lightBackground: {
    backgroundColor: '#f5f5f5',
  },
  darkBackground: {
    backgroundColor: '#1c1c1c',
  },
  playlistGrid: {
    justifyContent: 'center',
  },
  playlistContainer: {
    margin: 6,
    borderRadius: 10,
    overflow: 'hidden',
  },
  imgbox: {
    height: 85,
  },
  playlistImage: {
    height: 80,
    width: '100%',
    justifyContent: 'center',
  },
  textContainer: {
    paddingVertical: 1,
  },
  playlistText: {
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  lightButton: {
    backgroundColor: 'blue',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  darkButton: {
    backgroundColor: '#333333',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  lightText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  darkText: {
    color: '#eeeeee',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});
