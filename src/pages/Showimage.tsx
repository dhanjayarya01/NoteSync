import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Modal, Alert, TextInput, Button } from 'react-native';
import React, { useEffect, useState } from 'react';
import RNFS from 'react-native-fs';

const Showimage = ({ route, navigation }) => {
  const { playlist, playlistname } = route.params;
  const [images, setImages] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [input, setInput] = useState('');

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

  const handleEdit = () => {
    setModalVisible(false);
    navigation.navigate('EditImageScreen', { imageUri: selectedImage.uri });
  };

  const renderImage = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => handleImagePress(index)}
      onLongPress={() => handleLongPress(item)}
      delayLongPress={100}
      style={styles.imageContainer}
    >
      <Image source={{ uri: item.uri }} style={styles.image} />
      <Text style={{ marginLeft: 5, marginTop: 4 }}>{item.id}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.playlistText}>{playlistname}</Text>
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
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.modalButton} onPress={handleEdit}>
              <Text style={styles.modalButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setModalVisible(false);
                setRenameModalVisible(true);
              }}
            >
              <Text style={styles.modalButtonText}>Rename</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={handleDelete}>
              <Text style={styles.modalButtonText}>Delete</Text>
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
          <View style={styles.renameModalContainer}>
            <Text style={styles.renameTitle}>Rename Image</Text>
            <TextInput
              style={styles.renameInput}
              placeholder="Enter new name"
              value={input}
              onChangeText={setInput}
            />
            <View style={{flexDirection:'row', justifyContent:'space-between',width:'100%'}}>
            <Button title="Cancel" onPress={() => setRenameModalVisible(false)} />
            <Button title="Rename" onPress={handleRename} />

            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  playlistText: {
    fontSize: 18,
    marginBottom: 10,
    marginLeft: 6,
  },
  row: {
    justifyContent: 'space-between',
  },
  imageContainer: {
    flex: 1,
    margin: 5,
    marginBottom: 7,
  },
  image: {
    width: '100%',
    height: 100,
    borderRadius: 10,
  },
  noImageText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalButton: {
    padding: 10,
  },
  modalButtonText: {
    fontSize: 18,
    color: 'blue',
    textAlign: 'center',
  },
  renameModalContainer: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  renameTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  renameInput: {
    width: '100%',
    borderBottomWidth: 1,
    marginBottom: 15,
    fontSize: 16,
    padding: 5,
  },
});

export default Showimage;
