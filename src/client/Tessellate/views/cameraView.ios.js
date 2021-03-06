var React = require('react-native');

var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Image,
  AlertIOS,

} = React;

//External Components
var Camera = require('react-native-camera');
var ReviewPhoto = require('./reviewPhotoView.ios')
var ProgressHUD = require('react-native-progress-hud');

var CameraView = React.createClass({

  mixins: [ProgressHUD.Mixin],

  getInitialState() {
    return {
      cameraType: Camera.constants.Type.back,
      eventCode: this.props.eventCode,
      facebookId: this.props.facebookId,
    }
  },

  render() {

     return (<Camera
        ref="cam"
        style={styles.container}
        type={this.state.cameraType}
        captureTarget={Camera.constants.CaptureTarget.cameraRol}
      >

        <TouchableHighlight style={styles.goHome} underlayColor={'transparent'}>
           <Image resizeMode='contain' style={styles.goHomeButton} source={require('image!tHeader')}/>
        </TouchableHighlight>
        <TouchableHighlight style={styles.button}
        onPress={this._takePicture} underlayColor={'transparent'}>
          <Image resizeMode='contain' style={styles.takePic} source={require('image!takePictureIcon')}/>
        </TouchableHighlight>
        <ProgressHUD isVisible={this.state.is_hud_visible} isDismissible={false} overlayColor="rgba(0, 0, 0, 0.11)" /> 
      </Camera>)
    
  },

  /**
   * [_switchCamera Toggle Camera Angle]
   * @return {[null]} [no return value]
   */
  _switchCamera() {
    var state = this.state;
    state.cameraType = state.cameraType === Camera.constants.Type.back
      ? Camera.constants.Type.front : Camera.constants.Type.back;
    this.setState(state);
  },

  /**
   * [_takePicture Captures Image and routes user to ReviewPhotoView]
   * @return {[null]} [none]
   */
  _takePicture() {

    var self = this;
    self.showProgressHUD();

    this.refs.cam.capture(function(err, data) {
      if (err){
        self.dismissProgressHUD();
        
        AlertIOS.alert(
           'Whoa! Something Went Wrong.',
           err.message,
           [
             {text: 'Try Again', onPress: () => {
              return;
             }}
           ]
         );

        return;
      }
      if (data){
        var photoURL = data.toString();

      } else {
        //alert- something went wrong,please retake that picture
        AlertIOS.alert(
           'Whoa! Something Went Wrong.',
           'We are working to fix it!',
           [
             {text: 'Try Again', onPress: () => {
              return;
             }}
           ]
         );
       
      }
      //navigate to review photo page
      if (photoURL){
        
        self.props.mainNavigator.push({
          title: 'Review Photo',
          component:ReviewPhoto,
          passProps: {photo:photoURL,
          mainNavigator: self.props.mainNavigator,
          eventCode: self.state.eventCode,
          selectedTab:self.props.selectedTab,
          facebookId:self.state.facebookId }
        })
        self.dismissProgressHUD();
      } 
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
  button: {
        position:'absolute',
        bottom:55,
        left:135,
        backgroundColor: 'transparent',
        borderRadius: 8,

    },
   buttonText: {
        fontSize: 12,
        color: 'white',
        alignSelf: 'center'
    },
    takePic: {
      width:100,
      height:100,
  
    },
    goHome: {
      position:'absolute',
      top:7,
      left:80,
      opacity:.8, 
      height:50,
      width:50,
      backgroundColor:'transparent',
    },
    goHomeButton:{
     position:'absolute',
      top:7,
      left:80,
      opacity:.8, 
      height:50,
      width:50,
      backgroundColor:'transparent',
    },
    progress: {
      position:'relative'
    }

});

module.exports = CameraView;