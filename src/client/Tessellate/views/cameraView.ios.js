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
      capturedImage: 'assets-library://asset/asset.JPG?id=291C00B0-0088-48A1-AB2C-3EC9523806B2&ext=JPG'
    }
  },

  render() {


    return (
        <Camera
                ref="cam"
                style={styles.container}
                type={this.state.cameraType}
              >
              <Image style={styles.capturedImageContainer} source={{uri: this.state.capturedImage}}/>
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
      //console.log(err, data.toString());
      console.log('Current State: ' + self.state.capturedImage);
     self.state.capturedImage = data.toString();
     console.log('New State: ' + self.state.capturedImage);
     self.setState({capturedImage:data.toString()},function(){
      console.log('state changed');
     })
      self.render();
    });
  }

});





var styles = StyleSheet.create({
  container: {
    flex: 1,
    position:'relative',
    justifyContent: 'center',
    alignItems: 'center',
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
     position:'absolute',
        top:160,
        left:50,
        height: 120,
        width:190,
        backgroundColor: 'grey',
        borderRadius: 8, 
   
   }
  

});
/*
<Camera
        ref="cam"
        style={styles.container}
        type={this.state.cameraType}
      >
         <TouchableHighlight style= {styles.switchButton} 
       onPress={this._switchCamera}>
          <Text>Switch View</Text>
        </TouchableHighlight>

        <TouchableHighlight style={styles.button}
        onPress={this._takePicture}>
          <Text style={styles.buttonText}>Take Picture</Text>
        </TouchableHighlight>
  </Camera>

*/

module.exports = CameraView;