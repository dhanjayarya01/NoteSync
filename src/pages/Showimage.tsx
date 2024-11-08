import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import RNFS from 'react-native-fs';

const Showimage = ({ route, navigation }) => {
  const { playlist, playlistname } = route.params;
  const [images, setImages] = useState([]);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const files = await RNFS.readDir(playlist);
        const imageFiles = files
          .filter(file => file.isFile() && /\.(jpg|jpeg|png)$/i.test(file.name))
          .map(file => ({
            id: file.name,
            uri: 'file://' + file.path,
            mtime: file.mtime, // modification time to sort by date
          }))
          .sort((a, b) => b.mtime - a.mtime); // Sort newest images first

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

  const renderImage = ({ item, index }) => (
    <TouchableOpacity onPress={() => handleImagePress(index)} style={styles.imageContainer}>
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
});

export default Showimage;
