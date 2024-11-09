import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Modal, Alert, TextInput, Button, Share } from 'react-native';
import React, { useEffect, useState } from 'react';
import RNFS from 'react-native-fs';
import { useColorScheme } from 'react-native';

const Showimage = ({ route, navigation }) => {
  const { playlist, playlistname } = route.params;
  const [images, setImages] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [input, setInput] = useState('');

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  useEffect(() => {
    const loadImages = async () => {
      try {
        const files = await RNFS.readDir(playlist);
        const imageFiles = files
          .filter(file => file.isFile() && /\.(jpg|jpeg|png)$/i.test(file.name))
          .map(file => ({
            id: file.name,
            uri: 'file://' + file.path,
            mtime: file.mtime,
          }))
          .sort((a, b) => b.mtime - a.mtime);

        setImages(imageFiles);
      } catch (error) {
        console.error('Error reading directory:', error);
      }
    };

    loadImages();
  }, []);

  const handleImagePress = (index) => {
    navigation.navigate('Fullimage', { images, initialIndex: index });
  };

  const handleLongPress = (image) => {
    setSelectedImage(image);
    setModalVisible(true);
  };

  const handleDelete = async () => {
    try {
      await RNFS.unlink(selectedImage.uri);
      setImages(images.filter(img => img.id !== selectedImage.id));
      setModalVisible(false);
      Alert.alert("Image deleted successfully");
    } catch (error) {
      console.error('Error deleting file:', error);
      Alert.alert("Error", "Failed to delete the image");
    }
  };

  const handleRename = async () => {
    const newPath = `${playlist}/${input}`;
    try {
      await RNFS.moveFile(selectedImage.uri, newPath);
      setImages(images.map(img => (img.id === selectedImage.id ? { ...img, id: input, uri: 'file://' + newPath } : img)));
      setRenameModalVisible(false);
      setModalVisible(false);
      Alert.alert("Image renamed successfully");
    } catch (error) {
      console.error('Error renaming file:', error);
      Alert.alert("Error", "Failed to rename the image");
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        url: selectedImage.uri,
        message: 'Check out this image!',
      });
      setModalVisible(false);
    } catch (error) {
      console.error('Error sharing file:', error);
      Alert.alert("Error", "Failed to share the image");
    }
  };

  const renderImage = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => handleImagePress(index)}
      onLongPress={() => handleLongPress(item)}
      delayLongPress={100}
      style={styles.imageContainer}
    >
      <Image source={{ uri: item.uri }} style={styles.image} />
      <Text style={{ marginLeft: 5, marginTop: 4, color: isDarkMode ? 'white' : 'black' }}>{item.id}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? 'black' : 'white' }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 18, color: !isDarkMode ? 'black' : '#f5f5f5' }}>{`<--`}</Text>
        </TouchableOpacity>
        <Text style={[styles.playlistText, { color: !isDarkMode ? 'black' : '#f5f5f5' }]}>{playlistname}</Text>
      </View>

      {images.length > 0 ? (
        <FlatList
          data={images}
          keyExtractor={(item) => item.id}
          renderItem={renderImage}
          numColumns={3}
          columnWrapperStyle={styles.row}
        />
      ) : (
        <Text style={styles.noImageText}>No images in this playlist</Text>
      )}

      {/* Options Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: isDarkMode ? 'black' : '#f5f5f5', borderColor: isDarkMode ? '#ccc' : '', borderWidth: isDarkMode ? 2 : 0 }]}>
            <TouchableOpacity style={styles.modalButton} onPress={handleShare}>
              <Text style={[styles.modalButtonText, { color: isDarkMode ? 'white' : 'blue' }]}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={() => setRenameModalVisible(true)}>
              <Text style={[styles.modalButtonText, { color: isDarkMode ? 'white' : 'blue' }]}>Rename</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={handleDelete}>
              <Text style={[styles.modalButtonText, { color: isDarkMode ? 'white' : 'blue' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Rename Modal */}
      <Modal
        visible={renameModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setRenameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.renameModalContainer, { backgroundColor: isDarkMode ? 'black' : '#f5f5f5', borderColor: isDarkMode ? '#ccc' : '', borderWidth: isDarkMode ? 2 : 0 }]}>
            <Text style={[styles.renameTitle, { color: isDarkMode ? 'white' : 'black', marginBottom: 12, fontWeight: 'bold' }]}>Rename Image</Text>
            <TextInput
              style={[styles.renameInput, { borderColor: isDarkMode ? 'white' : 'black' }]}
              placeholder="Enter new name"
              value={input}
              onChangeText={setInput}
              placeholderTextColor={isDarkMode ? 'white' : 'black'}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <TouchableOpacity style={[styles.button, { backgroundColor: isDarkMode ? '#444' : '#48A2EB' }]} onPress={() => setRenameModalVisible(false)}>
                <Text style={{ color: isDarkMode ? 'white' : 'white' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor: isDarkMode ? '#555' : '#48A2EB' }]} onPress={handleRename}>
                <Text style={{ color: isDarkMode ? 'white' : 'white' }}>Rename</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  button: {
    width: '40%',
    height: 45,
    paddingVertical: 10,
    marginTop: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  backButton: { borderRadius: 4, height: 32, borderColor: 'black', borderWidth: 2, width: 50, justifyContent: 'center', alignItems: 'center' },
  playlistText: { fontSize: 20, marginLeft: '30%' },
  row: { justifyContent: 'space-between' },
  imageContainer: { flex: 1, margin: 5, marginBottom: 7 },
  image: { width: '100%', height: 100, borderRadius: 10 },
  noImageText: { fontSize: 16, color: 'gray', textAlign: 'center', marginTop: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '80%', padding: 20, borderRadius: 10 },
  modalButton: { padding: 10 },
  modalButtonText: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  renameModalContainer: { width: '80%', padding: 20, borderRadius: 10 },
  renameTitle: { fontSize: 18, textAlign: 'center' },
  renameInput: { height: 40, borderColor: 'gray', borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 15, color: 'black' },
});

export default Showimage;
