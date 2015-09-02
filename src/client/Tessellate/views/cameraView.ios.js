var React = require('react-native');

var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Modal,
  Image,
 
} = React;
var Camera = require('react-native-camera');


var CameraView = React.createClass({
  getInitialState() {
    return {
      cameraType: Camera.constants.Type.back,
      capturedImage: 'placeholder.img',
      imageCaptured: false
    }
  },

  render() {

    var imageBackground = { 
      opacity: this.state.imageCaptured ? 1: 0,
      backgroundColor: this.state.imageCaptured ? 'rgba(0, 0, 0, 0.5)' : '#f5fcff',
    }
    return (

      <Camera
              ref="cam"
              style={styles.container}
              type={this.state.cameraType}
      >
        
        <View>
        <Image style={[styles.capturedImageContainer, imageBackground]} source={{uri: this.state.capturedImage}}/>
        </View>
          
        <TouchableHighlight style= {styles.switchButton} 
         onPress={this._switchCamera}>
            <Text>Switch View</Text>
          </TouchableHighlight>

        <TouchableHighlight style={styles.button}
          onPress={this._takePicture}>
            <Text style={styles.buttonText}>Take Picture</Text>
        </TouchableHighlight>

        </Camera>
     
    );
  },

  //switch camera view
  _switchCamera() {
    var state = this.state;
    state.cameraType = state.cameraType === Camera.constants.Type.back
      ? Camera.constants.Type.front : Camera.constants.Type.back;
    this.setState(state);
  },

  //take picture
  _takePicture() {
    var self = this;
    this.refs.cam.capture(function(err, data) {
     self.setState({imageCaptured:true});
     self.setState({capturedImage:data.toString()},function(){
     })
    });
  }

});





var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: 'transparent',
  },
  switchButton: {
    position:'absolute',
        top:60,
        left:0,
        height: 20,
        width:90,
        backgroundColor: 'grey',
        borderRadius: 8,

  },
  button: {
        position:'absolute',
        bottom:50,
        left:100,
        height: 36,
        width:160,
        backgroundColor: 'grey',
        borderRadius: 8,

    },
   buttonText: {
        fontSize: 12,
        color: 'white',
        alignSelf: 'center'
    },
   capturedImageContainer : {

     position:'relative',
        top:0,
        left:0,
        height: 520,
        width:520,
        borderRadius: 8, 
   }
  

});


module.exports = CameraView;