import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ImageBackground, Modal, TextInput, Button, useColorScheme, Dimensions, Alert } from 'react-native';
import RNFS, { appendFile } from 'react-native-fs';  
import { launchCamera } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';


const Homepage = () => {

 const navigation=useNavigation()

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [FileName_modalVisible, setFileName_modalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false); // State to toggle edit mode
  const [playlistToEdit, setPlaylistToEdit] = useState(null); // Store playlist being edited
  const screenWidth = Dimensions.get('window').width;
  const itemWidth = screenWidth / 3 - 20;
  const [image_filename, setImage_filename] = useState("");
  const [toggle_FileName_Checkbox,setToggle_FileName_Checkbox]=useState(false)
  const [filename_start_no,setFilename_start_no]=useState(0)
  const [capturedImagePath,setCapturedImagePath]=useState('')
  const [capturedPlaylistPath,setCapturedPlaylistPath]=useState('')
  const [renamemodel,setRenamemodel]=useState(false)

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
      // console.log("the playlist path",playlists)
    } catch (error) {
      // Alert.alert("CREATE YOU FIRST PLAYLIST")
      console.error('Error loading playlists:', error);
    }
  };

  useEffect(() => {
    loadPlaylists(); 
  }, [playlists]);

  const openCamera = async (item_path, item_name) => {
    console.log("the name of the ",item_name)
    setNewPlaylistName(item_name.trim())

    launchCamera({ mediaType: 'photo' }, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera picker');
        setCapturedImagePath('')
        setCapturedPlaylistPath('')
        setImage_filename('')
        setFileName_modalVisible(false)
        setToggle_FileName_Checkbox(false)
      } else if (response.errorCode) {
        console.log('Camera error: ', response.errorMessage);
      } else {
        try {

          setFileName_modalVisible(true)
          const capturedImagePaths = response.assets[0].uri;
          setCapturedImagePath(capturedImagePaths)
          setCapturedPlaylistPath(item_path)
          setImage_filename(item_name)

          if(toggle_FileName_Checkbox){
             setFileName_modalVisible(false)
             Handle_filename_filling()

          }
          console.log("the capture path ",capturedImagePaths)

        } catch (error) {
          console.error('Error saving image:', error);
        }
      }
    });
  };
  
  const renderPlaylistItem = ({ item }) => (
    
    <TouchableOpacity
      style={[styles.playlistContainer, { width: itemWidth }]}
      onPress={() => editMode?handlePlaylistOptions(item):openCamera(item.id,item.name)} 
      onLongPress={()=>navigation.navigate('Showimage',{playlist:item?.id,playlistname:item?.name})}
      delayLongPress={200}
    >
      <ImageBackground 
        source={require('../public/file.png')} 
        style={styles.playlistImage} 
        imageStyle={{ borderRadius: 10 }}
      >
        <View style={styles.imgbox}></View>
      </ImageBackground>
      <View style={styles.textContainer}>
        <Text style={[styles.playlistText, { color: isDarkMode ? '#ffffff' : '#333333' }]}>{item.name}</Text>
      </View>
      
    </TouchableOpacity>
  );

  const handlePlaylistOptions = (playlist) => {
    setPlaylistToEdit(playlist);
    Alert.alert(
      'Playlist Options',
      'Choose an option:',
      [
        {
          text: 'Cancel',
          onPress: () => cancelEdit(),
        },
        {
          text: 'Rename',
          onPress: () =>setRenamemodel(true),
        },
        {
          text: 'Delete',
          onPress: () => deletePlaylist(playlist),
        }
        
      ]
    );
  };





  const renamePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      Alert.alert('Error', 'Please enter a new playlist name.');
      return;
    }
    try {
      const oldPath = playlistToEdit.id;
      const newPath = `${RNFS.ExternalDirectoryPath}/Notesync/${newPlaylistName}`;
      const folderExists = await RNFS.exists(newPath);
      if (folderExists) {
        Alert.alert('Error', 'A playlist with this name already exists.');
        return;
      }
      await RNFS.moveFile(oldPath, newPath);
      setRenamemodel(false);
      setNewPlaylistName('');
      loadPlaylists();
    } catch (error) {
      console.error('Error renaming playlist:', error);
      Alert.alert('Error', 'An error occurred while renaming the playlist.');
    }
  };
  

  const deletePlaylist = async (playlist) => {
    try {
      await RNFS.unlink(playlist.id); 
      console.log(`Deleted playlist: ${playlist.name}`);
      loadPlaylists(); 
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };

  
  const createPlaylistFolder = async (playlistName) => {
    try {
      const folderPath = RNFS.ExternalDirectoryPath + '/Notesync/' + playlistName;
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

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const cancelEdit = () => {
    setEditMode(false); // Reset edit mode
    setPlaylistToEdit(null); // Clear selected playlist for editing
  };

  const Handle_checkbox_click=()=>{
     setToggle_FileName_Checkbox(!toggle_FileName_Checkbox)
     
  }


  const incrementFilenameStartNo = () => {
    return new Promise((resolve) => {
      setFilename_start_no((prev) => {
        resolve(prev + 1); 
        return prev + 1;
      });
    });
  };

  const Handle_filename_filling =async()=>{
    try {
      setFileName_modalVisible(false)
    
      const step= await incrementFilenameStartNo();
      
      const fileName = `${image_filename}_${step}.jpg`; 
  
      const destinationPath = `${capturedPlaylistPath}/${fileName}`;
  
      await RNFS.copyFile(capturedImagePath, destinationPath);
      console.log(`Image saved to ${destinationPath}`);
       openCamera(capturedPlaylistPath,image_filename)
      setCapturedImagePath('')
      setCapturedPlaylistPath('')
      setImage_filename('')
    } catch (error) {
      console.log("error while saving the file ",error)
    }

  }

  return (
    <View style={[styles.container, isDarkMode ? styles.darkBackground : styles.lightBackground]}>
       <View style={[styles.header, isDarkMode ? styles.darkHeader : styles.lightHeader]}>
          <Text style={[styles.title, isDarkMode ? styles.darkTitle : styles.lightTitle]}>NOTE SYNC</Text>
        </View>
      <FlatList
        data={playlists}
        renderItem={renderPlaylistItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.playlistGrid}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.bottomButtons}>
        {editMode && (
          <TouchableOpacity 
            style={[isDarkMode ? styles.darkButton : styles.lightButton]} 
            onPress={cancelEdit}
          >
            <Text style={[isDarkMode ? styles.darkText : styles.lightText]}>CANCEL</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[isDarkMode ? styles.darkButton : styles.lightButton]} 
          onPress={toggleEditMode}
        >
          <Text style={[isDarkMode ? styles.darkText : styles.lightText]}>
            {editMode ? 'DONE' : 'EDIT LIST'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[isDarkMode ? styles.darkButton : styles.lightButton]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={[isDarkMode ? styles.darkText : styles.lightText]}>ADD NEW</Text>
        </TouchableOpacity>
      </View>
{/*model for new playlist */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent,{backgroundColor:isDarkMode?'black':'#f5f5f5',borderColor:isDarkMode?'#ccc':'',borderWidth:isDarkMode?2:0}]}>
            <Text style={[styles.modalTitle,{color:isDarkMode?'white':'black'}]}>
              Enter Playlist Name
            </Text>
            <TextInput
              style={[styles.input,{color:isDarkMode?'white':'black'}]}
              placeholder="Playlist Name"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              placeholderTextColor={isDarkMode?'white':'black'}
            />
            <View style={styles.modalButtons}>
            <TouchableOpacity
               style={[styles.button, { backgroundColor: isDarkMode ? '#555' : '#48A2EB' }]}
               onPress={() => setModalVisible(false)}
               >
              <Text style={{ color: isDarkMode ? 'white' : 'white' }}>Cancel</Text>
              </TouchableOpacity>

             <TouchableOpacity
             style={[styles.button, { backgroundColor: isDarkMode ? '#555' : '#48A2EB' }]}
             onPress={addNewPlaylist}
           >
        <Text style={{ color: isDarkMode ? 'white' : 'white' }}>OK</Text>
      </TouchableOpacity>
              {/* <TouchableOpacity><Text>ok</Text></TouchableOpacity> */}
            </View>
          </View>
        </View>
      </Modal>
{/*rename model*/}
      <Modal
        animationType="slide"
        transparent={true}
        visible={renamemodel}
        onRequestClose={() => setRenamemodel(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent,{backgroundColor:isDarkMode?'black':'#f5f5f5',borderColor:isDarkMode?'#ccc':'',borderWidth:isDarkMode?2:0}]}>
            <Text style={[styles.modalTitle,{color:isDarkMode?'white':'black'}]}>
              Enter New Playlist Name
            </Text>
            <TextInput
              style={[styles.input,{color:isDarkMode?'white':'black'}]}
              placeholder="New Playlist Name"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              placeholderTextColor={isDarkMode?'white':'black'}
              
            />
            <View style={styles.modalButtons}>
            <TouchableOpacity
               style={[styles.button, { backgroundColor: isDarkMode ? '#555' : '#48A2EB' }]}
               onPress={() => setRenamemodel(false)}
               >
              <Text style={{ color: isDarkMode ? 'white' : 'white' }}>Cancel</Text>
              </TouchableOpacity>

             <TouchableOpacity
             style={[styles.button, { backgroundColor: isDarkMode ? '#555' : '#48A2EB' }]}
             onPress={renamePlaylist}
           >
        <Text style={{ color: isDarkMode ? 'white' : 'white' }}>OK</Text>
      </TouchableOpacity>
              {/* <TouchableOpacity><Text>ok</Text></TouchableOpacity> */}
            </View>
          </View>
        </View>
      </Modal>
{/* model for image name input*/}
      {newPlaylistName && <Modal
        animationType="slide"
        transparent={true}
        visible={FileName_modalVisible}
        onRequestClose={() => setFileName_modalVisible(false)}
      >
        <View style={[styles.modalContainer,]}>
          <View style={[styles.modalContent,{backgroundColor:isDarkMode?'black':'#f5f5f5',borderColor:isDarkMode?'#ccc':'',borderWidth:isDarkMode?2:0}]}>
            <Text style={[styles.modalTitle,{color:isDarkMode?'white':'black'}]}>Enter filename</Text>
            <TextInput
              style={[styles.input,{color:isDarkMode?'white':'black'}]}
              placeholder={`${newPlaylistName}_5...jpg`}
              value={image_filename}
              onChangeText={setImage_filename}
              placeholderTextColor={isDarkMode?'white':'black'}
            />
             <View style={{ backgroundColor: isDarkMode ? '#333' : '#fff', padding: 20 }}>
      <TouchableOpacity 
        style={{ height: 32, width: '100%', flexDirection: 'row', marginBottom: 14}}
        onPress={Handle_checkbox_click}
      >
        <ImageBackground
          source={toggle_FileName_Checkbox ? require('../public/checkbox.png') : require('../public/unchecked.png')}
          style={{ height: '95%', width: 22, }}
        > 
          <View style={{ height: '100%', width: '100%' }}></View>
        </ImageBackground>
        <View style={{ justifyContent: 'center', flex: 1 }}>
          <Text style={{ paddingLeft: 10, fontSize: 14, color: isDarkMode ? '#fff' : '#000' }}>
            Apply this name to all next photos
          </Text>
        </View>
      </TouchableOpacity>

      {toggle_FileName_Checkbox && 
        <>
          <Text style={{ fontSize: 16, color: isDarkMode ? '#fff' : '#000', marginBottom: 8 }}>
            Please enter the starting number for the filename sequence:
          </Text>
          <TextInput
            style={{
              height: 40,
              borderColor: isDarkMode ? '#fff' : '#000',
              borderWidth: 1,
              borderRadius: 5,
              marginBottom:14,
              paddingHorizontal: 10,
              color: isDarkMode ? '#fff' : '#000',
              backgroundColor: isDarkMode ? '#444' : '#f5f5f5'
            }}
            placeholder="1, 2, 4, 5, ..."
            value={filename_start_no === '' ? '' : String(filename_start_no)}
            onChangeText={(text) => setFilename_start_no(text === '' ? '' : parseInt(text, 10))}
            placeholderTextColor={isDarkMode ? '#ccc' : '#888'}
          />
        </>
      }

      <Button title="OK" onPress={Handle_filename_filling} color={isDarkMode ? '#444' : '#007AFF'} />
    </View>
          </View>
        </View>
      </Modal>}
    </View>
  );
};

export default Homepage;

const styles = StyleSheet.create({
  checkbox:{
  height:25,
  width:24,
  },

  button: {
    width:'40%',          
    height: 45,             
    paddingVertical: 10,    
    marginTop: 10,          
    borderRadius: 8,        
    justifyContent: 'center', 
    alignItems: 'center', 
       
  },
  header: {
    padding: 12,
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
  container: {
    flex: 1,
 
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
    position: 'relative',
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
    color: 'white',
    fontWeight: 'bold',
  },
  darkText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingLeft: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
}); 